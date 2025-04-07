import type { IUser } from "../models/user.model.ts";
import { asyncHandler } from "../utils/asyncHandler";
import type { Request, Response } from "express";
import { ApiErrorHandler } from "../utils/apiErrorHandler";
import { ApiResponseHandler } from "../utils/apiResponseHandler";
import User from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";

const generateAccessAndRefreshToken = async (userId: string) => {
    try {
        const user: IUser | null = await User.findById(userId);
        if (!user) {
            throw new ApiErrorHandler(404, "User not found", [
                "User not found",
            ]);
        }
        // Generate tokens using the user instance
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiErrorHandler(500, "Token generation failed", [error]);
    }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { userName, fullName, email, password }: IUser = req.body;

    if ([fullName, userName, email, password].some(field => !field)) {
        throw new ApiErrorHandler(400, "All fields are required", [
            "Missing fields",
        ]);
    }

    const existingUser = await User.find({ $or: [{ userName }, { email }] });
    if (existingUser.length > 0) {
        throw new ApiErrorHandler(409, "Fill a different User", [
            "User already exists",
        ]);
    }

    const myFiles: any = req.files;

    const avatarLocalPath = myFiles?.avatar[0]?.path;
    let coverImageLocalPath = null;
    if (
        myFiles &&
        Array.isArray(myFiles?.coverImage) &&
        myFiles?.coverImage.length > 0
    ) {
        coverImageLocalPath = myFiles.coverImage[0].path;
    }

    console.log("Avatar local path:", avatarLocalPath);
    console.log("Cover image local path:", coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new ApiErrorHandler(400, "Avatar is required", [
            "Missing file avatar",
        ]);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage =
        coverImageLocalPath && (await uploadOnCloudinary(coverImageLocalPath));

    if (!avatar) {
        throw new ApiErrorHandler(500, "Error uploading images", [
            "Upload error",
        ]);
    }

    const newUser = await User.create({
        userName,
        fullName,
        email,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || null,
    });

    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiErrorHandler(500, "Error creating user", [
            "Creation error",
        ]);
    }

    res.status(201).json(
        new ApiResponseHandler(
            200,
            createdUser,
            "User created successfully",
            true
        )
    );
});

const getUserDetails = asyncHandler((req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiErrorHandler(404, "User not found", [
            "User not found",
        ]);
    }
    res.status(200).json(
        new ApiResponseHandler(
            200,
            user,
            "User details fetched successfully",
            true
        )
    );
})

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, userName, password }: IUser = req.body;
    if (!email && !userName) {
        throw new ApiErrorHandler(
            400,
            "You need to provide either email or username",
            ["Missing fields"]
        );
    } else if (!password) {
        throw new ApiErrorHandler(400, "Password is required", [
            "Missing password",
        ]);
    }

    const userExist: IUser[] = await User.find({
        $or: [{ email }, { userName }],
    }).limit(1);
    let loggedInUser;

    if (userExist.length === 0) {
        throw new ApiErrorHandler(401, "Invalid credentials", [
            "User not found",
        ]);
    } else {
        loggedInUser = userExist[0];
    }

    const isPasswordMatch = await loggedInUser.isPasswordMatch(password);
    if (!isPasswordMatch) {
        throw new ApiErrorHandler(401, "Invalid credentials", [
            "Password mismatch",
        ]);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        loggedInUser._id
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponseHandler(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User Logged In Successfully",
                true
            )
        );
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const loggedInUser = req.user;
    User.findByIdAndUpdate(
        loggedInUser._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", "", options)
        .cookie("refreshToken", "", options)
        .json(new ApiResponseHandler(200, {}, "User Logged Out", true));
});

export { registerUser, loginUser, logoutUser, getUserDetails };
