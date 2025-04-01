const asyncHandler = (requestHandlerFunc: Function) => {
    return (req: any, res: any, next: any) => {
        Promise
            .resolve(requestHandlerFunc(req, res, next))
            .catch((err: any) => {
                console.error('Error in asyncHandler:', err);
                next(err);
            });
    };
}

export default asyncHandler;
