export { };
import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
    uid: string;
    email: string;
    photoUrl: string;
    displayName: string;
    firstName: string;
    lastName: string;
  }
  

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
        puzzleProgress: {
            type: [{
                puzzleId: String,
                completed: Boolean,
                skipped: Boolean,
                hintsUsed: Number,
                attempts: Number,
                timeTaken: Number,
                dateCompleted: Date,
            }],
            required: false,
        },

    },
    {
        timestamps: true,
    })

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;