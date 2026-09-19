import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'neel-kamal-homestay-jwt-secret-key-kasauli';

export function signToken(payload: object, expiresIn: string | number = '1h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): object {
  try {
    return jwt.verify(token, JWT_SECRET) as object;
  } catch (err) {
    throw new Error('Invalid token');
  }
}
