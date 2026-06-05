import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BorrowRecord from "@/models/BorrowRecord";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// POST to return a borrowed book
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

        // Find active borrow record for this user and book
        const record = await BorrowRecord.findOne({
            userId: session.user.email,
            bookId,
            status: "borrowed"
        });

        if (!record) {
            return NextResponse.json({ error: "No active borrow record found for this book" }, { status: 404 });
        }

        // Update record
        record.status = "returned";
        record.returnedAt = new Date();
        await record.save();

        return NextResponse.json({ success: true, record });
    } catch (error) {
        console.error("Failed to return book:", error);
        return NextResponse.json({ error: "Failed to return book" }, { status: 500 });
    }
}
