/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect } from "@/lib/db";

import UserModel from "@/lib/models/user.model";
import { auth, currentUser } from "@clerk/nextjs/server";
// import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export async function POST() {
  await connect();
  const { userId } = await auth();
  const userObject = await currentUser();


  console.log(userId);

  if (!userObject || !userId) {
    return new NextResponse(JSON.stringify({ message: 'User not logged in' }), { status: 401 });
  }

  const user = await UserModel.findOne({ uid: userId });
  if (!user) {
    const newUser = new UserModel({
      uid: userId,
      email: userObject.emailAddresses[0].emailAddress,
      photoUrl: userObject.imageUrl,
      displayName: userObject.firstName,
      firstName: userObject.firstName,
      lastName: userObject.lastName,

    });
    await newUser.save();
    return NextResponse.json(newUser, { status: 201 });
  }
  else {
    console.log('User already exists');
  }


  return NextResponse.json(userObject);
}