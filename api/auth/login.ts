import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'mellis123';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Login attempt - Request body:', req.body);
    console.log('Expected password:', AUTH_PASSWORD);
    
    const { password } = req.body;

    if (!password) {
      console.log('No password provided');
      return res.status(400).json({ error: 'Senha não fornecida' });
    }

    console.log('Received password:', password);
    console.log('Password match:', password === AUTH_PASSWORD);

    const isValid = password === AUTH_PASSWORD;

    if (!isValid) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { authenticated: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful, token generated');
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Erro ao fazer login', details: String(error) });
  }
}

