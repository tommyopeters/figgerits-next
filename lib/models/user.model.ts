export { };
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
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

const User = mongoose.model('User', UserSchema);

export default User;