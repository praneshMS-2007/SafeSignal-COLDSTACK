# SafeSignal — Industrial Safety Intelligence System
> **AI/NLP Engine to Detect Serious Injury & Fatality (SIF) Precursors in Safety Reports**  
> *Developed for Oil India Limited (Ministry of Petroleum & Natural Gas) · SIH 2026 · Team COLDSTACK*

---

## 🎯 Overview
**SafeSignal** is an AI-powered industrial safety intelligence platform designed for frontline oil and gas operations. It transforms messy, multilingual field safety observations into structured risk intelligence using the **Safety Classification & Learning (SCL) Model** and maps every event to the **9 IOGP Life-Saving Rules**.

### Key Differentiators & Features
- ⚡ **Energy & Barrier Decision Logic**: Classifies incidents into **PSIF** (Potential SIF), **SIF**, **Capacity Events**, and **Routine Observations** based on lethal energy presence, kill thresholds, worker proximity, and barrier reliability.
- 🤖 **Dual-Pass Consensus Engine**: Combines deterministic domain rules with Google Gemini NLP. If rules and AI disagree or uncertainty exists, the system **fails safe** and escalates for safety officer review.
- ❓ **One-Question Coach**: When a report lacks essential facts (e.g. unknown barrier status), it generates exactly one targeted Yes/No question in seconds.
- 🔄 **Closed-Loop Safety & 30-Day Watch**: Corrective action repair tickets enter an automated 30-day verification watch. If a repeat barrier failure occurs at the same site, the ticket **automatically reopens and escalates**.
- 🔐 **Role-Based Access & User Management**: Unified authentication with distinct workspaces for **Field Employees** and **HSE Safety Officers / Admins**.
- 📸 **Privacy-Preserving Field Input**: Multi-modal reporting (Text, Speech-to-Text, Tap Hazard Grid, and Photo upload with automated face blurring).
- 📡 **Offline-Ready PWA**: Service Worker caching and IndexedDB offline queue for remote rig operations without network connectivity.

---

## 🏗️ Tech Stack
- **Frontend / Framework**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Design System**: Industrial Precision (High-contrast, 56px touch targets, Inter & JetBrains Mono typography)
- **Database & ORM**: Prisma ORM with SQLite (Development) / PostgreSQL (Production)
- **AI & NLP**: Google Gemini API (Flash-Lite tier) with domain-specific rule fallback
- **Authentication**: Session cookie management with bcrypt password hashing

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/praneshMS-2007/SafeSignal-COLDSTACK.git
cd SafeSignal-COLDSTACK

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
DATABASE_URL="file:./dev.db"

# Optional: Add your Google Gemini API key for live AI extraction
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Database Setup & Seed
```bash
# Push Prisma schema
npx prisma db push

# Seed initial demonstration data (sites, barriers, sample reports, users)
npx tsx prisma/seed.ts
```

### 5. Run the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 👥 Demo Accounts

| Role | Username | Password | Default Workspace |
|---|---|---|---|
| **Safety Officer / Admin** | `admin` or `officer1` | `password` | Triage Queue, Barrier Health, User Management, Tickets |
| **Field Employee** | `worker1` or `worker2` | `password` | Hazard Reporting, My Safety Reports, Notifications |

---

## 📂 Project Structure
```
├── prisma/
│   ├── schema.prisma       # Database models (Report, Classification, Ticket, User, Notification, etc.)
│   └── seed.ts             # Comprehensive seed script with realistic OIL data
├── public/
│   ├── images/             # Static assets and telemetry banner graphics
│   ├── manifest.json       # PWA Manifest
│   └── sw.js               # Service Worker for offline reporting queue
├── src/
│   ├── app/
│   │   ├── api/            # REST API endpoints (auth, reports, triage, tickets, users, barriers, sync)
│   │   ├── alert/          # Stop Work Red Alert screen
│   │   ├── barriers/       # Barrier Health & MTBF Dashboard
│   │   ├── coach/          # One-Question Coach interface
│   │   ├── login/          # Split-screen industrial login portal
│   │   ├── notifications/  # Closed-loop reporter notifications
│   │   ├── reports/        # My Safety Reports & Detailed AI Analysis
│   │   ├── tickets/        # Repair ticket tracking & evidence management
│   │   ├── triage/         # Fatal-potential ranked Triage Queue
│   │   ├── users/          # Employee & User account administration
│   │   └── page.tsx        # Operations Dashboard & Decision tree reference
│   ├── components/         # Reusable layouts, Sidebar, BottomNav, AuthProvider
│   └── lib/
│       ├── ai/             # SIF classifier & rule-based decision tree
│       ├── auth.ts         # Session helpers
│       └── db.ts           # Prisma client singleton
└── package.json
```

---

## 📜 License
Developed for **Smart India Hackathon (SIH) 2026** under the problem statement for **Oil India Limited**. All rights reserved.
