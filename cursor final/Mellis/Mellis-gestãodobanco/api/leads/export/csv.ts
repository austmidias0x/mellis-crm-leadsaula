import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { LeadService } from '../../../server/services/lead.service.js';
import type { LeadsFilters } from '../../../server/types/lead.js';

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
    const filters: LeadsFilters = {
      search: req.query.search as string,
      profession: req.query.profession as string,
      difficulty: req.query.difficulty as string,
      region: req.query.region as string,
      utm_campaign: req.query.utm_campaign as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    };

    const csv = await leadService.exportToCsv(filters);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.csv`);
    return res.status(200).send('\uFEFF' + csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return res.status(500).json({ error: 'Failed to export CSV' });
  }
}

