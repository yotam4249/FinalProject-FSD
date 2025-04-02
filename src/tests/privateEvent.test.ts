import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../server';
import userModel from '../models/User_model';
import EventModel from '../models/privateEventModel';
import EventChatModel from '../models/privateEventChatModel';
import { Express } from 'express';

let app: Express;
let ownerId: string;
let chatId: string;
let eventId: string;

beforeAll(async () => {
  app = await initApp();
  await EventModel.deleteMany({});
  await EventChatModel.deleteMany({});
  await userModel.deleteMany({});

  // Create event owner
  const owner = await userModel.create({
    username: 'eventhost',
    email: 'eventhost@test.com',
    password: 'secret',
  });
  ownerId = owner._id.toString();

  // Create event
  const res = await request(app).post('/events').send({
    name: 'Test Event',
    host: ownerId,
    location: {
      type: 'Point',
      coordinates: [34.78, 32.08]
    },
    startTime: new Date().toISOString(),
    imageUrl: 'event.jpg',
    description: 'Fun test event'
  });

  eventId = res.body.event._id;
  chatId = res.body.chat._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('EventChat functionality', () => {
  test('should send a message to event chat', async () => {
    const res = await request(app).post(`/event-chats/${chatId}/message`).send({
      senderId: ownerId,
      content: 'Event kickoff message'
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Event kickoff message');
  });

  test('should fetch messages from event chat', async () => {
    const res = await request(app).get(`/event-chats/${chatId}/messages`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('should return 404 for non-existent chat', async () => {
    const res = await request(app).get('/event-chats/000000000000000000000000/messages');
    expect(res.status).toBe(404);
  });

  test('should not allow non-owner to send message', async () => {
    const outsider = await userModel.create({
      username: 'outsider',
      email: 'out@test.com',
      password: 'pass123'
    });
  
    const res = await request(app).post(`/event-chats/${chatId}/message`).send({
      senderId: outsider._id.toString(),
      content: 'Hello I do not belong!'
    });
  
    expect(res.status).toBe(403);
  });

  test('should not allow duplicate eventId chat creation', async () => {
  const res = await request(app).post('/event-chats').send({
    eventId,
    ownerId
  });

  expect(res.status).toBe(400);
  expect(res.text).toMatch(/already exists/i);
});
  test('should fail to create event chat without eventId', async () => {
    const res = await request(app).post('/event-chats').send({
      owner: ownerId
    });
  
    expect(res.status).toBe(400);
  });

  test('should fetch the event chat by ID', async () => {
    const res = await request(app).get(`/event-chats/${chatId}/messages`);
  
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should not allow message to expired chat', async () => {
    const expiredEvent = await EventModel.create({
      name: 'Old Event',
      host: ownerId,
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      startTime: new Date(),
      expiresAt: new Date(Date.now() - 1000),
      participants: [ownerId]
    });
  
    const expiredChat = await EventChatModel.create({
      eventId: expiredEvent._id.toString(),
      owner: ownerId,
      messages: [],
      image: null
    });
  
    const res = await request(app).post(`/event-chats/${expiredChat._id}/message`).send({
      senderId: ownerId,
      content: 'Trying to message expired chat'
    });
  
    // You must modify the controller to reject expired chats for this to work.
    expect(res.status).toBe(403);
  });
  
});
