// src/routes/event_routes.ts
import express from 'express';
import { createEvent, getEventById } from '../controllers/privateEvent_controller';

const router = express.Router();

router.post('/', createEvent);
router.get('/:id', getEventById);

export default router;