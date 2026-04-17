import { Request, Response, NextFunction } from "express";
/**
 * Express middleware that verifies JWT from Authorization header.
 * Attaches userId to request object for downstream handlers.
 */
export interface AuthenticatedRequest extends Request {
    userId?: string;
}
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map