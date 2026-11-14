import { Router } from 'express';
import { 
  listAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointment, 
  updateAppointmentStatus, 
  deleteAppointment 
} from '../controllers/appointmentController.js';

const router = Router();

router.get('/', listAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.patch('/:id', updateAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

export default router;