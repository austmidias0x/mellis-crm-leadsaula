import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { LeadService } from '../../../server/services/lead.service.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyToken(req)) {
    return res.status(401).json({ error: 'Token não fornecido ou inválido' });
  }

  try {
    const { id } = req.query;
    const leadId = parseInt(id as string, 10);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const lead = await leadService.updateLeadStatus(leadId, status);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    return res.status(200).json(lead);
  } catch (error) {
    console.error('Error updating lead status:', error);
    return res.status(500).json({ error: 'Failed to update lead status' });
  }
}

