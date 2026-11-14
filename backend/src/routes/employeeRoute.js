import express from 'express';
import { registerEmployeeWithLogin } from '../controllers/employeeController.js';

const router = express.Router();

// POST route for registering an employee with login
router.post('/register', registerEmployeeWithLogin);

export default router;