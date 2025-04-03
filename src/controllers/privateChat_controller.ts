// src/controllers/privateChat_controller.ts
import { Request, Response } from 'express';
import PrivateChatModel from '../models/privateChatModel';
import { IMessage } from '../models/messageModel';
import { Types } from 'mongoose';

export class PrivateChatController {
  public async createPrivateChat(req: Request, res: Response) {
    try {
      const { user1Id, user2Id } = req.body;
  
      if (!user1Id || !user2Id) {
        return res.status(400).send("Missing user IDs");
      }
  
      const existing = await PrivateChatModel.findOne({
        participants: { $all: [user1Id, user2Id] }
      });
  
      if (existing) {
        return res.status(200).json(existing);
      }
  
      const chat = await PrivateChatModel.create({
        participants: [user1Id, user2Id],
        messages: []
      });
  
      res.status(201).json(chat);
    } catch (err) {
      console.error('Error creating private chat:', err);
      res.status(500).send("Server error");
    }
  }
  

  public async sendMessage(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const { senderId, content, imageUrl } = req.body;

      if (!content) {
        return res.status(400).send('Content is required');
      }

      const chat = await PrivateChatModel.findById(chatId);
      if (!chat) return res.status(404).send('Chat not found');

      const newMessage: IMessage = {
        senderId,
        content,
        imageUrl,
        timestamp: new Date()
      };

      chat.messages.push(newMessage);
      await chat.save();

      res.status(200).json(newMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).send('Server error');
    }
  }

  public async getMessages(req: Request, res: Response) {
    try {
      const { chatId } = req.params;
      const chat = await PrivateChatModel.findById(chatId);

      if (!chat) return res.status(404).send('Chat not found');

      res.status(200).json(chat.messages);
    } catch (err) {
      console.error('Error retrieving messages:', err);
      res.status(500).send('Server error');
    }
  }

  // public async uploadChatImage(req: Request, res: Response) {
  //   try {
  //     const { chatId } = req.params;
  //     const { imageUrl } = req.body;

  //     if (!imageUrl) return res.status(400).send('Missing imageUrl');

  //     const chat = await PrivateChatModel.findById(chatId);
  //     if (!chat) return res.status(404).send('Chat not found');

  //     chat.image = imageUrl;
  //     await chat.save();

  //     res.status(200).json({ message: 'Chat image updated', image: imageUrl });
  //   } catch (err) {
  //     console.error('Error uploading chat image:', err);
  //     res.status(500).send('Server error');
  //   }
  // }
}

export const privateChatController = new PrivateChatController();
