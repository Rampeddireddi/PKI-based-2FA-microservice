import 'dotenv/config';
import fs from 'fs';


const API_URL = 'https://eajeyq4r3zljoq4rpovy2nthda0vtjqf.lambda-url.ap-south-1.on.aws';

async function main() {
  const studentId = process.env.STUDENT_ID;      
  const githubRepoUrl = process.env.GITHUB_REPO; 

  if (!studentId || !githubRepoUrl) {
    console.error('Missing STUDENT_ID or GITHUB_REPO env vars');
    process.exit(1);
  }

  const publicKeyPem = fs.readFileSync('student_public.pem', 'utf8');

  const body = {
    student_id: studentId,
    github_repo_url: githubRepoUrl,
    public_key: publicKeyPem,
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error('API error', res.status, await res.text());
    process.exit(1);
  }

  const json = await res.json();
  if (json.encrypted_seed) {
    fs.writeFileSync('encrypted_seed.txt', json.encrypted_seed.trim());
    console.log('Encrypted seed saved to encrypted_seed.txt');
  } else {
    console.error('Unexpected response:', json);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
