export interface CreateUserData {
    email: string;
    username: string;
    passwordHash: string;
    encryptionKey: string;
}
export declare const UserModel: {
    create(data: CreateUserData): Promise<{
        id: string;
        email: string;
        username: string;
        createdAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string;
        encryptionKey: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string;
        encryptionKey: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getEncryptionKey(userId: string): Promise<string | null>;
};
//# sourceMappingURL=user.model.d.ts.map