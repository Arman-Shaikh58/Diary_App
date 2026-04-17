import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
export declare const AuthProtocol: {
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=auth.protocol.d.ts.map