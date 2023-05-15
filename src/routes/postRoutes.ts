import express from "express";
import postController from "../controllers/postController";
import { isAuthenticated } from "../middlewares/authMiddleware";
const router = express.Router();

router.get("/my", isAuthenticated, postController.getMyPosts);
router.get("/", isAuthenticated, postController.getAllPosts);
router.get("/:id", isAuthenticated, postController.getPostDetails);
router.post("/", isAuthenticated, postController.createPost);
router.put("/:id", isAuthenticated, postController.updatePost);
router.delete("/:id", isAuthenticated, postController.deletePost);

export default router;
