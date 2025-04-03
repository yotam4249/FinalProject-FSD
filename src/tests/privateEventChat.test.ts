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
// let eventId:string

// beforeAll(async () => {
//   app = await initApp();
//   await eventChatModel.deleteMany({});
//   await userModel.deleteMany({});
//   // Create owner user
//   const owner = await userModel.create({
//     username: 'eventOwner',
//     email: 'owner@test.com',
//     password: 'pass123',
//   });

//   ownerId = owner._id.toString();

//   // Create event chat
//   const event = await privateEventModel.create({
//     name: 'Test Event',
//     host: ownerId,
//     location: {
//       type: 'Point',
//       coordinates: [34.78, 32.08]
//     },
//     startTime: new Date(),
//     expiresAt: new Date(Date.now() + 86400000),
//     participants: [ownerId],
//     description: 'testing'
//   });
  
//   const chat = await eventChatModel.create({
//     eventId: event._id, // ✅ ObjectId אמיתי
//     owner: ownerId,
//     messages: [],
//     image: 'banner.png'
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
//       description: 'Another one'
//     });
  
//     const res = await request(app).post('/event-chats').send({
//       eventId: event._id.toString(), // ✅ ObjectId אמיתי
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
//       eventId: chatId, // ❌ לא נכון, צריך את ה־event._id, לא ה־chatId
//       ownerId: ownerId,
//     });
  
//     expect(res.status).toBe(400); // כי הוא אמור להחזיר 400 על שיחה כפולה
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
//       eventId: 'event789',
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
import { Express } from 'express';
import privateEventModel from '../models/privateEventModel';

let app: Express;
let ownerId: string;
let chatId: string;
let eventId: string;

beforeAll(async () => {
  app = await initApp();
  await eventChatModel.deleteMany({});
  await userModel.deleteMany({});
  await privateEventModel.deleteMany({});

  // Create owner user
  const owner = await userModel.create({
    username: 'eventOwner',
    email: 'owner@test.com',
    password: 'pass123',
  });

  ownerId = owner._id.toString();

  // Create event
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

  // Create chat for the event
  const chat = await eventChatModel.create({
    eventId: event._id,
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
      eventId: event._id.toString(), // ✅ correct
      ownerId: ownerId,
    });

    expect(res.status).toBe(201);
    expect(res.body.eventId).toBe(event._id.toString());
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
      eventId: eventId, // ✅ FIXED: now using correct eventId
      ownerId: ownerId,
    });

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/already exists/i);
  });

  test('should not create chat with missing eventId', async () => {
    const res = await request(app).post('/event-chats').send({
      ownerId: ownerId,
    });

    expect(res.status).toBe(400);
  });

  test('should not create chat with missing ownerId', async () => {
    const res = await request(app).post('/event-chats').send({
      eventId: eventId,
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
