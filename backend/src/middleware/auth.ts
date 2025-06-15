import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function generateToken(payload: Record<string, any>, expiresIn: string = '1h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Extende o tipo Request para incluir o campo user
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Token inválido' });
      }
      (req as AuthenticatedRequest).user = user;
      next();
    });
  } else {
    res.status(401).json({ success: false, message: 'Token não fornecido' });
  }
}
