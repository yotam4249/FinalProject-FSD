// src/controllers/businessChat_controller.ts
import { Request, Response } from 'express';
import BusinessChatModel, { IBusinessChat } from '../models/businessChatModel';
import { BaseChatController } from './baseChat_controller';
import { IMessage } from '../models/messageModel';

class BusinessChatController extends BaseChatController<IBusinessChat> {
  constructor() {
    super(BusinessChatModel);
  }

  public sendAnnouncement = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const { senderId, content, imageUrl } = req.body;
  
      const chat = await this.chatModel.findById(chatId);
      if (!chat) return res.status(404).send("Chat not found");
  
      if (chat.businessId.toString() !== senderId.toString()) {
        return res.status(403).send("Only the business owner can send announcements");
      }
  
      const announcement: IMessage = {
        senderId,
        content,
        imageUrl,
        timestamp: new Date()
      };
  
      chat.messages.push(announcement);
      await chat.save();
  
      res.status(200).json(announcement);
    } catch (err) {
      console.error("Error sending announcement:", err);
      res.status(500).send("Server error");
    }
  };
  
}

export const businessChatController = new BusinessChatController();