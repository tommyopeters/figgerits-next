"use server"

import PuzzleModel from "@/lib/models/puzzle.model";
import UserModel from "@/lib/models/user.model";
import { auth } from '@clerk/nextjs/server';
import { connect } from "@/lib/db";
import { encodeLetters } from '@/utils/functions';
import { GeneralError, PuzzleNotFoundError, UnauthorizedError, UserNotFoundError } from '@/utils/errors';


export async function getPuzzleData() {
    await connect();
    try {
      const { userId } = await auth();
      console.log(userId);
      if (!userId) {
        throw new UnauthorizedError('User not logged in');
      }
      console.log(`userId: ${userId}`);
      const user = await UserModel.findOne({ uid: userId });
      if (!user) {
        throw new UserNotFoundError('User not found');
      }
  
      const currentPuzzle = user.puzzleProgress.find(progress => !progress.completed && !progress.skipped);
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
        return JSON.parse(JSON.stringify(puzzleData)); // Convert to plain object
      } else {
        const playedPuzzles = user.puzzleProgress.map(progress => progress.puzzleId);
        const [puzzle] = await PuzzleModel.aggregate([
          { $match: { _id: { $nin: playedPuzzles } } },
          { $sample: { size: 1 } }
        ]);
  
        if (!puzzle) {
          throw new PuzzleNotFoundError('No new puzzles available');
        } else {
          const encoding = encodeLetters(puzzle.quote);
          user.puzzleProgress.push({
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
  
          return JSON.parse(JSON.stringify(puzzle)); // Convert to plain object
        }
      }
    } catch (error) {
      console.error(error);
      if (error instanceof UserNotFoundError || error instanceof PuzzleNotFoundError || error instanceof UnauthorizedError) {
        throw error;
      }
      throw new GeneralError('An error occurred while fetching the puzzle.');
    }
  }
  

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePuzzleProgress(puzzleId: string, progressData: any) {
  console.log(puzzleId)
  await connect();
  try {
    
    const { userId } = await auth();
    const user = await UserModel.findOne({ uid: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const puzzleProgress = user.puzzleProgress.find(progress => progress.puzzleId.toString() === puzzleId);
    if (puzzleProgress) {
      await UserModel.findOneAndUpdate(
        { uid: userId, 'puzzleProgress.puzzleId': puzzleId },
        {
          $set: {
            'puzzleProgress.$.completed': progressData.completed,
            'puzzleProgress.$.skipped': progressData.skipped,
            'puzzleProgress.$.hintsUsed': progressData.hintsUsed,
            'puzzleProgress.$.attempts': progressData.attempts,
            'puzzleProgress.$.timeTaken': progressData.timeTaken,
            'puzzleProgress.$.userInput': progressData.userInput,
            'puzzleProgress.$.actionThread': progressData.actionThread,
          },
        },
        { new: true }
      );

      return { done: progressData.completed, message: progressData.completed ? 'Puzzle completed successfully' : 'Puzzle progress updated successfully' };
    } else {
      throw new Error('Puzzle not found in user progress');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update puzzle progress');
  }
}