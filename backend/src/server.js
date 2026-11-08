import express from 'express';
import roomsRoute from './routes/roomsRoute.js';
import clientsRoute from './routes/clientsRoute.js';


const app = express();
const PORT = 3000;

app.use(express.json());

// guia para as rotas das salas
app.use('/roomsMockedData', roomsRoute);

// guia para as rotas dos clientes
app.use('/clientsMockedData', clientsRoute);

app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');

});




