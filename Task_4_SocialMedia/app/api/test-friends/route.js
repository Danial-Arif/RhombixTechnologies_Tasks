import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        console.log("Connected successfully from API route!");

        // Create two test users
        const suffix = Date.now();
        const userA = await User.create({
            name: "Test User A",
            username: `testusera_${suffix}`,
            email: `testusera_${suffix}@example.com`,
            password: "hashedpassword",
        });

        const userB = await User.create({
            name: "Test User B",
            username: `testuserb_${suffix}`,
            email: `testuserb_${suffix}@example.com`,
            password: "hashedpassword",
        });

        console.log("Created test users in API route:", userA._id, userB._id);

        // Send friend request from User A to User B
        console.log("Sending request from A to B...");
        await User.findByIdAndUpdate(userA._id, {
            $addToSet: { "friendRequests.sent": userB._id },
        });
        await User.findByIdAndUpdate(userB._id, {
            $addToSet: { "friendRequests.received": userA._id },
        });

        // Let's verify B has received the request
        const checkB = await User.findById(userB._id);
        console.log("User B received requests:", checkB.friendRequests?.received);

        // Accept request by User B (target) of User A (userId)
        console.log("Accepting request (B accepts A)...");
        const userId = userB._id;
        const targetId = userA._id;

        await User.findByIdAndUpdate(userId, {
            $addToSet: { friends: targetId },
            $pull: { "friendRequests.received": targetId },
        });
        await User.findByIdAndUpdate(targetId, {
            $addToSet: { friends: userId },
            $pull: { "friendRequests.sent": userId },
        });

        // Check if friends were successfully added and requests pulled
        const finalA = await User.findById(userA._id);
        const finalB = await User.findById(userB._id);

        const results = {
            finalAFriends: finalA.friends,
            finalASent: finalA.friendRequests?.sent,
            finalBFriends: finalB.friends,
            finalBReceived: finalB.friendRequests?.received,
        };

        console.log("Results:", results);

        // Clean up
        await User.deleteOne({ _id: userA._id });
        await User.deleteOne({ _id: userB._id });
        console.log("Cleaned up successfully!");

        return NextResponse.json({ success: true, results });
    } catch (err) {
        console.error("Test failed with error:", err);
        return NextResponse.json({ success: false, error: err.message });
    }
}
