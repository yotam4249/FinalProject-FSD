// src/controllers/businessChat_controller.ts
import { Request, Response } from 'express';
import BusinessChatModel, { IBusinessChat } from '../models/businessChatModel';
import { BaseChatController } from './baseChat_controller';
import PostModel from '../models/Post_model';
import { Types } from 'mongoose';

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

      // ✅ Only business owner can send announcements
      if (chat.businessId.toString() !== senderId.toString()) {
        return res.status(403).send("Only the business owner can send announcements");
      }

      const announcementPost = await PostModel.create({
        user: senderId,
        content,
        imageUrl,
        business: chat.businessId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        comments: [],
        likes: [],
      });

      chat.posts.push(announcementPost._id as Types.ObjectId);
      await chat.save();

      res.status(200).json(announcementPost);
    } catch (err) {
      console.error("Error sending announcement:", err);
      res.status(500).send("Server error");
    }
  };
}

export const businessChatController = new BusinessChatController();
