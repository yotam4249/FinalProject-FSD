import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../server';
import BusinessChatModel from '../models/businessChatModel';
import userModel, { IUser } from '../models/User_model';
import { Express } from 'express';

let app: Express;
let businessId: string;
let chatId: string;

beforeAll(async () => {
  app = await initApp();
  await BusinessChatModel.deleteMany({});
  await userModel.deleteMany({});

  // Create business user
  const business = await userModel.create({
    username: 'bizuser',
    email: 'biz@test.com',
    password: 'password123',
    profileImage: 'default.png'
  }) as IUser;

  businessId = business._id.toString();

  // Create a business chat
  const chat = await BusinessChatModel.create({
    businessId,
    messages: [],
    image: 'chatimage.png'
  });

  chatId = chat._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('BusinessChatController', () => {
  test('should send a message to business chat', async () => {
    const res = await request(app).post(`/business-chats/${chatId}/message`).send({
      senderId: businessId,
      content: 'Hello there!'
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Hello there!');
  });

  test('should fetch all messages in the business chat', async () => {
    const res = await request(app).get(`/business-chats/${chatId}/messages`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should allow business to send an announcement', async () => {
    const res = await request(app).post(`/business-chats/${chatId}/announcement`).send({
      senderId: businessId,
      content: 'Big Sale Today!'
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Big Sale Today!');
  });

  test('should not allow non-owner to send announcement', async () => {
    const nonOwner = await userModel.create({
      username: 'notbiz',
      email: 'nope@test.com',
      password: 'nope'
    });

    const res = await request(app).post(`/business-chats/${chatId}/announcement`).send({
      senderId: nonOwner._id,
      content: 'Unauthorized!'
    });

    expect(res.status).toBe(403);
  });

  test('should return 404 if chat not found', async () => {
    const res = await request(app).get(`/business-chats/000000000000000000000000/messages`);
    expect(res.status).toBe(404);
  });
});