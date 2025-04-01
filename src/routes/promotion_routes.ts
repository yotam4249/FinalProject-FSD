import express from "express";
import promotionController from "../controllers/promotion_controller";
const router = express.Router();
import { AuthController } from "../controllers/auth_controller";

const authController = new AuthController()
const authMiddleware = authController.authMiddleware.bind(authController)


router.get("/", promotionController.getAll.bind(promotionController));
router.get("/:id", promotionController.getById.bind(promotionController));
router.post("/", authMiddleware, promotionController.create.bind(promotionController));
router.delete("/:id", authMiddleware, promotionController.deleteById.bind(promotionController));
router.post("/:id/like", authMiddleware, promotionController.like.bind(promotionController));
router.get("/search/query", promotionController.search.bind(promotionController));

export default router;
