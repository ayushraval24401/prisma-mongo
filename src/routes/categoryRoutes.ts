import express from "express";
import categoryController from "../controllers/categoryController";
const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryDetails);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.editCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
