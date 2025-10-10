import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'mellis123';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get body - Vercel already parses JSON
    const body = req.body || {};
    const password = body.password;

    console.log('=== Login Debug ===');
    console.log('Body type:', typeof req.body);
    console.log('Body:', JSON.stringify(req.body));
    console.log('Password received:', password);
    console.log('Expected password:', AUTH_PASSWORD);

    // Validate password exists
    if (!password) {
      console.log('ERROR: No password provided');
      return res.status(400).json({ 
        error: 'Senha não fornecida',
        debug: { bodyReceived: typeof req.body }
      });
    }

    // Check password
    if (password !== AUTH_PASSWORD) {
      console.log('ERROR: Invalid password');
      return res.status(401).json({ 
        error: 'Senha incorreta',
        debug: { received: password, expected: AUTH_PASSWORD }
      });
    }

    // Generate token
    const token = jwt.sign(
      { authenticated: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('SUCCESS: Login successful');
    return res.status(200).json({ token });

  } catch (error: any) {
    console.error('EXCEPTION in login:', error);
    return res.status(500).json({ 
      error: 'Erro ao fazer login', 
      message: error.message,
      stack: error.stack 
    });
  }
}
