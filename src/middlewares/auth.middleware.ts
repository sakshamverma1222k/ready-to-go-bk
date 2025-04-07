import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiErrorHandler } from "../utils/apiErrorHandler";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

// JWT Verification Middleware
export const verifyJWT = asyncHandler(
    async (req: Request, _: Response, next: NextFunction) => {
        try {
            const token =
                req.cookies?.accessToken ||
                req.header("Authorization")?.replace("Bearer ", "");

            // console.log(token);
            if (!token) {
                throw new ApiErrorHandler(401, "Unauthorized request", [
                    "Token wasn't provided",
                ]);
            }

            console.log(
                "process.env.ACCESS_TOKEN_SECRET",
                process.env.ACCESS_TOKEN_SECRET,
                "token",
                token
            );

            const decodedToken: any = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET || ""
            );

            const user = await User.findById(decodedToken?._id).select(
                "-password -refreshToken"
            );

            if (!user) {
                throw new ApiErrorHandler(401, "Invalid Access Token", []);
            }

            req.user = user;
            next();
        } catch (error: any) {
            throw new ApiErrorHandler(
                error?.statusCode || 401,
                error?.message || "Invalid access token",
                error?.error || [],
                error?.stack
            );
        }
    }
);
