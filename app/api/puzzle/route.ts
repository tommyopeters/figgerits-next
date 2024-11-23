import {  NextResponse } from 'next/server';

import PuzzleModel from "@/lib/models/puzzle.model";
import UserModel from "@/lib/models/user.model";
import { auth } from '@clerk/nextjs/server';

import { connect } from "@/lib/db";

export async function GET() {
  connect();
  try {
    const { userId, } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'User not logged in' }), { status: 401 });
    }
    console.log(userId);
    // Retrieve the user by user ID
    const user = await UserModel.findOne({ uid: userId });
    if (!user) {
      // return res.status(404).json({ message: 'User not found' });
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const currentPuzzle = user?.puzzleProgress?.find(progress => !progress.completed && !progress.skipped);
    if (currentPuzzle) {
      const puzzle = await PuzzleModel.findById(currentPuzzle.puzzleId);
      // const encryptedPuzzle = encrypt(JSON.stringify(puzzle));
      // res.status(200).json({ puzzle: encryptedPuzzle });
      // res.status(200).json({ puzzle });
      return NextResponse.json(puzzle);
    } else {
      // Get the list of puzzles already in the puzzleProgress array
      const playedPuzzles = user?.puzzleProgress?.map(progress => progress.puzzleId);

      // Find a random puzzle that is not in the puzzleProgress array
      const [puzzle] = await PuzzleModel.aggregate([
        { $match: { _id: { $nin: playedPuzzles } } },
        { $sample: { size: 1 } }
      ]);

      if (!puzzle) {
        // return res.status(404).json({ message: 'No new puzzles available' });
        return NextResponse.json({ message: 'No new puzzles available' }, { status: 404 });
      }


      // Add the newly picked puzzle to the puzzleProgress array
      user?.puzzleProgress?.push({
        puzzleId: puzzle._id,
        completed: false,
        skipped: false,
        cluesUsed: 0,
        attempts: 0,
        timeTaken: 0,
      });
      await user.save();

      // const encryptedPuzzle = encrypt(JSON.stringify(puzzle));
      // res.status(200).json({ puzzle: encryptedPuzzle });
      return NextResponse.json( puzzle );
    }


  } catch (error) {
    console.error(error);
    // res.status(500).send({ error: "An error occurred while fetching the puzzle." });
    return NextResponse.json({ message: 'An error occurred while fetching the puzzle.' }, { status: 404 });
  }

}