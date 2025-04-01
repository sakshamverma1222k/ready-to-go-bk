import mongoose, { Schema, Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the interface for the user document
interface IUser extends Document {
    userName: string;
    fullName: string;
    email: string;
    avatar: string;
    coverImage?: string;
    watchHistory: mongoose.Types.ObjectId[]; // Array of references to Video objects
    password: string;
    refreshToken: string | null;

    // Instance methods
    isPasswordMatch(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

// Define the user schema
const userSchema: Schema<IUser> = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Hash password before saving if it's modified
userSchema.pre<IUser>("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Instance method to check if the password matches
userSchema.methods.isPasswordMatch = async function (
    password: string
): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

// Instance method to generate access token
userSchema.methods.generateAccessToken = function (): string {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }

    const accessToken = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        }
    );
    return accessToken;
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is not defined");
    }

    const refreshToken = jwt.sign(
        {
            id: this._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
        }
    );
    return refreshToken;
};

// Create the model using the interface
const User = mongoose.model<IUser>("User", userSchema);

export default User;
