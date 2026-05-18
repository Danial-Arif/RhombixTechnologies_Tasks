import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";

export const authOptions = {
    // No adapter — JWT strategy handles everything
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email.toLowerCase() });
                if (!user) {
                    throw new Error("No account found with this email");
                }

                if (!user.password) {
                    throw new Error("This account uses Google sign-in. Please use Google to log in.");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image || "",
                    username: user.username,
                };
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Handle Google sign-in — create or update user in DB
            if (account?.provider === "google") {
                await connectDB();
                const existing = await User.findOne({ email: user.email.toLowerCase() });

                if (existing) {
                    // Update image if changed
                    if (profile?.picture && existing.image !== profile.picture) {
                        existing.image = profile.picture;
                        await existing.save();
                    }
                    user.id = existing._id.toString();
                    user.username = existing.username;
                    user.image = existing.image || profile?.picture || "";
                } else {
                    // Create new user from Google profile
                    const baseUsername = user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
                    let username = baseUsername;
                    let counter = 1;
                    while (await User.findOne({ username })) {
                        username = `${baseUsername}_${counter}`;
                        counter++;
                    }

                    const newUser = await User.create({
                        name: user.name,
                        email: user.email.toLowerCase(),
                        image: user.image || profile?.picture || "",
                        username,
                        password: null, // OAuth user
                    });
                    user.id = newUser._id.toString();
                    user.username = newUser.username;
                    user.image = newUser.image;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.image = user.image;
            }
            // Allow session updates
            if (trigger === "update" && session) {
                token.name = session.name || token.name;
                token.image = session.image || token.image;
                token.username = session.username || token.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.image = token.image;
            }
            return session;
        },
    },

    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };