
import { Request, Response } from "express";
import { Model } from "mongoose";

export default class BaseController {
  protected model: Model<any>;
  protected populatePaths?: any[];

  constructor(model: Model<any>, populatePaths?: any[]) {
    this.model = model;
    this.populatePaths = populatePaths;
  }


  async getAll(req: Request, res: Response) {
    try {
      let query = this.model.find({ isDeleted: { $ne: true } });
      if (this.populatePaths) {
        for (const path of this.populatePaths) {
          query = query.populate(path);
        }
      }
      const items = await query.lean();
      res.status(200).json(items);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err instanceof Error ? err.message : "An unknown error occurred" });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  }

  async getById(req: Request, res: Response) {
    try {
      let query = this.model.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
      if (this.populatePaths) {
        for (const path of this.populatePaths) {
          query = query.populate(path);
        }
      }
      const item = await query.lean();
      if (!item) return res.status(404).send("not found");
      res.status(200).json(item);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "An unknown error occurred" });
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

      const userId = req.body.userId;
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
