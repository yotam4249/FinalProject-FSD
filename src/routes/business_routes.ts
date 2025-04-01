import express from 'express';
import { BusinessAuthController } from '../controllers/business_controller';

const router = express.Router();
const businessController = new BusinessAuthController();

router.post('/register', businessController.register);
router.post('/login', businessController.login);      
router.post('/refresh', businessController.refresh);  
router.post('/logout', businessController.logout);    

export default router;
