import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.SECRET || '12345678901234567890123456789012';
export const JWT_REFRESH_TOKEN = process.env.SECRET || '12345678901234567890123456789012';
export const JWT_EXPIRES_IN = '60m';
export const JWT_EXPIRES_TOKEN = '30d';