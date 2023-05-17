import express from "express";
import userController from "../controllers/userController";
import { isAuthenticated } from "../middlewares/authMiddleware";
const router = express.Router();

router.get("/:id", userController.getUserDetails);
router.get("/", userController.getAllUsers);
router.put("/:id", isAuthenticated, userController.updateUser);
router.delete("/:id", isAuthenticated, userController.deleteUser);

export default router;
