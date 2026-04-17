import { Router } from "express";
import { AuthProtocol } from "../protocols/auth.protocol";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", AuthProtocol.register);
router.post("/login", AuthProtocol.login);
router.post("/refresh", AuthProtocol.refresh);

// Protected routes
router.post("/logout", authMiddleware, AuthProtocol.logout);

export default router;
