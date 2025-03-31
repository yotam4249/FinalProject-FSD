import express from "express";
const router= express.Router();
import CommentsController from "../controllers/comments_controller" 
import { authMiddleware } from "../controllers/auth_controller";


router.get("/", (req, res) => CommentsController.getAll(req, res));
router.get("/:id", (req, res) => CommentsController.getById(req, res));
router.post("/", (req, res) => CommentsController.create(req, res));
router.put("/:id", (req, res) => CommentsController.update(req, res));
router.delete("/:id", (req, res) => CommentsController.deleteById(req, res));
router.delete("/", (req, res) => CommentsController.deleteAll(req, res));
router.post("/:id/like", (req, res) => CommentsController.like(req, res));
router.get("/search/query", (req, res) => CommentsController.search(req, res));

export default router;