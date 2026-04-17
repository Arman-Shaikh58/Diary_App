import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
export declare const EntryProtocol: {
    getMonthEntries(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getEntryByDate(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    createEntry(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateEntry(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteEntry(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    uploadImages(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteImage(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=entry.protocol.d.ts.map