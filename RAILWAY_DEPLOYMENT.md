# Railway.com Quick Deployment Reference

## 🚀 Quick Deploy Summary

1. **Push to GitHub**: Make sure this repository is pushed to your GitHub account.
2. **Deploy on Railway**: In [Railway.com](https://railway.com), select **New Project &rarr; Deploy from GitHub repo**.
3. **Environment Variables**:
   * **Active Variables (The 5 in your screenshot)**:
     ```env
     PORT=3000
     NODE_ENV=production
     SECRET_KEY=enter_a_strong_random_32_character_secret_here
     CHUNK_SIZE_MB=5
     TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
     ```
   * **Remaining "Suggested Variables"** (`DATABASE_*`, `TELEGRAM_API_*`, etc.):
     You can safely click **✕** or leave them empty. They come from legacy template scanners; Pentaract Faster runs fully self-contained with no external PostgreSQL or MTProto credentials required.
4. **Networking**: Under **Settings &rarr; Networking**, click **Generate Domain**.
5. **Detailed Instructions**: See full guide in [TELEGRAM_AND_RAILWAY_SETUP.md](./TELEGRAM_AND_RAILWAY_SETUP.md).

## 🔒 Cryptographic Standard
- **Cipher**: Open-Source **AES-256-GCM** (NIST SP 800-38D Authenticated Encryption)
- **Slice Size**: 5 MB chunks with 96-bit randomized IVs and 128-bit GMAC authentication tags.
- **Verification**: SHA-256 integrity checksum per chunk.
