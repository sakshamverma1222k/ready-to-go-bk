import type { Request, Response, NextFunction } from "express";

const asyncHandler = (requestHandlerFunc: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandlerFunc(req, res, next)).catch(
            (err: any) => {
                console.error("Error in asyncHandler:", err);
                res.status(err.statusCode || 500).json({
                    success: false,
                    statusCode: err.statusCode || 500,
                    message: err.message || "Internal Server Error",
                    error: err.error || ["An error occurred"],
                });
                next(err);
            }
        );
    };
};

export { asyncHandler };
