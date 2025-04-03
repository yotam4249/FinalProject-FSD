// src/controllers/baseChat_controller.ts
import { Request, Response } from 'express';
import { Model, Types } from 'mongoose';
import PostModel, { IPost } from '../models/Post_model';

export abstract class BaseChatController<T extends { posts: Types.ObjectId[]; image?: string }> {
  protected chatModel: Model<T>;

  constructor(model: Model<T>) {
    this.chatModel = model;
  }

  public sendMessage = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const { senderId, content, imageUrl } = req.body;

      const chat = await this.chatModel.findById(chatId);
      if (!chat) return res.status(404).send('Chat not found');
      if (!content) {
        return res.status(400).send('content is required');
      }
      const newPost = await PostModel.create({
        user: senderId,
        content,
        imageUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: 24 hrs
        comments: [],
        likes: [],
      });

      chat.posts.push(newPost._id as Types.ObjectId);
      await chat.save();

      res.status(200).json(newPost);
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).send('Server error');
    }
  };

  public getMessages = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const chat = await this.chatModel.findById(chatId).populate('posts');

      if (!chat) return res.status(404).send('Chat not found');

      res.status(200).json(chat.posts);
    } catch (err) {
      console.error('Error retrieving messages:', err);
      res.status(500).send('Server error');
    }
  };

  public uploadChatImage = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) return res.status(400).send('Missing imageUrl');

      const chat = await this.chatModel.findById(chatId);
      if (!chat) return res.status(404).send('Chat not found');

      chat.image = imageUrl;
      await chat.save();

      res.status(200).json({ message: 'Chat image updated', image: imageUrl });
    } catch (err) {
      console.error('Error uploading chat image:', err);
      res.status(500).send('Server error');
    }
  };
}
