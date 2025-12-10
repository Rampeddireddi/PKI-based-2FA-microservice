PKI-Based 2FA Microservice

A secure Two-Factor Authentication backend using RSA cryptography, TOTP, Docker, cron jobs, and persistent volumes.

Repository: https://github.com/Rampeddireddi/PKI-based-2FA-microservice

Docker Container Name: pki-2fa-express
Final Commit Hash (used for proof): a2f538c

🧠 1. Why This Project Exists

This project implements a PKI-based Two-Factor Authentication (2FA) microservice, as required by the Partnr Network – Talent Layer for Borderless Societies assignment.

The purpose of this project is to:

✔ Prove identity through cryptographic signing
✔ Implement secure seed exchange using RSA
✔ Generate and verify TOTP (Google Authenticator–compatible) codes
✔ Persist data across Docker restarts
✔ Run scheduled cron tasks inside a container
✔ Demonstrate production-ready microservice behavior

This microservice mimics how real companies implement secure multi-factor authentication using cryptography and isolated infrastructure.

🏗️ 2. What This Project Implements

This backend fulfills all assignment requirements by implementing:

🔐 A. RSA-OAEP Encrypted Seed Handling

The instructor service provides an encrypted seed.

The backend decrypts it using student_private.pem.

The decrypted seed is stored securely in a Docker volume, not in Git.

Seed is saved inside container at:

/data/seed.txt


This seed powers all TOTP generation.

🕒 B. TOTP-Based 2FA (RFC 6238)

The service generates and verifies 6-digit TOTP codes using:

SHA-1

30-second time window

Base32-encoded seed

Related endpoints:

Endpoint	Function
POST /decrypt-seed	Decrypt & persist the seed
GET /generate-2fa	Generate current TOTP + seconds remaining
POST /verify-2fa	Verify user-supplied TOTP
📦 C. Dockerized Persistent Storage

A Docker volume ensures that:

The decrypted seed persists across container rebuilds.

Cron log history is saved.

Docker mounts:

/data  → seed persistence  
/cron  → OTP log persistence

⏲️ D. Cron Job for OTP Logging

A cron job runs every minute inside the container:

* * * * * cd /app && /usr/local/bin/node scripts/log_2fa_cron.js >> /cron/last_code.txt 2>&1


It writes:

2025-12-10 08:15:01 - 2FA Code: 114913


This confirms:

Seed exists

Seed is correct

Cron is functioning

OTP generation is consistent

✍️ E. Commit Signing Using RSA-PSS

To prove assignment authenticity:

You take the commit hash: a2f538c

Sign it with your student private key

Encrypt the signature using the instructor public key

Submit the Base64 output

Script used:

scripts/commit_proof.js


This ensures cryptographic verification of repository ownership.

🌐 3. API Endpoints
POST /decrypt-seed

Decrypts and stores the seed.

Request:

{
  "encrypted_seed": "<string from instructor API>"
}


Response:

{ "status": "ok" }

GET /generate-2fa

Returns a 6-digit OTP + seconds remaining in the 30-second window.

Response:

{
  "code": "391975",
  "valid_for": 18
}

POST /verify-2fa

Validates OTP with ±1 window tolerance.

Request:

{
  "code": "123456"
}


Response:

{
  "valid": true
}

🐳 4. Running the Project in Docker
Start the microservice
docker-compose up -d

Check running container
docker ps


You should see:

pki-2fa-express  ...  Up  8080->8080/tcp

Verify seed persistence
docker exec -it pki-2fa-express sh
cat /data/seed.txt


After restart:

docker-compose down
docker-compose up -d
docker exec -it pki-2fa-express sh
cat /data/seed.txt


The same seed should still be present.

View cron-generated OTP logs
docker exec pki-2fa-express cat /cron/last_code.txt


You will see minute-by-minute codes.

📁 5. Project Structure
PKI-based-2FA-microservice/
│
├── src/
│   ├── crypto.js          # RSA decryption + signing
│   ├── totp.js            # TOTP generation & verification
│   └── routes.js          # Express API routes
│
├── scripts/
│   ├── log_2fa_cron.js    # Cron job to log OTPs every minute
│   └── commit_proof.js    # Signs commit hash for assignment submission
│
├── cron/
│   └── 2fa-cron           # Cron schedule file (LF format)
│
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Volumes, container config
└── .gitignore             # Seed + sensitive files excluded

🔐 6. Security Requirements

The assignment explicitly specifies:

❌ DO NOT COMMIT:

The decrypted seed (seed.txt)

Contents of /data volume

✔ ALLOWED:

Public keys

Encrypted seed

Source code

Docker configuration

✔ EXPECTED:

Seed must persist across container restarts

Cron logs must persist

Final commit must be signed

📝 7. Generating Commit Proof

To produce the required submission proof:

node scripts/commit_proof.js a2f538c


Output example:

===== SUBMISSION PROOF START =====
BASE64_ENCRYPTED_SIGNATURE_HERE==
===== SUBMISSION PROOF END =====


Submit:

GitHub repo URL

Commit hash (a2f538c)

Base64 encrypted proof

This confirms your identity cryptographically.

🎉 8. Summary

This project demonstrates:

RSA key-based secure seed handling

Proper TOTP generation and verification

Dockerized microservice with persistent volumes

Cron-based background job scheduling

Cryptographically signed commit proof

It fully satisfies all requirements of the Partnr PKI-based 2FA assignment.
