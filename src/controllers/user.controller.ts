import type { IUser } from "../models/user.model.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import type { Request, Response } from 'express';
import { ApiErrorHandler } from "../utils/apiErrorHandler.ts";
import { ApiResponseHandler } from "../utils/apiResponseHandler.ts";
import User from "../models/user.model.ts";
import { uploadOnCloudinary } from "../utils/cloudinary.ts";

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { userName, fullName, email, password }: IUser = req.body;

    if ([fullName, userName, email, password].some((field) => !field)) {
        throw new ApiErrorHandler(400, "All fields are required", ["Missing fields"]);
    }

    const existingUser = await User.find({ $or: [{ userName }, { email }] });
    if (existingUser.length > 0) {
        throw new ApiErrorHandler(409, "User already exists", ["User already exists"]);
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiErrorHandler(400, "Avatar is required", ["Missing file avatar"]);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiErrorHandler(500, "Error uploading images", ["Upload error"]);
    }

    const newUser = await User.create({
        userName,
        fullName,
        email,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || null,
    });

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiErrorHandler(500, "Error creating user", ["Creation error"]);
    }

    res.status(201).json(new ApiResponseHandler(200, createdUser, "User created successfully", true));
});

export { registerUser };