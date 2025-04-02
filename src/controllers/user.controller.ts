import asyncHandler from "../utils/asyncHandler";
import type { Request, Response } from 'express';

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    // Simulate user registration logic
    const { username, password } = req.body;

    // Simulate saving user to the database
    const newUser = { id: 1, username, password };

    res.status(200).json({
        message: "User registered successfully",
        user: newUser,
    });
});

export { registerUser };