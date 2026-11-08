import express from 'express';
import { listRooms, createRoom } from '../controllers/roomsController.js';

const router = express.Router();

router.get('/', listRooms);

router.post('/', createRoom);

export default router;