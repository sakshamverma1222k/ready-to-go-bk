class ApiErrorHandler extends Error {
    statusCode: number;
    data: any | null;
    success: boolean;
    error: any[];

    constructor(
        statusCode: number,
        message: string,
        error: any[],
        stack?: string
    ) {
        super(message); // Call the parent constructor with the message

        // Set the name of the error instance
        this.name = this.constructor.name;

        // Set the statusCode and other properties
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.error = error;

        // Set the stack trace (if provided, otherwise capture it)
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiErrorHandler };
