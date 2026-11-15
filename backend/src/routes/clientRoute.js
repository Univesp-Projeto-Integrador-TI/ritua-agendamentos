import { Router } from 'express';
import { 
  listClients, 
  getClientById, 
  createClient, 
  updateClient, 
  getClientAppointments 
} from '../controllers/clientController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, listClients);
router.get('/:id', verifyToken, getClientById);
router.post('/', verifyToken, createClient);
router.patch('/:id', verifyToken, updateClient);
router.get('/:id/appointments', verifyToken, getClientAppointments);

export default router;