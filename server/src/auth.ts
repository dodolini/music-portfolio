import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { CONFIG } from './config';

export function generateToken(username: string): string {
  return jwt.sign(
    { sub: username },
    CONFIG.PRIVATE_KEY,
    {
      algorithm: 'RS256',
      expiresIn: '3h',
    }
  );
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, CONFIG.PUBLIC_KEY, { algorithms: ['RS256'] }, (err, payload) => {
    if (err) return res.sendStatus(403);
    (req as any).user = payload;
    next();
  });
} 
