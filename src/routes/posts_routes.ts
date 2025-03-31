import express from "express";
const router= express.Router();
import PostsController from "../controllers/posts_contoroller"
import { AuthController } from "../controllers/auth_controller";

const authController = new AuthController()
const authMiddleware = authController.authMiddleware.bind(authController)

router.get("/", PostsController.getAll.bind(PostsController));
router.get("/:id", PostsController.getById.bind(PostsController));
router.post("/",authMiddleware, PostsController.create.bind(PostsController));
router.put("/:id",authMiddleware, PostsController.update.bind(PostsController));
router.delete("/:id",authMiddleware, PostsController.deleteById.bind(PostsController));
router.delete("/", PostsController.deleteAll.bind(PostsController));
router.post("/:id/like",authMiddleware, PostsController.like.bind(PostsController));
router.get("/search/query", PostsController.search.bind(PostsController));
export default router;