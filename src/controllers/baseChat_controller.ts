import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { IMessage } from '../models/messageModel';

export abstract class BaseChatController<T extends { messages: IMessage[]; image?: string }> {
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

      const newMessage: IMessage = {
        senderId,
        content,
        imageUrl,
        timestamp: new Date(),
      };

      chat.messages.push(newMessage);
      await chat.save();

      res.status(200).json(newMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).send('Server error');
    }
  };

  public getMessages = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const chat = await this.chatModel.findById(chatId);

      if (!chat) return res.status(404).send('Chat not found');

      res.status(200).json(chat.messages);
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
