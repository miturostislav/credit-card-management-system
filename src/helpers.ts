import crypto from 'crypto';
import { DBConnection } from './db';
import { Response } from 'express';

const algorithm = 'aes-256-ctr';
const IV_LENGTH = 16;

export function encrypt(value: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(process.env.CARD_ENCRYPTION_SECRET_KEY, 'base64'), iv);
  let encrypted = cipher.update(value);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(value: string): string {
  const textParts = value.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(process.env.CARD_ENCRYPTION_SECRET_KEY, 'base64'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function handlerError(res: Response, db: DBConnection |  null, error: Error) {
  console.error(error);
  res.status(500).send(({ message: 'Internal error' }));
  if (db) {
    await db.close();
  }
}