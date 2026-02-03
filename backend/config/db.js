import mongoose from 'mongoose'
import "dotenv/config.js"

export const connectDb = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is not defined in environment variables');
            process.exit(1);
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
}
