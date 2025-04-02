// src/controllers/eventChat_controller.ts
import EventChatModel, { IEventChat } from '../models/privateEventChatModel';
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

  public createEventChat = async (req: Request, res: Response) => {
    try {
      const { eventId, ownerId, image } = req.body;

      if (!eventId || !ownerId) {
        return res.status(400).send('Missing eventId or ownerId');
      }

      const existingChat = await EventChatModel.findOne({ eventId });
      if (existingChat) {
        return res.status(200).json(existingChat);
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
}

export const eventChatController = new EventChatController();
