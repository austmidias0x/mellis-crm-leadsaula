import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { LeadService } from '../../server/services/lead.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const leadService = new LeadService();

function verifyToken(req: VercelRequest): boolean {
  const authHeader = req.headers['authorization'] as string;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return false;

  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyToken(req)) {
    return res.status(401).json({ error: 'Token não fornecido ou inválido' });
  }

  try {
    console.log('=== Fetching Stats ===');
    const stats = await leadService.getStats();
    console.log('Stats retrieved:', stats);
    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('ERROR fetching stats:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch stats',
      message: error.message,
      stack: error.stack
    });
  }
}

