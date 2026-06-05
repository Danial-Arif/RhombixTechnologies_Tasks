import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BorrowRecord from "@/models/BorrowRecord";
import Book from "@/models/Book"; // Must import to register schema for populate
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET user's borrowing history
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        
        // Find records for the current user and populate book details
        const records = await BorrowRecord.find({ userId: session.user.email })
            .populate("bookId")
            .sort({ borrowedAt: -1 });

        return NextResponse.json({ success: true, records });
    } catch (error) {
        console.error("Failed to fetch borrow history:", error);
        return NextResponse.json({ error: "Failed to fetch borrow history" }, { status: 500 });
    }
}

// POST to borrow a book
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { bookId } = await req.json();

        if (!bookId) {
            return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
        }

        // Verify the book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        // Check if there is an active borrow record for this book and user
        const existingRecord = await BorrowRecord.findOne({
            userId: session.user.email,
            bookId,
            status: "borrowed"
        });

        if (existingRecord) {
            return NextResponse.json({ error: "You have already borrowed this book" }, { status: 400 });
        }

        // Create the borrow record
        const record = new BorrowRecord({
            userId: session.user.email,
            bookId,
            borrowedAt: new Date(),
            status: "borrowed"
        });

        await record.save();
        return NextResponse.json({ success: true, record }, { status: 201 });
    } catch (error) {
        console.error("Failed to borrow book:", error);
        return NextResponse.json({ error: "Failed to borrow book" }, { status: 500 });
    }
}
