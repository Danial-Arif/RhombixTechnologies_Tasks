import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BorrowRecord from "@/models/BorrowRecord";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const bookId = searchParams.get("bookId");

        if (!bookId) {
            return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
        }

        await connectDB();

        // Check if there is an active borrow record for this book and user
        const existingRecord = await BorrowRecord.findOne({
            userId: session.user.email,
            bookId,
            status: "borrowed"
        });

        return NextResponse.json({ success: true, isBorrowed: !!existingRecord, record: existingRecord });
    } catch (error) {
        console.error("Failed to check borrow status:", error);
        return NextResponse.json({ error: "Failed to check borrow status" }, { status: 500 });
    }
}
