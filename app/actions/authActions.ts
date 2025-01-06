"use server"

import UserModel from "@/lib/models/user.model";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connect } from "@/lib/db";

export async function handleAuth() {
    await connect();
    const { userId } = await auth();
    const userObject = await currentUser();

    console.log(userId);

    if (!userObject || !userId) {
        return JSON.parse(JSON.stringify({ message: 'User not logged in' }));
    }

    let user = await UserModel.findOne({ uid: userId });
    if (!user) {
        user = new UserModel({
            uid: userId,
            email: userObject.emailAddresses[0].emailAddress,
            photoUrl: userObject.imageUrl,
            displayName: userObject.firstName,
            firstName: userObject.firstName,
            lastName: userObject.lastName,
        });
        await user.save();
        console.log('User created');
    } else {
        console.log('User already exists');
    }

    // Convert Mongoose document to plain object
    const plainUser = user.toObject();
    return JSON.parse(JSON.stringify(plainUser));
}