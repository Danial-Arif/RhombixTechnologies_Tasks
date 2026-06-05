import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongoClient";
import fs from "fs/promises";
import path from "path";
import BorrowRecord from "@/models/BorrowRecord";

async function enrichUploaderName(book) {
    const bookObj = book.toObject();
    if (bookObj.uploadedByName || !bookObj.uploadedBy) {
        bookObj.uploadedByName = bookObj.uploadedByName || "Unknown";
        return bookObj;
    }

    const client = await clientPromise;
    const user = await client
        .db()
        .collection("users")
        .findOne({ email: bookObj.uploadedBy }, { projection: { name: 1 } });

    bookObj.uploadedByName = user?.name || "Unknown";
    return bookObj;
}

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const book = await Book.findById(id);
        
        if (!book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }
        
        const session = await getServerSession(authOptions);
        let isBorrowedByMe = false;
        if (session && session.user) {
            const activeRecord = await BorrowRecord.findOne({
                userId: session.user.email,
                bookId: id,
                status: "borrowed"
            });
            isBorrowedByMe = !!activeRecord;
        }

        const bookObj = await enrichUploaderName(book);
        bookObj.isBorrowedByMe = isBorrowedByMe;

        return NextResponse.json(bookObj);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;
        const book = await Book.findById(id);

        if (!book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        if (book.uploadedBy !== session.user.email) {
            return NextResponse.json({ error: "Forbidden: You didn't upload this book" }, { status: 403 });
        }

        // Clean up local files if they exist
        if (book.coverImage && book.coverImage.startsWith("/uploads/")) {
            const localPath = path.join(process.cwd(), "public", book.coverImage);
            try {
                await fs.unlink(localPath);
            } catch (err) {
                console.error("Failed to delete local cover image:", err);
            }
        }
        if (book.pdfUrl && book.pdfUrl.startsWith("/uploads/")) {
            const localPath = path.join(process.cwd(), "public", book.pdfUrl);
            try {
                await fs.unlink(localPath);
            } catch (err) {
                console.error("Failed to delete local PDF file:", err);
            }
        }

        await Book.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
    }
}

