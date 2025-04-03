// // src/tests/eventChat.test.ts
// import request from 'supertest';
// import mongoose from 'mongoose';
// import initApp from '../server';
// import userModel from '../models/User_model';
// import eventChatModel from '../models/privateEventChatModel';
// import { Express } from 'express';
// import privateEventModel from '../models/privateEventModel';

// let app: Express;
// let ownerId: string;
// let chatId: string;
// let eventId: string;

// beforeAll(async () => {
//   app = await initApp();
//   await eventChatModel.deleteMany({});
//   await userModel.deleteMany({});
//   await privateEventModel.deleteMany({});

//   // Create owner user
//   const owner = await userModel.create({
//     username: 'eventOwner',
//     email: 'owner@test.com',
//     password: 'pass123',
//   });

//   ownerId = owner._id.toString();

//   // Create event
//   const event = await privateEventModel.create({
//     name: 'Test Event',
//     host: ownerId,
//     location: {
//       type: 'Point',
//       coordinates: [34.78, 32.08],
//     },
//     startTime: new Date(),
//     expiresAt: new Date(Date.now() + 86400000),
//     participants: [ownerId],
//     description: 'testing',
//   });

//   eventId = event._id.toString();

//   // Create chat for the event
//   const chat = await eventChatModel.create({
//     eventId: event._id,
//     owner: ownerId,
//     messages: [],
//     image: 'banner.png',
//   });

//   chatId = chat._id.toString();
// });

// afterAll(async () => {
//   await mongoose.connection.close();
// });

// describe('EventChatController', () => {
//   test('should create an event chat', async () => {
//     const event = await privateEventModel.create({
//       name: 'Another Event',
//       host: ownerId,
//       location: {
//         type: 'Point',
//         coordinates: [35.21, 31.76],
//       },
//       startTime: new Date(),
//       expiresAt: new Date(Date.now() + 86400000),
//       participants: [ownerId],
//       description: 'Another one',
//     });

//     const res = await request(app).post('/event-chats').send({
//       eventId: event._id.toString(), // ✅ correct
//       ownerId: ownerId,
//     });

//     expect(res.status).toBe(201);
//     expect(res.body.eventId).toBe(event._id.toString());
//   });

//   test('should send message to event chat', async () => {
//     const res = await request(app).post(`/event-chats/${chatId}/message`).send({
//       senderId: ownerId,
//       content: 'Hello from event!',
//     });

//     expect(res.status).toBe(200);
//     expect(res.body.content).toBe('Hello from event!');
//   });

//   test('should fetch all messages in the event chat', async () => {
//     const res = await request(app).get(`/event-chats/${chatId}/messages`);

//     expect(res.status).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   });

//   test('should return 404 for non-existent chat', async () => {
//     const res = await request(app).get('/event-chats/000000000000000000000000/messages');

//     expect(res.status).toBe(404);
//   });

//   test('should not create duplicate event chat', async () => {
//     const res = await request(app).post('/event-chats').send({
//       eventId: eventId, // ✅ FIXED: now using correct eventId
//       ownerId: ownerId,
//     });

//     expect(res.status).toBe(400);
//     expect(res.text).toMatch(/already exists/i);
//   });

//   test('should not create chat with missing eventId', async () => {
//     const res = await request(app).post('/event-chats').send({
//       ownerId: ownerId,
//     });

//     expect(res.status).toBe(400);
//   });

//   test('should not create chat with missing ownerId', async () => {
//     const res = await request(app).post('/event-chats').send({
//       eventId: eventId,
//     });

//     expect(res.status).toBe(400);
//   });

//   test('should send message with image in event chat', async () => {
//     const res = await request(app).post(`/event-chats/${chatId}/message`).send({
//       senderId: ownerId,
//       content: 'Here is the image!',
//       imageUrl: 'https://example.com/image.png',
//     });

//     expect(res.status).toBe(200);
//     expect(res.body.imageUrl).toBe('https://example.com/image.png');
//     expect(res.body.content).toBe('Here is the image!');
//   });

//   test('should return 404 when sending message to non-existent chat', async () => {
//     const res = await request(app).post('/event-chats/000000000000000000000000/message').send({
//       senderId: ownerId,
//       content: 'Message to ghost chat',
//     });

//     expect(res.status).toBe(404);
//   });
// });
// src/tests/eventChat.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../server';
import userModel from '../models/User_model';
import eventChatModel from '../models/privateEventChatModel';
import privateEventModel from '../models/privateEventModel';
import postModel from '../models/Post_model';
import { Express } from 'express';

let app: Express;
let ownerId: string;
let chatId: string;
let eventId: string;

beforeAll(async () => {
  app = await initApp();
  await Promise.all([
    eventChatModel.deleteMany({}),
    privateEventModel.deleteMany({}),
    userModel.deleteMany({}),
    postModel.deleteMany({})
  ]);

  const owner = await userModel.create({
    username: 'eventOwner',
    email: 'owner@test.com',
    password: 'pass123',
  });

  ownerId = owner._id.toString();

  const event = await privateEventModel.create({
    name: 'Test Event',
    host: ownerId,
    location: {
      type: 'Point',
      coordinates: [34.78, 32.08],
    },
    startTime: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    participants: [ownerId],
    description: 'testing',
  });

  eventId = event._id.toString();

  const chat = await eventChatModel.create({
    eventId,
    owner: ownerId,
    posts: [],
    image: 'banner.png',
  });

  chatId = chat._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('EventChatController', () => {
  test('should create a new event chat', async () => {
    const event = await privateEventModel.create({
      name: 'Another Event',
      host: ownerId,
      location: {
        type: 'Point',
        coordinates: [35.21, 31.76],
      },
      startTime: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
      participants: [ownerId],
      description: 'Another one',
    });

    const res = await request(app).post('/event-chats').send({
      eventId: event._id.toString(),
      ownerId,
    });

    expect(res.status).toBe(201);
    expect(res.body.eventId).toBe(event._id.toString());
  });

  test('should send a message (post) to event chat', async () => {
    const res = await request(app).post(`/event-chats/${chatId}/message`).send({
      senderId: ownerId,
      content: 'Hello from event!',
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Hello from event!');

    const postExists = await postModel.findById(res.body._id);
    expect(postExists).not.toBeNull();
  });

  test('should fetch all posts in the event chat', async () => {
    const res = await request(app).get(`/event-chats/${chatId}/messages`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should return 404 for non-existent chat', async () => {
    const res = await request(app).get('/event-chats/000000000000000000000000/messages');
    expect(res.status).toBe(404);
  });

  test('should not create duplicate chat for the same event', async () => {
    const res = await request(app).post('/event-chats').send({
      eventId,
      ownerId,
    });

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/already exists/i);
  });

  test('should return 400 for missing eventId', async () => {
    const res = await request(app).post('/event-chats').send({ ownerId });
    expect(res.status).toBe(400);
  });

  test('should return 400 for missing ownerId', async () => {
    const res = await request(app).post('/event-chats').send({ eventId });
    expect(res.status).toBe(400);
  });

  test('should send image post in event chat', async () => {
    const res = await request(app).post(`/event-chats/${chatId}/message`).send({
      senderId: ownerId,
      content: 'Image message',
      imageUrl: 'https://example.com/image.jpg',
    });

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toBe('https://example.com/image.jpg');
  });

  test('should return 404 when posting to non-existent chat', async () => {
    const res = await request(app).post('/event-chats/000000000000000000000000/message').send({
      senderId: ownerId,
      content: 'Message to ghost chat',
    });

    expect(res.status).toBe(404);
  });

  test('should not allow non-owner to send post', async () => {
    const user = await userModel.create({
      username: 'notOwner',
      email: 'non@test.com',
      password: 'nonpass',
    });

    const res = await request(app).post(`/event-chats/${chatId}/message`).send({
      senderId: user._id,
      content: 'Not allowed',
    });

    expect(res.status).toBe(403);
  });
});
