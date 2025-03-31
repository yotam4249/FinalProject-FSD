import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";

let app: Express;
let accessToken: string;
let userId: string;
let postId: string;
let commentId: string;

beforeAll(async () => {
  app = await initApp();

  // Register and login
  await request(app).post("/auth/register").send({
    username: "testuser2",
    email: "test2@example.com",
    password: "testpass",
    phone: "0987654321"
  });

  const loginRes = await request(app)
    .post("/auth/login")
    .send({ username: "testuser2", password: "testpass" });

  accessToken = loginRes.body.accessToken;
  userId = loginRes.body._id;

  // Create post
  const postRes = await request(app)
    .post("/posts")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      content: "Another test post",
      user: userId,
      imageUrl: "img2.jpg",
      location: { type: "Point", coordinates: [3, 4] }
    });

  postId = postRes.body._id;

  // Create comment
  const commentRes = await request(app)
    .post("/comments")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      text: "This is a test comment",
      post: postId,
    });

  commentId = commentRes.body._id;
});

test("should GET all comments", async () => {
  const res = await request(app).get("/comments");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("should GET comment by id", async () => {
  const res = await request(app).get(`/comments/${commentId}`);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(commentId);
});

test("should LIKE the comment", async () => {
  const res = await request(app)
    .post(`/comments/${commentId}/like`)
    .set("Authorization", `Bearer ${accessToken}`);
  expect(res.status).toBe(200);
  expect(res.body.likes.includes(userId)).toBe(true);
});

test("should UNLIKE the comment", async () => {
  const res = await request(app)
    .post(`/comments/${commentId}/like`)
    .set("Authorization", `Bearer ${accessToken}`);
  expect(res.status).toBe(200);
  expect(res.body.likes.includes(userId)).toBe(false);
});

test("should SEARCH for the comment", async () => {
  const res = await request(app).get("/comments/search/query?q=test");
  expect(res.status).toBe(200);
  expect(res.body.some((c: { _id: string }) => c._id === commentId)).toBe(true);
});

test("should SOFT DELETE the comment", async () => {
  const res = await request(app)
    .delete(`/comments/${commentId}`)
    .set("Authorization", `Bearer ${accessToken}`);
  expect(res.status).toBe(200);
});

test("should NOT return deleted comment in GET all", async () => {
  const res = await request(app).get("/comments");
  expect(res.body.some((c: { _id: string }) => c._id === commentId)).toBe(false);
});

afterAll(async () => {
  await mongoose.connection.close();
});
