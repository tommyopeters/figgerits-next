export { };
import mongoose, { Schema, Document, Model } from 'mongoose';
import { PuzzleProgress } from '@/utils/types';


interface IUser extends Document {
    uid: string;
    email: string;
    photoUrl: string;
    displayName: string;
    firstName: string;
    lastName: string;
    puzzleProgress: PuzzleProgress[];
}


const PuzzleProgressSchema: Schema = new Schema({
    _id: { type: mongoose.Types.ObjectId, required: true },
    puzzleId: { type: mongoose.Types.ObjectId, ref: 'Puzzle', required: true },
    encoding: { type: Object, required: true },
    completed: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },
    hintsUsed: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    userInput: { type: Object, default: {} },
    actionThread: { type: Array, default: [] },
});

const UserSchema: Schema = new mongoose.Schema(
    {
        displayName: {
            type: String,
            required: [true, "Please provide a name"],
        },
        firstName: {
            type: String,
            required: false,
        },
        lastName: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
        },
        metadata: {
            type: Object,
            required: false,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        photoUrl: {
            type: String,
            required: false,
        },
        uid: {
            type: String,
            required: true,
            unique: true,
        },
        puzzleProgress: [PuzzleProgressSchema],

    },
    {
        timestamps: true,
    })

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;