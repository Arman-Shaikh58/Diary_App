export interface CreateEntryData {
    userId: string;
    entryDate: Date;
    title?: string;
    contentCipher: string;
    contentIv: string;
    contentTag: string;
    mood?: string;
}
export interface UpdateEntryData {
    title?: string;
    contentCipher?: string;
    contentIv?: string;
    contentTag?: string;
    mood?: string;
}
export declare const EntryModel: {
    upsert(data: CreateEntryData): Promise<{
        images: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        entryDate: Date;
        title: string | null;
        contentCipher: string;
        contentIv: string;
        contentTag: string;
        mood: string | null;
        isDeleted: boolean;
    }>;
    findByDate(userId: string, entryDate: Date): Promise<({
        images: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        entryDate: Date;
        title: string | null;
        contentCipher: string;
        contentIv: string;
        contentTag: string;
        mood: string | null;
        isDeleted: boolean;
    }) | null>;
    findByMonth(userId: string, year: number, month: number): Promise<{
        id: string;
        entryDate: Date;
        mood: string | null;
        images: {
            id: string;
        }[];
    }[]>;
    findById(id: string): Promise<({
        images: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        entryDate: Date;
        title: string | null;
        contentCipher: string;
        contentIv: string;
        contentTag: string;
        mood: string | null;
        isDeleted: boolean;
    }) | null>;
    update(id: string, data: UpdateEntryData): Promise<{
        images: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        entryDate: Date;
        title: string | null;
        contentCipher: string;
        contentIv: string;
        contentTag: string;
        mood: string | null;
        isDeleted: boolean;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        entryDate: Date;
        title: string | null;
        contentCipher: string;
        contentIv: string;
        contentTag: string;
        mood: string | null;
        isDeleted: boolean;
    }>;
};
//# sourceMappingURL=entry.model.d.ts.map