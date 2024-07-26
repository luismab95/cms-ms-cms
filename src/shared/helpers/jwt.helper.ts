import * as jwt from 'jsonwebtoken';
import { config } from '../environments/load-env';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ERR_401 } from '../constants/message.constants';

export interface TokenInterface {
  userId: number;
  sessionId?: number;
  email: string;
  firstname: string;
  lastname: string;
  iat?: number;
  exp?: number;
}

const { jwtSecretKey } = config.server;

export function generateTemporaltToken(): string {
  return jwt.sign({}, jwtSecretKey!, { expiresIn: '10m' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, jwtSecretKey);
  } catch (err) {
    throw new HttpException(ERR_401, HttpStatus.UNAUTHORIZED);
  }
}
