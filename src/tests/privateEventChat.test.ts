// src/tests/eventChat.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../server';
import userModel from '../models/User_model';
import eventChatModel from '../models/privateEventChatModel';
import { Express } from 'express';

let app: Express;
let ownerId: string;
let chatId: string;

beforeAll(async () => {
  app = await initApp();
  await eventChatModel.deleteMany({});
  await userModel.deleteMany({});

  // Create owner user
  const owner = await userModel.create({
    username: 'eventOwner',
    email: 'owner@test.com',
    password: 'pass123',
  });

  ownerId = owner._id.toString();

  // Create event chat
  const chat = await eventChatModel.create({
    eventId: 'event123',
    owner: ownerId,
    messages: [],
    image: 'banner.png',
  });

  chatId = chat._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('EventChatController', () => {
  test('should create an event chat', async () => {
    const res = await request(app).post('/event-chats').send({
      eventId: 'event456',
      ownerId: ownerId, // ✅ FIXED: Use "ownerId" instead of "owner"
    });

    expect(res.status).toBe(201);
    expect(res.body.eventId).toBe('event456');
  });

  test('should send message to event chat', async () => {
    const res = await request(app).post(`/event-chats/${chatId}/message`).send({
      senderId: ownerId,
      content: 'Hello from event!',
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Hello from event!');
  });

  test('should fetch all messages in the event chat', async () => {
    const res = await request(app).get(`/event-chats/${chatId}/messages`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should return 404 for non-existent chat', async () => {
    const res = await request(app).get('/event-chats/000000000000000000000000/messages');

    expect(res.status).toBe(404);
  });

  test('should not create duplicate event chat', async () => {
    const res = await request(app).post('/event-chats').send({
      eventId: 'event123', // already created in beforeAll
      ownerId: ownerId,
    });
  
    expect(res.status).toBe(200); // Assuming controller returns existing chat
    expect(res.body.eventId).toBe('event123');
  });
  
  test('should not create chat with missing eventId', async () => {
    const res = await request(app).post('/event-chats').send({
      ownerId: ownerId,
    });
  
    expect(res.status).toBe(400);
  });
  
  test('should not create chat with missing ownerId', async () => {
    const res = await request(app).post('/event-chats').send({
      eventId: 'event789',
    });
  
    expect(res.status).toBe(400);
  });
  
  test('should send message with image in event chat', async () => {
    const res = await request(app).post(`/event-chats/${chatId}/message`).send({
      senderId: ownerId,
      content: 'Here is the image!',
      imageUrl: 'https://example.com/image.png',
    });
  
    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toBe('https://example.com/image.png');
    expect(res.body.content).toBe('Here is the image!');
  });
  
  test('should return 404 when sending message to non-existent chat', async () => {
    const res = await request(app).post('/event-chats/000000000000000000000000/message').send({
      senderId: ownerId,
      content: 'Message to ghost chat',
    });
  
    expect(res.status).toBe(404);
  });
});
