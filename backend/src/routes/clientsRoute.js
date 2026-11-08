import express from 'express';
import { createsClients, listsClients } from '../controllers/clientsController.js';

const router = express.Router();

router.get('/', listsClients);

router.post('/', createsClients);


export default router;