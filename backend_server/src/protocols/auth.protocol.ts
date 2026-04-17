import { Request, Response } from "express";
import { z } from "zod";
import { AuthContext } from "../contexts/auth.context";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 digit")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const AuthProtocol = {
  async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: parsed.error.errors,
          },
        });
      }

      const { email, username, password } = parsed.data;
      const result = await AuthContext.register(email, username, password);

      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: {
          code: err.code || "INTERNAL_ERROR",
          message: err.message || "Internal server error",
        },
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: parsed.error.errors,
          },
        });
      }

      const { email, password } = parsed.data;
      const result = await AuthContext.login(email, password);

      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: {
          code: err.code || "INTERNAL_ERROR",
          message: err.message || "Internal server error",
        },
      });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Refresh token is required",
            details: parsed.error.errors,
          },
        });
      }

      const result = await AuthContext.refresh(parsed.data.refreshToken);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        error: {
          code: err.code || "INTERNAL_ERROR",
          message: err.message || "Internal server error",
        },
      });
    }
  },

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await AuthContext.logout(refreshToken);
      }
      return res.status(200).json({ success: true, data: { message: "Logged out successfully" } });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Logout failed" },
      });
    }
  },
};
