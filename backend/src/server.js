import express from 'express';
import roomsRoute from './routes/roomsRoute.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/roomsMockedData', roomsRoute);

app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');

});