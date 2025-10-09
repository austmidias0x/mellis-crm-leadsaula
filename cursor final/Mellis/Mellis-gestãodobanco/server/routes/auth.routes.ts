import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const AUTH_PASSWORD_HASH = process.env.AUTH_PASSWORD 
  ? bcrypt.hashSync(process.env.AUTH_PASSWORD, 10)
  : bcrypt.hashSync('mellis123', 10);

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Senha não fornecida' });
    }

    const isValid = await bcrypt.compare(password, AUTH_PASSWORD_HASH);

    if (!isValid) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { authenticated: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

export default router;

