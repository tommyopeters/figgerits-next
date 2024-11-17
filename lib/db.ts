/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';

const globalAny:any = global;

if (globalAny.mongoose?.conn) {
    globalAny.mongoose = globalAny.mongoose || {
        conn: null,
        promise: null,
    };
}

export async function connect() {
    if (globalAny.mongoose && globalAny.mongoose.conn) {
        console.log('Reusing existing connection');
        return globalAny.mongoose.conn;
    } else {
        const connectionString = process.env.MONGO_DB_URI;
        if (!connectionString) {
            throw new Error('MONGO_DB_URI is not defined');
        }
        const promise = mongoose.connect(connectionString, {
            user: process.env.MONGO_DB_USERNAME,
            pass: process.env.MONGO_DB_PASSWORD,
            // autoIndex: process.env.NODE_ENV !== 'production',
            autoIndex: true,
        });

        globalAny.mongoose = {
            conn: await promise,
            promise,
        };

        console.log('Connected to MongoDB');

        return await promise;
    }
}