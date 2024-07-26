import { AES, enc } from 'crypto-js';
import { config } from '../environments/load-env';

export function encryptedData(data: string): string {
  const cryptoKey = config.server.cryptoKey;
  const encrypt = AES.encrypt(data, cryptoKey!);
  data = encrypt.toString();
  return data;
}

export function decryptedData(data: any): string {
  const cryptoKey = config.server.cryptoKey;
  data = AES.decrypt(data, cryptoKey!);
  data = data.toString(enc.Utf8);
  return data;
}
