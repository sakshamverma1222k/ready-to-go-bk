import mongoose from "mongoose";
import { DB_NAME } from "../constants.ts";

const connectDB = async () => {
    try {
        const connectionRes = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log(
            `\nMongoDB connected!! \n\n DB HOST: ${connectionRes.connection.host}, \n DB NAME: ${connectionRes.connection.name}\n\n`
        );
    } catch (error) {
        console.error("\nMongoDB connection error:", error, "\n\n");
        process.exit(1);
    }
};

export default connectDB;
