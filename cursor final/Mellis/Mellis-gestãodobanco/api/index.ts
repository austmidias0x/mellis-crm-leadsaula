import express from 'express';
import cors from 'cors';
import leadsRoutes from '../server/routes/leads.routes.js';
import authRoutes from '../server/routes/auth.routes.js';
import { authenticateToken } from '../server/middleware/auth.middleware.js';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leads', authenticateToken, leadsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;

