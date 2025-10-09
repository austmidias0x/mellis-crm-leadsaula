import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadsRoutes from './routes/leads.routes.js';
import authRoutes from './routes/auth.routes.js';
import { authenticateToken } from './middleware/auth.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leads', authenticateToken, leadsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 CRM Backend running on http://localhost:${PORT}`);
});

