PKI-Based 2FA Microservice

Repository: https://github.com/Rampeddireddi/PKI-based-2FA-microservice

Docker Container Name: pki-2fa-express
Final Commit Hash: a2f538c

1. Project Purpose

This microservice implements a PKI-based Two-Factor Authentication (2FA) system for the Partnr Network assignment.
It demonstrates:

RSA-encrypted seed exchange

Secure seed decryption

TOTP generation and verification

Docker-based persistent storage

Cron-based OTP logging

Cryptographic commit-proof using RSA-PSS

2. What the Project Implements
A. RSA-OAEP Seed Decryption

The instructor provides an encrypted seed.
The backend decrypts it using student_private.pem and stores the decrypted seed at:

/data/seed.txt


The decrypted seed:

is persistent across container restarts

is never pushed to GitHub

is used for all TOTP generation

B. TOTP-Based 2FA Generation and Verification

The microservice generates and verifies 6-digit TOTP codes using:

30-second time steps

SHA-1 algorithm

Base32 encoded seed

This satisfies the assignment requirement for 2FA functionality.

C. Docker Persistent Volumes

Two directories inside Docker persist across container restarts:

/data  → stores decrypted seed
/cron  → stores OTP logs


This ensures TOTP continues working even after restarting containers.

D. Cron Job Execution Inside Container

A cron entry runs every minute:

* * * * * cd /app && /usr/local/bin/node scripts/log_2fa_cron.js >> /cron/last_code.txt 2>&1


It logs the current OTP:

2025-12-10 08:17:01 - 2FA Code: 304408


This verifies:

cron is running

seed exists

TOTP is valid

Docker volumes are persistent

E. Commit-Proof Signing (RSA-PSS)

The assignment requires proving repository ownership.

Process:

Take commit hash a2f538c

Sign it with student_private.pem using RSA-PSS SHA256

Encrypt the signature using instructor_public.pem

Submit the Base64 output

The script used:

scripts/commit_proof.js

3. API Endpoints
POST /decrypt-seed

Decrypts encrypted seed and stores it in /data/seed.txt.

Example:

{
  "encrypted_seed": "<encrypted seed>"
}

GET /generate-2fa

Returns the current TOTP code and seconds remaining in the 30-second window.

Example:

{
  "code": "391975",
  "valid_for": 18
}

POST /verify-2fa

Verifies a submitted TOTP code.

Request:

{
  "code": "123456"
}


Response:

{
  "valid": true
}

4. Running the Project With Docker

Start containers:

docker-compose up -d


Check running:

docker ps


You should see:

pki-2fa-express

Verify seed persistence

Inside container:

docker exec -it pki-2fa-express sh
cat /data/seed.txt


Restart and check again:

docker-compose down
docker-compose up -d
docker exec -it pki-2fa-express sh
cat /data/seed.txt


The same seed should remain.

Check cron OTP logs
docker exec pki-2fa-express cat /cron/last_code.txt

5. Project Structure
src/
  crypto.js
  totp.js
  routes.js

scripts/
  log_2fa_cron.js
  commit_proof.js

cron/
  2fa-cron

Dockerfile
docker-compose.yml
.gitignore

6. Security Requirements

According to assignment instructions:

Do NOT push:

decrypted seed (seed.txt)

/data/seed.txt

any files inside Docker volumes

Allowed to push:

encrypted seed

public keys

all application code

Seed must only be stored inside Docker volumes.

7. Generating Commit Proof

Run:

node scripts/commit_proof.js a2f538c


Submit:

GitHub repository URL

Commit hash (a2f538c)

The Base64 encrypted proof

This completes the identity verification requirement.

8. Summary

This microservice implements:

RSA-based seed decryption

TOTP generation & verification

Persistent Docker volumes

Cron scheduling inside the container

RSA-PSS commit-proof system

It fully meets the requirements of the PKI-based 2FA assignment.
