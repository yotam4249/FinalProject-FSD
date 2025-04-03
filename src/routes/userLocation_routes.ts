import express from "express";
import { updateUserLocation, getUserLocation, isUserInBusiness } from "../controllers/userLocation_controller";
import { AuthController } from "../controllers/auth_controller";
const router = express.Router();

const authController = new AuthController()
const authMiddleware = authController.authMiddleware.bind(authController)



// עדכון מיקום המשתמש (נדרש משתמש מחובר)
router.post("/update", authMiddleware, updateUserLocation);

// קבלת מיקום של משתמש מסוים לפי ID
router.get("/:userId", getUserLocation);

// בדיקה אם המשתמש נמצא באירוע / עסק מסוים
router.get("/:businessId/check-in", authMiddleware, isUserInBusiness);
export default router;