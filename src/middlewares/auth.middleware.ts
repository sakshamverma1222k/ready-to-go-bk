import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiErrorHandler } from "../utils/apiErrorHandler";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

// JWT Verification Middleware
export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the token from cookies or Authorization header
        const token = req.cookies.accessToken || req.headers["authorization"]?.replace("Bearer ", "");

        if (!token) {
            throw new ApiErrorHandler(401, "Unauthorized request", ["User Unauthorized"]);
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "");

        // Fetch the user from the database using the decoded token's ID
        const user = await User.findById((decodedToken as any)?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiErrorHandler(402, "Invalid Access Token", ["User Unauthorized"]);
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error:any) {
        throw new ApiErrorHandler(401, error?.message || "Invalid Access Token", ["User Unauthorized"]);
    }
});
