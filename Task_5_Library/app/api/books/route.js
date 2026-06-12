import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import clientPromise from "@/lib/mongoClient";
import fs from "fs/promises";
import path from "path";

async function enrichUploaderNames(books) {
    const bookList = books.map((book) => (book.toObject ? book.toObject() : { ...book }));
    const emailsToLookup = [
        ...new Set(
            bookList
                .filter((book) => !book.uploadedByName && book.uploadedBy)
                .map((book) => book.uploadedBy)
        ),
    ];

    if (emailsToLookup.length === 0) return bookList;

    const client = await clientPromise;
    const users = await client
        .db()
        .collection("users")
        .find({ email: { $in: emailsToLookup } })
        .project({ email: 1, name: 1 })
        .toArray();

    const nameByEmail = Object.fromEntries(
        users.map((user) => [user.email, user.name])
    );

    return bookList.map((book) => ({
        ...book,
        uploadedByName: book.uploadedByName || nameByEmail[book.uploadedBy] || "Unknown",
    }));
}

// Check if Cloudinary has been configured with actual credentials
function isCloudinaryConfigured() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    return (
        cloudName && cloudName !== "your_cloud_name" &&
        apiKey && apiKey !== "your_api_key" &&
        apiSecret && apiSecret !== "your_api_secret"
    );
}

// Local upload fallback helper
async function uploadToLocal(file, subfolder) {
    const buffer = Buffer.from(await file.arrayBuffer());
    // Create unique filename to avoid collision
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    
    // Return relative URL for client usage
    return `/uploads/${subfolder}/${filename}`;
}

export async function GET(req) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || 'title';
        const category = searchParams.get('category') || '';
        
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }
        if (category && category !== 'All') {
            query.category = category;
        }

        const sortOption = {};
        if (sort === 'title') sortOption.title = 1;
        if (sort === 'author') sortOption.author = 1;
        if (sort === 'recent') sortOption.createdAt = -1;

        const skip = (page - 1) * limit;

        const total = await Book.countDocuments(query);
        const books = await Book.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const enrichedBooks = await enrichUploaderNames(books);

        return NextResponse.json({
            books: enrichedBooks,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
    }
}

// Helper to upload file buffer to Cloudinary
async function uploadToCloudinary(buffer, folder, resourceType = "auto") {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const formData = await req.formData();
        
        const title = formData.get("title");
        const author = formData.get("author");
        const category = formData.get("category") || "Others";
        const coverFile = formData.get("coverFile");
        const pdfFile = formData.get("pdfFile");

        if (!title || !author) {
            return NextResponse.json({ error: "Title and author are required" }, { status: 400 });
        }

        let coverImage = "";
        let pdfUrl = "";

        // Upload Cover Image
        if (coverFile && coverFile instanceof File) {
            if (isCloudinaryConfigured()) {
                const buffer = Buffer.from(await coverFile.arrayBuffer());
                const result = await uploadToCloudinary(buffer, "bookvault_covers", "image");
                coverImage = result.secure_url;
            } else {
                console.log("Cloudinary not configured or using placeholders. Saving cover locally.");
                coverImage = await uploadToLocal(coverFile, "covers");
            }
        }

        // Upload PDF
        if (pdfFile && pdfFile instanceof File) {
            if (isCloudinaryConfigured()) {
                const buffer = Buffer.from(await pdfFile.arrayBuffer());
                const result = await uploadToCloudinary(buffer, "bookvault_pdfs", "raw");
                pdfUrl = result.secure_url;
            } else {
                console.log("Cloudinary not configured or using placeholders. Saving PDF locally.");
                pdfUrl = await uploadToLocal(pdfFile, "pdfs");
            }
        }

        const book = new Book({
            title,
            author,
            category,
            coverImage,
            pdfUrl,
            uploadedBy: session.user.email,
            uploadedByName: session.user.name || "Unknown"
        });

        await book.save();
        return NextResponse.json({ success: true, book }, { status: 201 });
    } catch (error) {
        console.error("Upload error details:", error);
        return NextResponse.json({ error: `Failed to upload book: ${error.message || error}` }, { status: 500 });
    }
}

