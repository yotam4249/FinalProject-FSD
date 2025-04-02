// src/controllers/event_controller.ts
import { Request, Response } from 'express';
import EventModel, { IEvent } from '../models/privateEventModel';
import EventChatModel from '../models/privateEventChatModel';

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      name,
      host,
      location,
      imageUrl,
      startTime,
      description
    } = req.body;

    if (!name || !host || !location || !location.coordinates || !startTime) {
      return res.status(400).send('Missing required fields');
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const newEvent = await EventModel.create({
      name,
      host,
      location,
      imageUrl,
      startTime,
      expiresAt,
      participants: [host],
      description
    });

    // Create associated chat
    const chat = await EventChatModel.create({
      eventId: newEvent._id.toString(),
      owner: host,
      messages: [],
      image: imageUrl || null
    });

    res.status(201).json({ event: newEvent, chat });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).send('Server error');
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await EventModel.findById(id);
    if (!event) return res.status(404).send('Event not found');
    res.status(200).json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).send('Server error');
  }
};

export const deleteExpiredEvents = async () => {
  try {
    const now = new Date();
    const expiredEvents = await EventModel.find({ expiresAt: { $lte: now } });

    for (const event of expiredEvents) {
      await EventChatModel.deleteOne({ eventId: event._id.toString() });
      await EventModel.findByIdAndDelete(event._id);
    }

    console.log(`✅ Deleted ${expiredEvents.length} expired events and chats.`);
  } catch (err) {
    console.error('Error deleting expired events:', err);
  }
};