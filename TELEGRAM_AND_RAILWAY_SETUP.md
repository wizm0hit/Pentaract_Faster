# Pentaract Faster — Telegram Bot, Storage Channel & Railway.com Setup Guide

Welcome to **Pentaract Faster**! This guide provides a complete, step-by-step walkthrough for configuring your Telegram Bots, private storage channels/supergroups, and deploying the complete application with **AES-256-GCM chunked encryption** onto **Railway.com**.

---

## 🔒 Open-Source Encryption Architecture

Pentaract Faster splits every file into smaller encrypted slices for faster transfers, parallel processing, and privacy:

* **Encryption Standard**: **AES-256-GCM** (*Advanced Encryption Standard in Galois/Counter Mode*, standardized under **NIST SP 800-38D**).
* **Cipher Key**: 256-bit symmetric key derived using cryptographic Key Derivation Functions (**KDF / Scrypt**).
* **Initialization Vector (IV)**: 96-bit (12 bytes) cryptographically secure pseudorandom number generated individually for every slice.
* **Authentication Tag**: 128-bit (16 bytes) GMAC authentication tag validating data authenticity and preventing any ciphertext tampering.
* **Integrity Validation**: SHA-256 checksum calculated on each chunk to guarantee complete byte-for-byte fidelity upon reassembly.
* **Chunk Sizing**: Configurable 5 MB slices (optimized for high-speed parallel uploads/downloads without hitting Telegram rate limits).

---

## 📋 Step 1: Create Your Telegram Bot (Storage Worker)

Each Telegram Bot acts as an active **Storage Worker** for dispatching and retrieving file chunks.

1. Open Telegram and search for **[@BotFather](https://t.me/BotFather)** (the official verified Telegram bot builder).
2. Send the command:
   ```text
   /newbot
   ```
3. Enter a friendly display name (e.g. `My Cloud Vault Worker 1`).
4. Enter a unique username ending with `bot` (e.g. `my_pentaract_worker_1_bot`).
5. **@BotFather** will generate an **HTTP API Token** formatted like:
   ```text
   7192837465:AAHq_z8EXAMPLE_KEY_9B4-w1k2l3m4n5o
   ```
6. **Save this token** — you will enter it in Pentaract as a **Storage Worker** and into your Railway environment.

> 💡 **Pro-Tip for Maximum Speed**: You can create 3 to 5 Telegram bots via `@BotFather` and register all of them in Pentaract under **Storage Workers**. Pentaract will automatically round-robin chunks across multiple bots, multiplying transfer speeds and avoiding Telegram rate limits!

---

## 📢 Step 2: Create Telegram Storage Channel / Supergroup & Get Chat ID

1. In Telegram, create a **New Channel** or **New Group** (e.g. `Encrypted Storage Vault Chunks`).
   * Choose **Private Channel** so nobody else can see the raw encrypted chunks.
2. Add your Telegram Bot created in Step 1 to the Channel.
3. Promote the Bot to **Channel Administrator** with the following permissions:
   * ✅ **Post Messages / Send Documents**
   * ✅ **Edit Messages**
   * ✅ **Delete Messages**
4. Send any test message in the channel (e.g. `init`).
5. **Get the Channel Chat ID**:
   * **Method A (Easiest)**: Forward a message from your channel to **[@getmyid_bot](https://t.me/getmyid_bot)** or **[@username_to_id_bot](https://t.me/username_to_id_bot)**. Look for the `Forwarded from chat:` ID.
   * **Method B (Direct Telegram API)**: Open the following URL in your browser:
     ```text
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
     ```
     Look for `"chat":{"id": -1001928374650, ...}`.
6. The Chat ID **must be a negative integer starting with `-100...`** (e.g., `-1001928374650`).

---

## ⚡ Step 3: Connect Storage & Workers in Pentaract

1. Launch your Pentaract instance (or use the web preview).
2. Log in (default admin credentials: `admin@pentaract.local` / `admin`).
3. Navigate to **Storage Workers &rarr; Register Storage Worker**:
   * Name: `Primary Bot Worker`
   * Token: `7192837465:AAHq_...`
   * Click **Verify** to validate real-time connectivity to Telegram.
4. Navigate to **Storage Vaults &rarr; Register Storage Vault**:
   * Name: `My Main Vault`
   * Telegram Chat ID: `-1001928374650`
5. You're now ready to upload, slice, and download encrypted files!

---

## 🚂 Step 4: Deploying Pentaract Faster on Railway.com

Railway is the recommended platform for hosting Pentaract with zero downtime and automatic SSL.

### 4.1 Prerequisites
* A [GitHub](https://github.com) account with this repository pushed.
* A free or paid [Railway.com](https://railway.com) account.

### 4.2 One-Click Deployment on Railway

1. Log into your [Railway Dashboard](https://railway.app/dashboard).
2. Click **+ New Project** &rarr; **Deploy from GitHub repo**.
3. Select your **Pentaract_Faster** repository.
4. Railway will automatically detect the **Dockerfile** and configure the build environment.

### 4.3 Configure Environment Variables in Railway

In your Railway project dashboard, click on your service, navigate to the **Variables** tab.

#### ✅ 1. Active Service Variables (The 5 Key Variables)

| Variable | Recommended Value | Status | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `3000` | **Required** | Port for Express API & static web interface |
| `NODE_ENV` | `production` | **Required** | Enables optimized production runtime |
| `SECRET_KEY` | `32_character_random_string` | **Required** | Symmetric root key for JWT signing & AES-256-GCM derivation |
| `CHUNK_SIZE_MB` | `5` | **Recommended** | Size of each encrypted slice (5 MB is optimal for speed & Telegram limits) |
| `TELEGRAM_BOT_TOKEN` | `7192837465:AAHq_...` | **Recommended** | Primary Telegram Bot API Token from @BotFather |

---

#### ⚙️ 2. Optional Convenience Variables (Defaults are already baked-in)

Railway may suggest these based on codebase analysis. You can either set custom values or leave them blank:

| Variable | Default Value (if omitted) | Description |
| :--- | :--- | :--- |
| `SUPERUSER_EMAIL` | `admin@pentaract.local` | Default administrator login email |
| `SUPERUSER_PASS` | `admin123` | Default administrator login password |
| `ACCESS_TOKEN_EXPIRE_IN_SECS` | `2592000` *(30 days)* | Expiration time for authentication JWT tokens in seconds |
| `REFRESH_TOKEN_EXPIRE_IN_DAYS`| `60` | Refresh token duration in days |
| `CHANNEL_CAPACITY` | `1000` | Vault storage capacity indicator (in GB) |
| `WORKERS` | `2` | Number of concurrent bot workers configured |
| `VITE_API_BASE` | `/api` | Base path for frontend API calls |
| `GEMINI_API_KEY` | *(empty)* | Optional API key for AI file tagging & smart search |

---

#### ℹ️ 3. Legacy / Not Required Variables (Safe to leave blank or delete in Railway)

If Railway lists the following in **Suggested Variables**, click the **✕** or leave them empty:

* `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_PORT`:
  * **Why suggested**: Originates from old Pentaract templates that used external PostgreSQL.
  * **Why not needed**: Pentaract Faster runs fully self-contained with zero external database dependencies.
* `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_API_BASE_URL`:
  * **Why suggested**: Originates from old Telegram MTProto client apps (user accounts).
  * **Why not needed**: Pentaract Faster uses the modern, official **Telegram Bot API** (`TELEGRAM_BOT_TOKEN`), which is significantly faster, safer, and does not risk user account limits.

---

### 4.4 Expose Public URL (Networking)

1. In Railway, go to **Settings** &rarr; **Networking**.
2. Click **Generate Domain** (e.g. `pentaract-production-xxxx.up.railway.app`).
3. Your app is now live and accessible with free HTTPS!

---

## 🧪 Testing & Verification

1. Open your Railway domain in your browser.
2. Log into the web interface.
3. Click **Setup Guide** in the top navigation bar to verify your configuration.
4. Drag and drop any large file (e.g. 50 MB - 500 MB video or archive).
5. Open the **AES-256-GCM Chunk Inspector** by clicking the **Info** button next to the file to inspect:
   * Individual chunk indexes
   * 12-byte IV hex samples
   * 16-byte GMAC Auth tags
   * SHA-256 checksums
6. Click **Decrypt & Download** to test instantaneous multi-chunk assembly and cryptographic verification.

---

## 🛠️ Troubleshooting & FAQs

### 1. `Telegram Error: 400 Bad Request: chat not found`
* **Cause**: The Bot hasn't been added to the channel or the Chat ID is missing the `-100` prefix.
* **Fix**: Ensure the Chat ID is negative (e.g., `-1001928374650`) and your Bot is an **Administrator** in that channel.

### 2. `Telegram Error: 403 Forbidden: bot was blocked by the user`
* **Fix**: Open Telegram, search for your bot username, and press **Start** (`/start`).

### 3. File upload speed is throttled
* **Fix**: Telegram applies per-bot limits (approx. 20-30 uploads/min). Register 2 to 4 additional bots under **Storage Workers** to distribute chunks in parallel.

### 4. Memory or CPU limits on Railway
* **Fix**: Pentaract Faster uses streaming buffers and AES-256-GCM hardware-accelerated ciphers. The base Railway container (512MB RAM) can comfortably handle multi-gigabyte file transfers.
