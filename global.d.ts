// global.d.ts
import mongoose from 'mongoose';

declare global {
    const mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

// This ensures the file is treated as a module
export {};