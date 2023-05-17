import express from "express";
import authController from "../controllers/authController";
import { isAuthenticated } from "../middlewares/authMiddleware";
const router = express.Router();

router.get("/profile", isAuthenticated, authController.getProfile);
router.post("/login", authController.login);
router.post("/register", authController.register);

export default router;
