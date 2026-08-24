# Pentaract Faster ⚡

A **performance-focused fork of Pentaract**, optimized for faster file uploads/downloads and improved client-side UI using **MTProto (`mtproto-service`)**.

Pentaract Faster preserves the original idea of using **Telegram as a cloud storage backend**, while improving real-world performance and making the project easier to run as a **server-hosted service** (e.g. on Railway or similar platforms).

---

## 🚀 What’s Improved in This Fork

### ⚡ Performance
- Server-side integration of **`mtproto-service`**
- Direct **MTProto-based** file transfers
- Reduced Telegram API overhead
- Faster upload and download speeds compared to the original implementation

### 🎨 Client-Side / UI
- Improved UI responsiveness
- Smoother navigation and interactions
- Minor usability and layout refinements

> This fork focuses on **speed and user experience**, not a full rewrite.

---

## 📦 Core Features

- Telegram-based cloud storage
- Unlimited file size via chunking
- Faster uploads & downloads (this fork)
- Improved web UI (this fork)
- REST API
- PostgreSQL database
- Server-ready deployment (Railway, Docker, VPS)

---

## 🛠️ Tech Stack

- **Backend:** Node.js
- **Telegram Client:** `mtproto-service`
- **Frontend:** Web UI (served by backend)
- **Database:** PostgreSQL
- **Storage Layer:** Telegram (MTProto)

---

## 🚀 Deployment

Pentaract Faster is designed to run as a **backend service** and can be deployed on:

- Railway
- Any cloud VPS
- Docker-compatible platforms

Detailed deployment instructions (including Railway setup) are provided separately in the repository documentation.

---

## 🧠 How Storage Works

- Each storage corresponds to a **Telegram channel**
- Files are split into chunks to bypass Telegram file-size limits
- Chunks are uploaded and downloaded via **MTProto**
- Files are reassembled server-side

---

## 📂 Supported Operations

- Upload files
- Download files
- Create folders
- View file/folder metadata
- Delete files and folders

---

## 👥 Access Control

Storages support role-based access:
- **Viewer**
- **Editor**
- **Admin**

Permissions can be granted, updated, or revoked per user.

---

## 📈 Performance Notes

Performance improvements come from:
- MTProto-based file transfers
- Reduced request overhead
- Improved client-side rendering

Actual performance gains depend on network conditions, file size, and worker configuration.

---

## ⚠️ Disclaimer

- This project is a **fork** of the original Pentaract project
- Intended for learning, demos, and self-hosting
- Not production-hardened yet

---

## ❤️ Credits

- Original Project: [Pentaract by Dominux](https://github.com/Dominux/Pentaract)
- Fork & Optimizations: **mohitrathore-aiml**

---

## 📄 License

MIT License
