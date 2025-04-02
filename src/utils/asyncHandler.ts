import type { Request, Response, NextFunction } from 'express';

const asyncHandler = (requestHandlerFunc: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandlerFunc(req, res, next)).catch(
            (err: any) => {
                console.error("Error in asyncHandler:", err);
                next(err);
            }
        );
    };
};

export { asyncHandler };
