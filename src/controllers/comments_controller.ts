
import { Request, Response } from "express";
import Comment from "../models/Comment_model";
import BaseController from "./base_controller";
import Post from "../models/Post_model";

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
    const { text, post, parentComment } = req.body;
  
    try {
      const newComment = await this.model.create({
        text,
        post,
        user: (req as any).user._id,
        parentComment,
        replies: [],
        likes: []
      });
  
      if (parentComment) {
        await this.model.findByIdAndUpdate(parentComment, {
          $push: { replies: newComment._id }
        });
      }
  
      // Add to post's comments array
      await Post.findByIdAndUpdate(post, {
        $push: { comments: newComment._id }
      });
  
      res.status(201).json(newComment);
    } catch (err) {
      console.error("Create comment error:", err);
      res.status(400).json({
        error: err instanceof Error ? err.message : "An unknown error occurred"
      });
    }
  }
   }

  

export default new CommentsController();
