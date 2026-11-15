import { Router } from 'express';
import { 
  listEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '../controllers/employeeController.js';

const router = Router();

router.get('/', listEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);        
router.patch('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;