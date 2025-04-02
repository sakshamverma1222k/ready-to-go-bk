import dotenv from "dotenv";
import connectDB from "./db";
import app from "./app.ts";

dotenv.config({
    path: `./.env${process.env.NODE_ENV ? "." + process.env.NODE_ENV : ""}`,
});

connectDB()
    .then(() => {
        console.log("\nConnected to the database");
        app.on("error", error => {
            console.error("\nServer error:", error);
            throw error;
        });
        app.listen(process.env.PORT || 3000, () => {
            console.log(
                `\nServer is running on port ${process.env.PORT || 3000}`
            );
        });
    })
    .catch(error => {
        console.error("\n\nDatabase connection error:", error);
    });
