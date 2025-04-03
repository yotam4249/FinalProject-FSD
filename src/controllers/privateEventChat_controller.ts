// // src/controllers/eventChat_controller.ts
// import EventChatModel from '../models/privateEventChatModel';
// import EventModel from '../models/privateEventModel';
// import { BaseChatController } from './baseChat_controller';
// import { Request, Response } from 'express';
// import { IMessage } from '../models/messageModel';
// import { Types } from 'mongoose';

// type EventChatDocumentSubset = {
//   messages: IMessage[];
//   image?: string;
// };

// class EventChatController extends BaseChatController<EventChatDocumentSubset> {
//   constructor() {
//     super(EventChatModel as any);
//   }

//   /**
//    * Create a new chat for an event
//    */
//   public createEventChat = async (req: Request, res: Response) => {
//     try {
//       const { eventId, ownerId, image } = req.body;

//       if (!eventId || !ownerId) {
//         return res.status(400).send('Missing eventId or ownerId');
//       }

//       const existingChat = await EventChatModel.findOne({ eventId });
//       if (existingChat) {
//         return res.status(400).send('Chat already exists for this event');
//       }

//       const newChat = await EventChatModel.create({
//         eventId,
//         owner: ownerId,
//         image,
//         messages: []
//       });

//       res.status(201).json(newChat);
//     } catch (err) {
//       console.error('Error creating event chat:', err);
//       res.status(500).send('Server error');
//     }
//   };

//   /**
//    * Send a message to an event chat
//   //  */
//   // public sendMessage = async (req: Request, res: Response) => {
//   //   try {
//   //     const { chatId } = req.params;
//   //     const { senderId, content, imageUrl } = req.body;

//   //     const chat = await EventChatModel.findById(chatId);
//   //     if (!chat) return res.status(404).send('Chat not found');

//   //     const event = await EventModel.findById(chat.eventId);
//   //     if (!event) return res.status(404).send('Associated event not found');

//   //     if (event.expiresAt < new Date()) {
//   //       return res.status(403).send('Chat expired');
//   //     }

//   //     if (!chat.owner || chat.owner.toString() !== senderId.toString()) {
//   //       return res.status(403).send('Only the event owner can send messages');
//   //     }

//   //     const newMessage: IMessage = {
//   //       senderId,
//   //       content,
//   //       imageUrl,
//   //       timestamp: new Date()
//   //     };

//   //     chat.messages.push(newMessage);
//   //     await chat.save();

//   //     res.status(200).json(newMessage);
//   //   } catch (err) {
//   //     console.error('Error sending message to event chat:', err);
//   //     res.status(500).send('Server error');
//   //   }
//   // };
//   public sendMessage = async (req: Request, res: Response) => {
//     try {
//       const { chatId } = req.params;
//       const { senderId, content, imageUrl } = req.body;
  
//       console.log('📩 Incoming message:', { chatId, senderId, content });
  
//       const chat = await EventChatModel.findById(chatId);
//       if (!chat) {
//         console.log('❌ Chat not found');
//         return res.status(404).send('Chat not found');
//       }
  
//       const event = await EventModel.findById(chat.eventId);
//       if (!event) {
//         console.log('❌ Event not found');
//         return res.status(404).send('Associated event not found');
//       }
  
//       if (event.expiresAt < new Date()) {
//         console.log('⏰ Event expired');
//         return res.status(403).send('Chat expired');
//       }
  
//       console.log('👤 Comparing owner:', chat.owner?.toString(), 'vs', senderId.toString());
//       if (!chat.owner || chat.owner.toString() !== senderId.toString()) {
//         console.log('❌ Sender is not the owner');
//         return res.status(403).send('Only the event owner can send messages');
//       }
  
//       const newMessage: IMessage = {
//         senderId,
//         content,
//         imageUrl,
//         timestamp: new Date()
//       };
  
//       chat.messages.push(newMessage);
//       await chat.save();
  
//       res.status(200).json(newMessage);
//     } catch (err) {
//       console.error('❌ Error sending message to event chat:', err);
//       res.status(500).send('Server error');
//     }
//   };
  
  
// }

// export const eventChatController = new EventChatController();
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import EventChatModel from '../models/privateEventChatModel';
import EventModel from '../models/privateEventModel';
import PostModel from '../models/Post_model';
import { BaseChatController } from './baseChat_controller';
import { IEventChat } from '../models/privateEventChatModel';

class EventChatController extends BaseChatController<IEventChat> {
  constructor() {
    super(EventChatModel);
  }

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
        eventId: new Types.ObjectId(eventId),
        owner: new Types.ObjectId(ownerId),
        posts: [],
        image,
      });

      res.status(201).json(newChat);
    } catch (err) {
      console.error('Error creating event chat:', err);
      res.status(500).send('Server error');
    }
  };

  public sendMessage = async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const { senderId, content, imageUrl } = req.body;

      console.log('📩 Incoming message:', { chatId, senderId, content });

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

      const newPost = await PostModel.create({
        user: senderId,
        content,
        imageUrl,
        eventId: chat.eventId,
        expiresAt: event.expiresAt,
        comments: [],
        likes: [],
      });

      chat.posts.push(newPost._id as Types.ObjectId);


      await chat.save();

      res.status(200).json(newPost);
    } catch (err) {
      console.error('❌ Error sending message to event chat:', err);
      res.status(500).send('Server error');
    }
  };
}

export const eventChatController = new EventChatController();
