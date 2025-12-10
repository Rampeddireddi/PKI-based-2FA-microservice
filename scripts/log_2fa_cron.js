// scripts/log_2fa_cron.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTotpCode } from '../src/totp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Docker we’ll set DATA_DIR=/data, but keep a safe default for local
const DATA_DIR = path.join(process.cwd(), 'data');
const SEED_PATH = path.join(DATA_DIR, 'seed.txt');

async function main() {
  try {
    if (!fs.existsSync(SEED_PATH)) {
      console.error('Seed file not found at', SEED_PATH);
      return;
    }

    const hexSeed = fs.readFileSync(SEED_PATH, 'utf8').trim();
    if (!hexSeed) {
      console.error('Seed file is empty');
      return;
    }

    const code = generateTotpCode(hexSeed);

    const now = new Date(); // In Docker we’ll use TZ=UTC
    const iso = now.toISOString().replace('T', ' ').substring(0, 19); // YYYY-MM-DD HH:MM:SS

    console.log(`${iso} - 2FA Code: ${code}`);
  } catch (err) {
    console.error('Error in log_2fa_cron:', err);
  }
}

main();
