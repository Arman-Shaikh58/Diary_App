export declare const EntryContext: {
    createOrUpdate(userId: string, entryDate: string, content: string, title?: string, mood?: string): Promise<{
        id: string;
        entryDate: Date;
        title: string | null;
        mood: string | null;
        images: {
            id: string;
            secureUrl: string;
            displayOrder: number;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    getByDate(userId: string, dateStr: string): Promise<{
        id: string;
        entryDate: Date;
        title: string | null;
        content: string;
        mood: string | null;
        images: {
            id: string;
            secureUrl: string;
            format: string;
            width: number | null;
            height: number | null;
            displayOrder: number;
        }[];
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getMonthEntries(userId: string, monthStr: string): Promise<{
        id: string;
        entryDate: Date;
        mood: string | null;
        hasImages: boolean;
    }[]>;
    updateEntry(userId: string, entryId: string, content?: string, title?: string, mood?: string): Promise<{
        id: string;
        entryDate: Date;
        title: string | null;
        mood: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteEntry(userId: string, entryId: string): Promise<void>;
};
//# sourceMappingURL=entry.context.d.ts.map