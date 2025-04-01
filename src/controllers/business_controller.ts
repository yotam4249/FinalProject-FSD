import { Request, Response } from 'express';
import { AuthController } from './auth_controller';
import BusinessModel from '../models/IBusinessProfile_model';

export class BusinessAuthController extends AuthController {
    public async register(req: Request, res: Response) {
    try {
      // Create base user using AuthController logic
      const user = await this.createUserFromData(req.body);

      // Extract business-specific fields
      const { venueName, location, description, promotions = [] } = req.body;

      // Create the Business document
      const business = await BusinessModel.create({
        user: user!!._id,
        venueName,
        location,
        description,
        promotions,
        analytics: { visits: 0, engagement: 0 }
      });

      res.status(201).json({ user, business });
    } catch (err: any) {
      console.error("Error in BusinessAuthController.register:", err);
      res.status(400).send(err.message || 'Server error');
    }
  };
}
