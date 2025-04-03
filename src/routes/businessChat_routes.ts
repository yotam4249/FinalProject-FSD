import express from 'express';
import BusinessChatModel from '../models/businessChatModel';
import { businessChatController } from '../controllers/businessChat_controller';

const router = express.Router();
const controller = businessChatController

router.post('/:chatId/message', controller.sendMessage);


router.get('/:chatId/messages', controller.getMessages);


router.post('/:chatId/announcement', controller.sendAnnouncement);

router.put('/:chatId/upload-image', businessChatController.uploadChatImage);

export default router;
