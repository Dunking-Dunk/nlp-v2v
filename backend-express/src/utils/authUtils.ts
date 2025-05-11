import jwt from 'jsonwebtoken';
import * as CryptoJS from 'crypto-js';
import { randomBytes } from 'crypto';
import { config } from '../config';

// Default verification token expiration (24 hours)
export const VERIFICATION_TOKEN_EXPIRES_IN_HOURS = 24;

interface TokenPayload {
  id: string;
}

/**
 * Generate a JWT token for a user
 */
export const generateToken = (userId: string): string => {
  // Use alternative approach with ignoring TypeScript for the JWT options
  const payload = { id: userId };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return token;
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Hash a password using CryptoJS
 */
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

/**
 * Verify if a password matches the hashed password
 */
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const hashedInput = CryptoJS.SHA256(password).toString();
  return hashedInput === hashedPassword;
};

/**
 * Generate a random token for email verification or password reset
 */
export const generateRandomToken = (): string => {
  return randomBytes(32).toString('hex');
};

/**
 * Generate an expiration date for a verification token
 * @param hoursValid How long the token should be valid for in hours
 * @returns Date object representing the expiration time
 */
export const generateTokenExpiration = (hoursValid: number = VERIFICATION_TOKEN_EXPIRES_IN_HOURS): Date => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hoursValid);
  return expiration;
}; 