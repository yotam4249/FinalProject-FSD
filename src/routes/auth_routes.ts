import express from "express"
import {AuthController} from "../controllers/auth_controller"

const authController = new AuthController()
const router = express.Router()

router.post('/register',authController.register)
router.post("/login", authController.login)
router.post("/refresh", authController.refresh)
router.post("/logout", authController.logout)

export default router