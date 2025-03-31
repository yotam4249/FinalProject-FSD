import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";

let app: Express;
let accessToken: string;
let userId: string;
let postId: string;

beforeAll(async () => {
  app = await initApp();

  // Register user
  await request(app).post("/auth/register").send({
    username: "testuser",
    email: "test@example.com",
    password: "testpass",
    phone: "1234567890"
  });

  // Login user
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ username: "testuser", password: "testpass" });

  accessToken = loginRes.body.accessToken;
  userId = loginRes.body._id;

  // Create post (⚠️ no user field sent!)
  const res = await request(app)
    .post("/posts")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      content: "Testing post!",
      imageUrl: "img.jpg",
      location: {
        type: "Point",
        coordinates: [1, 2]
      }
      // no expiresAt or user — handled by server
    });

  if (res.status !== 201) {
    console.log("❌ Post creation failed:", res.body);
  }

  expect(res.status).toBe(201);
  postId = res.body._id;
});

test("should GET all posts", async () => {
  const res = await request(app).get("/posts");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("should GET post by id", async () => {
  const res = await request(app).get(`/posts/${postId}`);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(postId);
});

test("should LIKE the post", async () => {
  const res = await request(app)
    .post(`/posts/${postId}/like`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ userId });

  expect(res.status).toBe(200);
  expect(res.body.likes).toContain(userId);
});

test("should UNLIKE the post", async () => {
  const res = await request(app)
    .post(`/posts/${postId}/like`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ userId });

  expect(res.status).toBe(200);
  expect(res.body.likes).not.toContain(userId);
});

test("should toggle LIKE again (like back)", async () => {
  const res = await request(app)
    .post(`/posts/${postId}/like`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ userId });

  expect(res.status).toBe(200);
  expect(res.body.likes).toContain(userId);
});

test("should SEARCH for the post", async () => {
  const res = await request(app).get("/posts/search/query?q=Testing");
  expect(res.status).toBe(200);
  expect(res.body.some((p: { _id: string }) => p._id === postId)).toBe(true);
});

test("should SOFT DELETE the post", async () => {
  const res = await request(app)
    .delete(`/posts/${postId}`)
    .set("Authorization", `Bearer ${accessToken}`);
  expect(res.status).toBe(200);
});

test("should NOT return deleted post in GET all", async () => {
  const res = await request(app).get("/posts");
  expect(res.body.some((p: { _id: string }) => p._id === postId)).toBe(false);
});

afterAll(async () => {
  await mongoose.connection.close();
});
