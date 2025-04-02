import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import initApp from "../server";
import userModel from "../models/User_model";
import businessModel from "../models/businessProfileModel";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany({});
  await businessModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("BusinessAuthController tests", () => {
  const businessUser = {
    username: "business123",
    email: "biz@test.com",
    password: "securepass",
    phone: "1234567890",
    venueName: "My Cool Venue",
    location: {
      type: "Point",
      coordinates: [34.7818, 32.0853]
    },
    description: "We sell the best stuff!"
  };

  test("should register a business user", async () => {
    const res = await request(app).post("/business/register").send(businessUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.business).toBeDefined();
    expect(res.body.business.venueName).toBe(businessUser.venueName);
    expect(res.body.business.description).toBe(businessUser.description);
  });

  test("should not allow duplicate email", async () => {
    const res = await request(app)
      .post("/business/register")
      .send({ ...businessUser, username: "anotherbiz" });

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Email is already taken/);
  });

  test("should not allow duplicate username", async () => {
    const res = await request(app)
      .post("/business/register")
      .send({ ...businessUser, email: "another@email.com" });

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Username is already taken/);
  });

  test("should fail with missing required fields", async () => {
    const res = await request(app)
      .post("/business/register")
      .send({ email: "bad@test.com" });

    expect(res.status).toBe(400);
  });

  test("should reject registration with missing password", async () => {
    const res = await request(app)
      .post("/business/register")
      .send({
        ...businessUser,
        username: "nopassword",
        email: "nopass@biz.com",
        password: undefined
      });

    expect(res.status).toBe(400);
  });

  test("should reject invalid email format", async () => {
    const res = await request(app)
      .post("/business/register")
      .send({
        ...businessUser,
        username: "bademail",
        email: "not-an-email"
      });

    expect(res.status).toBe(400);
  });

  test("should reject short phone number", async () => {
    const res = await request(app)
      .post("/business/register")
      .send({
        ...businessUser,
        username: "shortphone",
        email: "short@phone.com",
        phone: "123"
      });

    expect(res.status).toBe(400);
  });

  test("should register with valid GeoJSON location", async () => {
    const res = await request(app)
      .post("/business/register")
      .send({
        ...businessUser,
        username: "geojsonbiz",
        email: "geo@biz.com",
        location: {
          type: "Point",
          coordinates: [34.7818, 32.0853]
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.business.location).toMatchObject({
      type: "Point",
      coordinates: [34.7818, 32.0853]
    });
  });
});