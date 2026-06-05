import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./mongoClient"

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET
        })
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                session.user.name = user.name ?? session.user.name;
                session.user.email = user.email ?? session.user.email;
                session.user.image = user.image ?? session.user.image;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}
