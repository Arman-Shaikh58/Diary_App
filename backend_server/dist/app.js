"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const entry_routes_1 = __importDefault(require("./routes/entry.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "3000", 10);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/entries", entry_routes_1.default);
// Health check
app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    });
});
// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Daily Diary Backend running on http://localhost:${PORT}`);
    console.log(`📝 API base: http://localhost:${PORT}/api/v1`);
});
exports.default = app;
//# sourceMappingURL=app.js.map