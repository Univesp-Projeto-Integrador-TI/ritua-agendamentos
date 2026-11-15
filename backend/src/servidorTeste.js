import express from 'express';
import { listsClients, createsClients } from './controllers/clientsController.js';

const app = express();
app.use(express.json());

app.get('/clients', listsClients);
app.post('/clients', createsClients);

app.listen(3000, () => console.log('Servidor de teste na porta 3000'));