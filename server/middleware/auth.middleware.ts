import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';

export interface AuthRequest extends Request {
  user?: { authenticated: boolean };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user as { authenticated: boolean };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

