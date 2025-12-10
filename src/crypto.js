// src/crypto.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PRIVATE_KEY_PATH = path.join(process.cwd(), 'student_private.pem');
const INSTRUCTOR_PUBLIC_KEY_PATH = path.join(process.cwd(), 'instructor_public.pem');

export function loadStudentPrivateKey() {
  return fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

export function loadInstructorPublicKey() {
  return fs.readFileSync(INSTRUCTOR_PUBLIC_KEY_PATH, 'utf8');
}

// Step 5: decrypt seed (RSA/OAEP-SHA256, MGF1 with SHA-256)
export function decryptSeedBase64(encryptedSeedB64) {
  const privateKey = loadStudentPrivateKey();
  const buffer = Buffer.from(encryptedSeedB64, 'base64');

  let plaintext;
  try {
    plaintext = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer
    );
  } catch (e) {
    throw new Error('RSA decryption failed');
  }

  const seed = plaintext.toString('utf8').trim();

  if (seed.length !== 64 || !/^[0-9a-f]+$/.test(seed)) {
    throw new Error('Decrypted seed is not a 64-char hex string');
  }

  return seed;
}

// Step 13: sign commit hash (RSA-PSS-SHA256)
export function signMessage(message) {
  const privateKey = loadStudentPrivateKey();
  const signer = crypto.createSign('sha256');
  signer.update(message, 'utf8');
  signer.end();

  const signature = signer.sign({
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN,
  });

  return signature; // Buffer
}

// Step 13: encrypt signature with instructor public key
export function encryptWithInstructorPublicKey(data) {
  const publicKey = loadInstructorPublicKey();

  const ciphertext = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    data
  );

  return ciphertext; // Buffer
}
