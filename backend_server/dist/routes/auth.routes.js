"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_protocol_1 = require("../protocols/auth.protocol");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", auth_protocol_1.AuthProtocol.register);
router.post("/login", auth_protocol_1.AuthProtocol.login);
router.post("/refresh", auth_protocol_1.AuthProtocol.refresh);
// Protected routes
router.post("/logout", auth_middleware_1.authMiddleware, auth_protocol_1.AuthProtocol.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map