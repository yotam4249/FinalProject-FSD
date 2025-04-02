import { Request, Response } from "express";
import Promotion from "../models/Promotion_model";
import Business from "../models/businessProfileModel";
import BaseController from "./base_controller";

class PromotionController extends BaseController {
  constructor() {
    super(Promotion, [
      { path: "business", select: "venueName user" }
    ]);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
  
      const business = await Business.findOne({ user: userId });
      if (!business) {
        res.status(404).json({ error: "Business not found for user" });
        return;
      }
  
      const newPromotion = await this.model.create({
        ...req.body,
        business: business._id,
      });
  
      business.promotions.push(newPromotion._id);
      await business.save();
  
      res.status(201).json(newPromotion);
    } catch (err) {
      console.error("Create promotion error:", err);
      res.status(400).json({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
    }
}

export default new PromotionController();
