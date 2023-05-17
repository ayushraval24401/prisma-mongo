import express from "express";
import postController from "../controllers/postController";
const router = express.Router();

router.get("/category/:id", postController.getPostsByCategory);
router.get("/my", postController.getMyPosts);
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostDetails);
router.post("/", postController.createPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);

export default router;
