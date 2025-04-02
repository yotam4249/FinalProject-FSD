import express from 'express';
import { eventChatController } from '../controllers/privateEventChat_controller';

const router = express.Router();


router.post('/', eventChatController.createEventChat);


router.post('/:chatId/message', eventChatController.sendMessage);


router.get('/:chatId/messages', eventChatController.getMessages);

export default router;