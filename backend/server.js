import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoute from './src/routes/authRoute.js';
import userRoute from './src/routes/userRoute.js';
import loginRoute from './src/routes/loginRoute.js';
import employeeRoute from './src/routes/employeeRoute.js';
import clientRoute from './src/routes/clientRoute.js';
import roomRoute from './src/routes/roomsRoute.js';
import appointmentRoute from './src/routes/appointmentRoute.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  return res.status(200).json({ 
    success: true, 
    message: 'API da clínica rodando.' 
  });
});

// Registro dos Endpoints / Rotas da API
app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/logins', loginRoute);
app.use('/employees', employeeRoute);
app.use('/clients', clientRoute);
app.use('/rooms', roomRoute);
app.use('/appointments', appointmentRoute);

app.use((err, req, res, next) => {
  console.error('Erro interno capturado:', err.stack);
  return res.status(500).json({ 
    success: false, 
    error: 'Ocorreu um erro interno no servidor.' 
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});