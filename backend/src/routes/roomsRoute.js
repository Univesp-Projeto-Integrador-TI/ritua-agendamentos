import { Router } from 'express';
import { 
  listRooms, 
  getRoomById, 
  createRoom, 
  updateRoom, 
  updateRoomHours,
  checkAvailability, 
  deleteRoom 
} from '../controllers/roomsController.js';

const router = Router();

router.get('/availability', checkAvailability);

router.get('/', listRooms);
router.get('/:id', getRoomById);
router.post('/', createRoom);
router.patch('/:id', updateRoom);
router.put('/:id/hours', updateRoomHours);
router.delete('/:id', deleteRoom);

export default router;