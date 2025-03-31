import express from "express";
const router= express.Router();
import CommentsController from "../controllers/comments_controller" 



router.get("/", CommentsController.getAll.bind(CommentsController));
router.get("/:id", CommentsController.getById.bind(CommentsController));
router.post("/", CommentsController.create.bind(CommentsController));
router.put("/:id", CommentsController.update.bind(CommentsController));
router.delete("/:id", CommentsController.deleteById.bind(CommentsController));
router.delete("/", CommentsController.deleteAll.bind(CommentsController));
router.post("/:id/like", CommentsController.like.bind(CommentsController));
router.get("/search/query", CommentsController.search.bind(CommentsController));
export default router;