import { Router } from 'express';
import { 
  listClients, 
  getClientById, 
  createClient, 
  updateClient, 
  getClientAppointments 
} from '../controllers/clientController.js';

const router = Router();

router.get('/', listClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.get('/:id/appointments', getClientAppointments);

export default router;