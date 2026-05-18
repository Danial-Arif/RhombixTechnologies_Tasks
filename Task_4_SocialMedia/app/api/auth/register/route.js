import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDB();
        const { name, username, email, password } = await req.json();

        // Validate required fields
        if (!name || !username || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Check for existing user
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return NextResponse.json(
                { error: "This username is already taken" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        return NextResponse.json(
            {
                message: "Account created successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("POST /api/auth/register error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}
