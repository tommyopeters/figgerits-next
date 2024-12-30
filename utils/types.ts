import mongoose from "mongoose";

export interface UserInput {
    [key: number]: string | null
}

export interface Encoding {
    [key: string]: number;

}

export interface PuzzleProgress {
    _id: mongoose.Types.ObjectId;
    puzzleId: mongoose.Types.ObjectId;
    completed: boolean,
    skipped: boolean,
    hintsUsed: number,
    attempts: number,
    timeTaken: number,
    dateCompleted?: Date,
    encoding?: Encoding,
    userInput?: UserInput | null,
    actionThread?: [] | null,
}

export interface PuzzleData {
    _id: string;
    puzzleId: string;
    quote: string;
    info: string;
    encoding: Encoding;
    hints: string[];
    clues: { word: string; clue: string }[];
    userInput: UserInput | null;
}
