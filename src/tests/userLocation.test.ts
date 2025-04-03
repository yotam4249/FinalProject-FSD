import request from "supertest";
import mongoose from "mongoose";
import initApp from "../server";
import { Express } from "express";
import UserModel from "../models/User_model";
import BusinessModel from "../models/businessProfileModel";
import PromotionModel from "../models/Promotion_model";
import UserLocationModel from "../models/UserLocation_model";

let app: Express;
let token: string;
let userId: string;
let businessId: string;

beforeAll(async () => {
  app = await initApp();

  // Register test user
  const registerRes = await request(app).post("/auth/register").send({
    username: "userlocationtest",
    email: "loc@test.com",
    password: "123456",
    phone: "1111111111",
  });
  expect(registerRes.status).toBe(201);
  expect(registerRes.body._id).toBeDefined();
  userId = registerRes.body._id;

  // Login
  const loginRes = await request(app).post("/auth/login").send({
    username: "userlocationtest",
    password: "123456",
  });
  expect(loginRes.status).toBe(200);
  token = loginRes.body.accessToken;
  expect(token).toBeDefined();

  // Create a test business with matching floor/altitude
  const businessRes = await BusinessModel.create({
    user: userId,
    venueName: "Event Tower",
    location: {
      type: "Point",
      coordinates: [34.7818, 32.0853],
      altitude: 19.8, // ⬅️ Match this to user location
      floor: 6,
    },
    analytics: { visits: 0, engagement: 0 },
  });

  businessId = businessRes._id.toString();
});

test("Update user location with altitude", async () => {
  const res = await request(app)
    .post("/user-location/update")
    .set("Authorization", `Bearer ${token}`)
    .send({
      coordinates: [34.7818, 32.0853],
      altitude: 19.8,
    });

  expect(res.status).toBe(200);
  expect(res.body.coordinates).toBeDefined();
  expect(res.body.floor).toBe(6);
});

test("Get user location by ID", async () => {
  const res = await request(app).get(`/user-location/${userId}`);
  expect(res.status).toBe(200);
  expect(res.body.user).toBe(userId);
});

test("Check if user is in business", async () => {
  const res = await request(app)
    .get(`/user-location/${businessId}/check-in`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.inside).toBe(true);
  expect(res.body.userFloor).toBe(6);
  expect(res.body.businessFloor).toBe(6);
});

afterAll(async () => {
  await UserLocationModel.deleteMany({});
  await BusinessModel.deleteMany({});
  await UserModel.deleteMany({});
  await mongoose.connection.close();
});
