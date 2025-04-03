import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../server';
import userModel from '../models/User_model';
import PrivateChatModel from '../models/privateChatModel';
import { Express } from 'express';

let app: Express;
let user1Id: string;
let user2Id: string;
let chatId: string;

beforeAll(async () => {
  app = await initApp();
  await PrivateChatModel.deleteMany({});
  await userModel.deleteMany({});

  const user1 = await userModel.create({
    username: 'user1',
    email: 'user1@test.com',
    password: 'password1'
  });

  const user2 = await userModel.create({
    username: 'user2',
    email: 'user2@test.com',
    password: 'password2'
  });

  user1Id = user1._id.toString();
  user2Id = user2._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('PrivateChatController', () => {
  test('should create a private chat between two users', async () => {
    const res = await request(app).post('/private-chats').send({
      user1Id,
      user2Id
    });

    expect(res.status).toBe(201);
    expect(res.body.participants.map((id: any) => id.toString())).toEqual(
      expect.arrayContaining([user1Id, user2Id])
    );

    chatId = res.body._id;
  });

  test('should not create duplicate chat between same users', async () => {
    const res = await request(app).post('/private-chats').send({
      user1Id,
      user2Id
    });

    expect(res.status).toBe(200); // Existing chat returned
    expect(res.body._id).toBe(chatId);
  });

  test('should send a message in private chat', async () => {
    const res = await request(app).post(`/private-chats/${chatId}/message`).send({
      senderId: user1Id,
      content: 'Hey there!'
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Hey there!');
  });

  test('should retrieve messages in private chat', async () => {
    const res = await request(app).get(`/private-chats/${chatId}/messages`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].content).toBe('Hey there!');
  });

  test('should return 404 for non-existent chat', async () => {
    const res = await request(app).get('/private-chats/000000000000000000000000/messages');
    expect(res.status).toBe(404);
  });

  test('should reject message with missing content', async () => {
    const res = await request(app).post(`/private-chats/${chatId}/message`).send({
      senderId: user1Id
    });

    expect(res.status).toBe(400);
    expect(res.text.toLowerCase()).toMatch(/content is required/i);
  });

  test('should allow sending image message', async () => {
    const res = await request(app).post(`/private-chats/${chatId}/message`).send({
      senderId: user1Id,
      content: 'Image msg',
      imageUrl: 'https://cdn.example.com/img.jpg'
    });

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toBe('https://cdn.example.com/img.jpg');
  });

});
