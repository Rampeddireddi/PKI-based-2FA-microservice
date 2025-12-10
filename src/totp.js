// src/totp.js (CommonJS)
import { totp } from 'otplib';
import base32Encode from 'base32-encode';

export function hexToBase32(hexSeed) {
  const buf = Buffer.from(hexSeed, 'hex');
  return base32Encode(buf, 'RFC4648', { padding: false });
}

export function generateTotpCode(hexSeed) {
  const secret = hexToBase32(hexSeed);

  totp.options = {
    step: 30,
    digits: 6,
    algorithm: 'sha1',
  };

  return totp.generate(secret);
}

export function verifyTotpCode(hexSeed, code, validWindow = 1) {
  const secret = hexToBase32(hexSeed);

  totp.options = {
    step: 30,
    digits: 6,
    algorithm: 'sha1',
  };

  return totp.check(code, secret, { window: validWindow });
}

export function secondsRemainingInPeriod(period = 30) {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

