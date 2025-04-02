// src/controllers/privateChat_controller.ts
import { Request, Response } from 'express';
import privateChatModel, { IPrivateChat } from '../models/privateChatModel';
import { IMessage } from '../models/messageModel';
import { BaseChatController } from './baseChat_controller';

class PrivateChatController extends BaseChatController<IPrivateChat> {
  constructor() {
    super(privateChatModel);
  }

  public createPrivateChat = async (req: Request, res: Response) => {
    try {
      const { user1Id, user2Id } = req.body;

      if (!user1Id || !user2Id || user1Id === user2Id) {
        return res.status(400).send('Invalid user IDs');
      }

      const existingChat = await this.chatModel.findOne({
        participants: { $all: [user1Id, user2Id] }
      });

      if (existingChat) {
        return res.status(200).json(existingChat);
      }

      const newChat = await this.chatModel.create({
        participants: [user1Id, user2Id],
        messages: []
      });

      res.status(201).json(newChat);
    } catch (err) {
      console.error('Error creating private chat:', err);
      res.status(500).send('Server error');
    }
  };
}

export const privateChatController = new PrivateChatController();