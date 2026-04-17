"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const auth_context_1 = require("../contexts/auth.context");
function authMiddleware(req, res, next) {
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
        const payload = auth_context_1.AuthContext.verifyAccessToken(token);
        req.userId = payload.sub;
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: err.message || "Invalid token" },
        });
    }
}
//# sourceMappingURL=auth.middleware.js.map