
import { Request, Response } from "express";
import Post from "../models/Post_model";
import BaseController from "./base_controller";

class PostsController extends BaseController {
  constructor() {
    super(Post, [
      { path: "owner", select: "username profileImage" },
      {
        path: "comments",
        select: "text user createdAt likes replies",
        populate: [
          {
            path: "user",
            select: "username profileImage"
          },
          {
            path: "replies",
            select: "text user createdAt",
            populate: {
              path: "user",
              select: "username profileImage"
            }
          }
        ]
      }
    ]);
  }

  async create(req: Request, res: Response) {
    const { content, owner, imageUrl, location } = req.body;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      const post = await this.model.create({
        content,
        owner,
        imageUrl,
        location,
        expiresAt
      });
      res.status(201).json(post);
    } catch (err) {
      res.status(400).json({  error: err instanceof Error ? err.message : "An unknown error occurred"  });
    }
  }
}

export default new PostsController();
