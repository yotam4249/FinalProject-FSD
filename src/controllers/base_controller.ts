
import { Request, Response } from "express";
import { Model, PopulateOptions } from "mongoose";

export default class BaseController {
  protected model: Model<any>;
  protected populatePaths: (string | PopulateOptions)[];

  constructor(model: Model<any>, populatePaths: (string | PopulateOptions)[] = []) {
    this.model = model;
    this.populatePaths = populatePaths;
  }

  async getAll(req: Request, res: Response) {
    try {
      const items = await this.model
        .find({ isDeleted: { $ne: true } })
        .populate(this.populatePaths);
      res.status(200).json(items);
    } catch (err) {
      console.error("❌ getAll error:", err);
      res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await this.model
        .findById(req.params.id)
        .populate(this.populatePaths);
      if (!item || item.isDeleted) {
        return res.status(404).send("Not found");
      }
      res.status(200).json(item);
    } catch (err) {
      console.error("❌ getById error:", err);
      res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }


  async create(req: Request, res: Response) {
    try {
      const newItem = await this.model.create(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "An unknown error occurred"  });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const updated = await this.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).send("not found");
      res.status(200).json(updated);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "An unknown error occurred"  });
    }
  }

  async deleteById(req: Request, res: Response) {
    try {
      const deleted = await this.model.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      );
      if (!deleted) return res.status(404).send("not found");
      res.status(200).json({ message: "Soft deleted successfully" });
    } catch (err) {
      res.status(400).json({  error: err instanceof Error ? err.message : "An unknown error occurred" });
    }
  }

  async deleteAll(req: Request, res: Response) {
    try {
      await this.model.updateMany({}, { isDeleted: true });
      res.status(200).json({ message: "All items soft deleted" });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "An unknown error occurred"  });
    }
  }

  async like(req: Request, res: Response) {
    try {
      const item = await this.model.findById(req.params.id);
      if (!item) return res.status(404).send("not found");

      const userId = (req as any).user._id;
      const index = item.likes.indexOf(userId);

      if (index === -1) {
        item.likes.push(userId);
      } else {
        item.likes.splice(index, 1);
      }

      await item.save();
      res.status(200).json({ likes: item.likes });
    } catch (err) {
      res.status(400).json({  error: err instanceof Error ? err.message : "An unknown error occurred"  });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      const items = await this.model.find({
        $text: { $search: typeof q === 'string' ? q : '' },
        isDeleted: { $ne: true },
      }).lean();
      res.status(200).json(items);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "An unknown error occurred"  });
    }
  }
}
