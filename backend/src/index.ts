import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {clientRoutes, userRoutes, paymentRoutes, tabRoutes} from './routes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Backend rodando");
})
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tabs', tabRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});