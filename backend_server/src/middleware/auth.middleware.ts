import { Request, Response, NextFunction } from "express";
import { AuthContext } from "../contexts/auth.context";

/**
 * Express middleware that verifies JWT from Authorization header.
 * Attaches userId to request object for downstream handlers.
 */
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" },
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = AuthContext.verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: err.message || "Invalid token" },
    });
  }
}
