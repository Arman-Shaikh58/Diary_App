export declare const CloudinaryContext: {
    uploadImage(buffer: Buffer, userId: string, originalname: string): Promise<{
        cloudinaryId: string;
        url: string;
        secureUrl: string;
        format: string;
        width: number;
        height: number;
        bytes: number;
    }>;
    deleteImage(cloudinaryId: string): Promise<any>;
};
//# sourceMappingURL=cloudinary.context.d.ts.map