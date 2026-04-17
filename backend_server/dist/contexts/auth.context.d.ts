export declare const AuthContext: {
    register(email: string, username: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshTokenRaw: string): Promise<{
        accessToken: string;
    }>;
    logout(refreshTokenRaw: string): Promise<void>;
    verifyAccessToken(token: string): {
        sub: string;
    };
};
//# sourceMappingURL=auth.context.d.ts.map