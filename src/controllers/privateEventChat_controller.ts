// src/controllers/eventChat_controller.ts
import EventChatModel from '../models/privateEventChatModel';
import EventModel from '../models/privateEventModel';
import { BaseChatController } from './baseChat_controller';
import { Request, Response } from 'express';
import { IMessage } from '../models/messageModel';

type EventChatDocumentSubset = {
  messages: IMessage[];
  image?: string;
};

class EventChatController extends BaseChatController<EventChatDocumentSubset> {
  constructor() {
    super(EventChatModel as any);
  }

  /**
   * Create a new chat for an event
   */
  public createEventChat = async (req: Request, res: Response) => {
    try {
      const { eventId, ownerId, image } = req.body;

      if (!eventId || !ownerId) {
        return res.status(400).send('Missing eventId or ownerId');
      }

      const existingChat = await EventChatModel.findOne({ eventId });
      if (existingChat) {
        return res.status(400).send('Chat already exists for this event');
      }

      const newChat = await EventChatModel.create({
        eventId,
        owner: ownerId,
        image,
        messages: []
      });

      res.status(201).json(newChat);
    } catch (err) {
      console.error('Error creating event chat:', err);
      res.status(500).send('Server error');
    }
  };

  /**
   * Send a message to an event chat
   */
  public sendMessage = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const { senderId, content, imageUrl } = req.body;

      const chat = await EventChatModel.findById(chatId);
      if (!chat) return res.status(404).send('Chat not found');

      const event = await EventModel.findById(chat.eventId);
      if (!event) return res.status(404).send('Associated event not found');

      if (event.expiresAt < new Date()) {
        return res.status(403).send('Chat expired');
      }

      if (!chat.owner || chat.owner.toString() !== senderId.toString()) {
        return res.status(403).send('Only the event owner can send messages');
      }

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
      console.error('Error sending message to event chat:', err);
      res.status(500).send('Server error');
    }
  };
}

export const eventChatController = new EventChatController();
