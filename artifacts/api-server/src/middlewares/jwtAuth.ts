import { type Request, type Response, type NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

/**
 * Middleware that validates a JWT and ensures the payload contains admin:true.
 */
export function requireAdminJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token) as { admin?: boolean };
    if (!payload.admin) throw new Error('Not admin');
    // Attach payload for downstream handlers if needed
    (req as any).adminPayload = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
