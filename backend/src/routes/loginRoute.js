import { Router } from 'express';
import { 
  listLogins, 
  getLoginById, 
  updateLogin, 
  deleteLogin 
} from '../controllers/loginController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de gerenciamento de login exigem que o usuário esteja autenticado
router.get('/', verifyToken, listLogins);
router.get('/:id', verifyToken, getLoginById);
router.patch('/:id', verifyToken, updateLogin);
router.delete('/:id', verifyToken, deleteLogin);

export default router;