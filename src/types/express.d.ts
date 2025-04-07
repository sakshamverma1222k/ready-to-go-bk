interface ICookies {
    accessToken: string
}

declare namespace Express {
    interface Request {
        user?: any;
        cookies?: any;
        header?: any;
    }
}
