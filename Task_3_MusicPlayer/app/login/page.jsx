"use client";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // If already logged in → redirect to home
    useEffect(() => {
        if (session) {
            router.push("/");
        }
    }, [session]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-black text-white">

            <div className="w-[350px] p-8 rounded-xl bg-[#111] border border-[#222] flex flex-col gap-6 text-center">

                {/* Logo */}
                <h1 className="text-3xl font-bold text-[#6FFBBE]">
                    My Music
                </h1>

                <p className="text-gray-400 text-sm">
                    Sign in to continue listening
                </p>

                {/* Google Login Button */}
                <button
                    onClick={() => signIn("google")}
                    className="bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition"
                >
                    Continue with Google
                </button>

                <p className="text-xs text-gray-500">
                    By continuing, you agree to the terms.
                </p>

            </div>

        </div>
    );
}
