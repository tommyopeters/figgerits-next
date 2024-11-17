import mongoose, { Schema, Document, Model } from "mongoose";

interface IPuzzle extends Document {
    quote: string;
    info: string;
    clues: {
        word: string;
        clue: string;
    }[];
}

const PuzzleSchema: Schema = new Schema(
    {
        quote: {
            type: String,
            required: [true, "Please provide a quote"],
        },
        info: {
            type: String,
            required: true,
        },
        clues: [
            {
                word: {
                    type: String,
                    required: true,
                },
                clue: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Puzzle: Model<IPuzzle> = mongoose.models.Puzzle || mongoose.model<IPuzzle>('Puzzle', PuzzleSchema);

export default Puzzle;