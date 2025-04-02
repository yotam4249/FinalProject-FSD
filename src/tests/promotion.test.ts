import request from "supertest";
import mongoose from "mongoose";
import initApp from "../server";
import { Express } from "express";
import UserModel from "../models/User_model";
import BusinessModel from "../models/businessProfileModel";
import PromotionModel from "../models/Promotion_model";

let app: Express;
let token: string;
let businessId: string;
let userId: string;
let promotionId: string;

beforeAll(async () => {
  app = await initApp();

  // 🟡 Register a business user
  const registerRes = await request(app)
    .post("/business/register")
    .send({
      username: "testbusiness",
      email: "biz@test.com",
      password: "bizpass",
      phone: "1234567890",
      venueName: "Test Venue",
      location: {
        type: "Point",
        coordinates: [34.7818, 32.0853],
      },
      description: "Promo test location",
    });

  expect(registerRes.status).toBe(201);
  expect(registerRes.body.user).toBeDefined();
  expect(registerRes.body.business).toBeDefined();

  userId = registerRes.body.user._id;
  businessId = registerRes.body.business._id;

  // ✅ Login via /auth/login
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ username: "testbusiness", password: "bizpass" });

  expect(loginRes.status).toBe(200);
  token = loginRes.body.accessToken;
  expect(token).toBeDefined();

  // ✅ Create a promotion
  const res = await request(app)
    .post("/promotions")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Special Deal",
      description: "50% Off!",
      image: "http://example.com/image.jpg",
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

  expect(res.status).toBe(201);
  promotionId = res.body._id;
  expect(promotionId).toBeDefined();
});

test("should GET all promotions", async () => {
  const res = await request(app).get("/promotions");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("should GET promotion by id", async () => {
  const res = await request(app).get(`/promotions/${promotionId}`);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(promotionId);
});

test("should LIKE the promotion", async () => {
  const res = await request(app)
    .post(`/promotions/${promotionId}/like`)
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(res.body.likes.length).toBe(1);
});

test("should UNLIKE the promotion", async () => {
  const res = await request(app)
    .post(`/promotions/${promotionId}/like`)
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(res.body.likes.length).toBe(0);
});

test("should SEARCH promotion", async () => {
  const res = await request(app).get(`/promotions/search/query?q=special`);
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
});

test("should SOFT DELETE promotion", async () => {
  const res = await request(app)
    .delete(`/promotions/${promotionId}`)
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
});

test("should NOT return deleted promotion", async () => {
  const res = await request(app).get("/promotions");
  const exists = res.body.some((p: { _id: string }) => p._id === promotionId);
  expect(exists).toBe(false);
});

afterAll(async () => {
  await PromotionModel.deleteMany({});
  await BusinessModel.deleteMany({});
  await UserModel.deleteMany({});
  await mongoose.connection.close();
});
