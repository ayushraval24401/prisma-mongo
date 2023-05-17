import express from "express";
import categoryController from "../controllers/categoryController";
import { isAuthenticated } from "../middlewares/authMiddleware";
const router = express.Router();

router.get("/", isAuthenticated, categoryController.getAllCategories);
router.get("/:id", isAuthenticated, categoryController.getCategoryDetails);
router.post("/", isAuthenticated, categoryController.createCategory);
router.put("/:id", isAuthenticated, categoryController.editCategory);
router.delete("/:id", isAuthenticated, categoryController.deleteCategory);

export default router;
