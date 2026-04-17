"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProtocol = void 0;
const zod_1 = require("zod");
const auth_context_1 = require("../contexts/auth.context");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    username: zod_1.z.string().min(3, "Username must be at least 3 characters").max(50),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
        .regex(/[0-9]/, "Password must contain at least 1 digit")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required"),
});
const refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
exports.AuthProtocol = {
    async register(req, res) {
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
            const result = await auth_context_1.AuthContext.register(email, username, password);
            return res.status(201).json({ success: true, data: result });
        }
        catch (err) {
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
    async login(req, res) {
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
            const result = await auth_context_1.AuthContext.login(email, password);
            return res.status(200).json({ success: true, data: result });
        }
        catch (err) {
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
    async refresh(req, res) {
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
            const result = await auth_context_1.AuthContext.refresh(parsed.data.refreshToken);
            return res.status(200).json({ success: true, data: result });
        }
        catch (err) {
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
    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) {
                await auth_context_1.AuthContext.logout(refreshToken);
            }
            return res.status(200).json({ success: true, data: { message: "Logged out successfully" } });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                error: { code: "INTERNAL_ERROR", message: "Logout failed" },
            });
        }
    },
};
//# sourceMappingURL=auth.protocol.js.map