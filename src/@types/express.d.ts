declare global {
    namespace Express {
        interface Request {
            token: string;
            user: {
                id: string
            }
        }
    }
}

export {}