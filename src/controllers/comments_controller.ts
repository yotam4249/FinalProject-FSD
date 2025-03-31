
import { Request, Response } from "express";
import Comment from "../models/Comment_model";
import BaseController from "./base_controller";

class CommentsController extends BaseController {
  constructor() {
    super(Comment, [
      { path: "user", select: "username profileImage" },
      {
        path: "replies",
        select: "text user createdAt",
        populate: {
          path: "user",
          select: "username profileImage"
        }
      }
    ]);
  }

  async create(req: Request, res: Response) {
    const { text, postId, owner, parentComment } = req.body;

    try {
      const newComment = await this.model.create({
        text,
        postId,
        owner,
        parentComment,
        replies: [],
        likes: []
      });

      if (parentComment) {
        await this.model.findByIdAndUpdate(parentComment, {
          $push: { replies: newComment._id }
        });
      }

      res.status(201).json(newComment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new CommentsController();
