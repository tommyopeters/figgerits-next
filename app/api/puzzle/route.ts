import { NextResponse } from 'next/server';

import PuzzleModel from "@/lib/models/puzzle.model";
import UserModel from "@/lib/models/user.model";
import { auth } from '@clerk/nextjs/server';

import { connect } from "@/lib/db";
import { encodeLetters } from '@/utils/functions';

export async function GET() {
  connect();
  try {
    const { userId, } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'User not logged in' }), { status: 401 });
    }
    console.log(`userId: ${userId}`);
    // Retrieve the user by user ID
    const user = await UserModel.findOne({ uid: userId });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const currentPuzzle = user?.puzzleProgress?.find(progress => !progress.completed && !progress.skipped);
    if (currentPuzzle) {
      const puzzle = await PuzzleModel.findById(currentPuzzle.puzzleId);
      const puzzleData = {
        ...puzzle?.toObject(),
        encoding: currentPuzzle.encoding,
        completed: currentPuzzle.completed,
        skipped: currentPuzzle.skipped,
        hintsUsed: currentPuzzle.hintsUsed,
        attempts: currentPuzzle.attempts,
        timeTaken: currentPuzzle.timeTaken,
        userInput: currentPuzzle.userInput,
        actionThread: currentPuzzle.actionThread
      };
      return NextResponse.json(puzzleData);
    } else {
      // Get the list of puzzles already in the puzzleProgress array
      const playedPuzzles = user?.puzzleProgress?.map(progress => progress.puzzleId);

      // Find a random puzzle that is not in the puzzleProgress array
      const [puzzle] = await PuzzleModel.aggregate([
        { $match: { _id: { $nin: playedPuzzles } } },
        { $sample: { size: 1 } }
      ]);

      if (!puzzle) {
        return NextResponse.json({ message: 'No new puzzles available' }, { status: 404 });
      } else {
        const encoding = encodeLetters(puzzle.quote);
        // Add the newly picked puzzle to the puzzleProgress array
        user?.puzzleProgress?.push({
          _id: puzzle._id,
          puzzleId: puzzle._id,
          completed: false,
          skipped: false,
          hintsUsed: 0,
          attempts: 0,
          timeTaken: 0,
          userInput: null,
          actionThread: null,
          encoding
        });
        await user.save();

        return NextResponse.json(puzzle);
      }


    }


  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred while fetching the puzzle.' }, { status: 500 });
  }

}

export async function POST(req: Request) {
  await connect();
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: 'User not logged in' }), { status: 401 });
    }
    const { puzzleId, completed, skipped, hintsUsed, attempts, timeTaken, userInput, actionThread } = await req.json();
    console.log(puzzleId, userInput)
    const user = await UserModel.findOne({ uid: userId });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const puzzleProgress = user.puzzleProgress.find(progress => progress.puzzleId.toString() === puzzleId);
    console.log('puzzleProgress found')
    if (puzzleProgress) {
      await UserModel.findOneAndUpdate(
        { uid: userId, 'puzzleProgress.puzzleId': puzzleId },
        {
          $set: {
            'puzzleProgress.$.completed': completed,
            'puzzleProgress.$.skipped': skipped,
            'puzzleProgress.$.hintsUsed': hintsUsed,
            'puzzleProgress.$.attempts': attempts,
            'puzzleProgress.$.timeTaken': timeTaken,
            'puzzleProgress.$.userInput': userInput,
            'puzzleProgress.$.actionThread': actionThread,
          },
        },
        { new: true }
      );

      return NextResponse.json({ done: completed, message: completed? 'Puzzle completed Successfully' : 'Puzzle progress updated successfully' });
    } else {
      // throw new Error('Puzzle not found in user progress');
      return NextResponse.json({ message: 'Puzzle not found in user progress' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Puzzle progress updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}