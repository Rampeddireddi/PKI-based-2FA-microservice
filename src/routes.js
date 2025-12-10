// src/routes.js
import fs from 'fs';
import path from 'path';
import express from 'express';
import { decryptSeedBase64 } from './crypto.js';
import { generateTotpCode, verifyTotpCode, secondsRemainingInPeriod } from './totp.js';

const router = express.Router();
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

const SEED_PATH = path.join(DATA_DIR, 'seed.txt');

// POST /decrypt-seed
router.post('/decrypt-seed', (req, res) => {
  const { encrypted_seed } = req.body || {};
  console.log('DATA_DIR =', DATA_DIR);
  console.log('requested seed location');
console.log('SEED_PATH =', SEED_PATH);
  if (!encrypted_seed) {
    return res.status(400).json({ error: 'Missing encrypted_seed' });
  }

  try {
    const seed = decryptSeedBase64(encrypted_seed);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SEED_PATH, seed, { encoding: 'utf8', mode: 0o600 });
    return res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Decryption failed' });
  }
});

// GET /generate-2fa
router.get('/generate-2fa', (req, res) => {
  try {
    if (!fs.existsSync(SEED_PATH)) {
      return res.status(500).json({ error: 'Seed not decrypted yet' });
    }

    const hexSeed = fs.readFileSync(SEED_PATH, 'utf8').trim();
    const code = generateTotpCode(hexSeed);
    const validFor = secondsRemainingInPeriod(30);

    return res.json({ code, valid_for: validFor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /verify-2fa
router.post('/verify-2fa', (req, res) => {
  const { code } = req.body || {};

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    if (!fs.existsSync(SEED_PATH)) {
      return res.status(500).json({ error: 'Seed not decrypted yet' });
    }

    const hexSeed = fs.readFileSync(SEED_PATH, 'utf8').trim();
    const valid = verifyTotpCode(hexSeed, code, 1); 

    return res.json({ valid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
