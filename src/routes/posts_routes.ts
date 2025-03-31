import express from "express";
const router= express.Router();
import PostsController from "../controllers/posts_contoroller"
import { AuthController } from "../controllers/auth_controller";

router.get("/", PostsController.getAll.bind(PostsController));
router.get("/:id", PostsController.getById.bind(PostsController));
router.post("/", PostsController.create.bind(PostsController));
router.put("/:id", PostsController.update.bind(PostsController));
router.delete("/:id", PostsController.deleteById.bind(PostsController));
router.delete("/", PostsController.deleteAll.bind(PostsController));
router.post("/:id/like", PostsController.like.bind(PostsController));
router.get("/search/query", PostsController.search.bind(PostsController));
export default router;