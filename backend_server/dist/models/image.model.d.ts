export interface CreateImageData {
    entryId: string;
    userId: string;
    cloudinaryId: string;
    url: string;
    secureUrl: string;
    format: string;
    width?: number;
    height?: number;
    bytes?: number;
    displayOrder?: number;
}
export declare const ImageModel: {
    create(data: CreateImageData): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        displayOrder: number;
        entryId: string;
        cloudinaryId: string;
        url: string;
        secureUrl: string;
        format: string;
        width: number | null;
        height: number | null;
        bytes: bigint | null;
    }>;
    findByEntryId(entryId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        displayOrder: number;
        entryId: string;
        cloudinaryId: string;
        url: string;
        secureUrl: string;
        format: string;
        width: number | null;
        height: number | null;
        bytes: bigint | null;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        displayOrder: number;
        entryId: string;
        cloudinaryId: string;
        url: string;
        secureUrl: string;
        format: string;
        width: number | null;
        height: number | null;
        bytes: bigint | null;
    } | null>;
    deleteById(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        displayOrder: number;
        entryId: string;
        cloudinaryId: string;
        url: string;
        secureUrl: string;
        format: string;
        width: number | null;
        height: number | null;
        bytes: bigint | null;
    }>;
    deleteByEntryId(entryId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    countByEntryId(entryId: string): Promise<number>;
};
//# sourceMappingURL=image.model.d.ts.map