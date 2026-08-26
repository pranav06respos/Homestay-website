import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET must be configured'); })();

export function signToken(payload: object, expiresIn: string | number = '1h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): object {
  try {
    return jwt.verify(token, JWT_SECRET) as object;
  } catch (err) {
    throw new Error('Invalid token');
  }
}
