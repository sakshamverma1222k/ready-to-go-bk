class ApiResponseHandler {
    constructor(
        statusCode: number,
        data: any,
        message: string,
        success: boolean,
    ) {
        this.statusCode = statusCode < 400;
        this.data = data;
        this.message = message;
        this.success = success;
    }
}
export default ApiResponseHandler;
