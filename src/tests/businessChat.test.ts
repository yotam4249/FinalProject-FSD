// src/tests/businessChat.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../server';
import BusinessChatModel from '../models/businessChatModel';
import PostModel from '../models/Post_model';
import userModel, { IUser } from '../models/User_model';
import { Express } from 'express';

let app: Express;
let businessId: string;
let chatId: string;

beforeAll(async () => {
  app = await initApp();
  await BusinessChatModel.deleteMany({});
  await userModel.deleteMany({});
  await PostModel.deleteMany({});

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
    posts: [],
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
      content: 'Hello there!',
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Hello there!');
    expect(res.body._id).toBeDefined();
  });

  test('should fetch all messages (posts) in the business chat', async () => {
    const res = await request(app).get(`/business-chats/${chatId}/messages`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('content');
  });

  test('should allow business to send an announcement', async () => {
    const res = await request(app).post(`/business-chats/${chatId}/announcement`).send({
      senderId: businessId,
      content: 'Big Sale Today!',
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Big Sale Today!');
  });

  test('should not allow non-owner to send announcement', async () => {
    const nonOwner = await userModel.create({
      username: 'notbiz',
      email: 'nope@test.com',
      password: 'nope',
    });

    const res = await request(app).post(`/business-chats/${chatId}/announcement`).send({
      senderId: nonOwner._id,
      content: 'Unauthorized!',
    });

    expect(res.status).toBe(403);
  });

  test('should return 404 if chat not found', async () => {
    const res = await request(app).get(`/business-chats/000000000000000000000000/messages`);
    expect(res.status).toBe(404);
  });

  test('should save the sent post in the Post collection', async () => {
    const content = 'A post saved into Post collection';

    const res = await request(app).post(`/business-chats/${chatId}/message`).send({
      senderId: businessId,
      content
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe(content);

    const post = await PostModel.findById(res.body._id);
    expect(post).toBeTruthy();
    expect(post?.content).toBe(content);
  });

  test('should reject message with missing content', async () => {
    const res = await request(app).post(`/business-chats/${chatId}/message`).send({
      senderId: businessId,
    });

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/content is required/i);
  });

  test('should allow sending a message with an image', async () => {
    const res = await request(app).post(`/business-chats/${chatId}/message`).send({
      senderId: businessId,
      content: 'Check this out!',
      imageUrl: 'https://cdn.example.com/image.jpg'
    });

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toBe('https://cdn.example.com/image.jpg');
  });

  test('should upload a chat image', async () => {
    const res = await request(app).put(`/business-chats/${chatId}/upload-image`).send({
      imageUrl: 'https://cdn.example.com/banner.jpg'
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Chat image updated');
    expect(res.body.image).toBe('https://cdn.example.com/banner.jpg');
  });

  test('should return 400 when uploading chat image without imageUrl', async () => {
    const res = await request(app).put(`/business-chats/${chatId}/upload-image`).send({});

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/missing imageUrl/i);
  });

  test('should return 404 when uploading image to nonexistent chat', async () => {
    const res = await request(app).put(`/business-chats/000000000000000000000000/upload-image`).send({
      imageUrl: 'https://cdn.example.com/banner.jpg'
    });

    expect(res.status).toBe(404);
  });
});
