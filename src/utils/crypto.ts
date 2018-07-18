import * as crypto from 'crypto';

export function generateChecksum(data: unknown, algorithm = 'md5') {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto
    .createHash(algorithm || 'md5')
    .update(dataString, 'utf8')
    .digest('hex');
}

export function compareHash(data: unknown, hash: string) {
  const dataHash = typeof data === 'string' ? generateChecksum(data) : generateChecksum(JSON.stringify(data));
  return dataHash === hash;
}
