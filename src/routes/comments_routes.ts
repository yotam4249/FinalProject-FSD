import express from "express";
const router= express.Router();
import CommentsController from "../controllers/comments_controller" 
import {AuthController} from "../controllers/auth_controller"

const authController = new AuthController()
const authMiddleware = authController.authMiddleware.bind(authController)



router.get("/", CommentsController.getAll.bind(CommentsController));
router.get("/:id", CommentsController.getById.bind(CommentsController));
router.post("/",authMiddleware, CommentsController.create.bind(CommentsController));
router.put("/:id",authMiddleware, CommentsController.update.bind(CommentsController));
router.delete("/:id",authMiddleware, CommentsController.deleteById.bind(CommentsController));
router.delete("/", CommentsController.deleteAll.bind(CommentsController));
router.post("/:id/like",authMiddleware, CommentsController.like.bind(CommentsController));
router.get("/search/query", CommentsController.search.bind(CommentsController));
export default router;