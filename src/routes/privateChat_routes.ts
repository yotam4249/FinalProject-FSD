import express from 'express';
import { privateChatController } from '../controllers/privateChat_controller';

const router = express.Router();

// Create a new private chat between 2 users
router.post('/', privateChatController.createPrivateChat);

// Send a message in a private chat
router.post('/:chatId/message', privateChatController.sendMessage);

// Get all messages from a private chat
router.get('/:chatId/messages', privateChatController.getMessages);

export default router;
