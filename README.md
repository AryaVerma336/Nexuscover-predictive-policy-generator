# ◈ NexusCover — Predictive Policy Engine

> **AI-Powered InsurTech Platform for Next-Generation Emerging Risks**

NexusCover is an advanced InsurTech policy engine that leverages generative AI to analyze novel 21st-century risk landscapes—from autonomous drone swarms and AI liability to orbital space debris and quantum decryption—and instantly architect actuarially-structured, hackathon-ready insurance policies.

---

## 🌟 Key Features

- **🤖 Automated Policy Architecture**: Generates creative, hyper-specific insurance policies for any emerging trend in seconds using Google's Gemini API.
- **📊 Actuarial Risk & Pricing Engine**: Provides multi-dimensional risk scores, probability distributions, impact ratings, and dynamic pricing formulas with calculation breakdowns.
- **🛡️ Comprehensive Coverage Breakdown**: Outlines covered perils, explicit exclusions, edge cases, and automated claims scenarios with estimated payouts.
- **💾 Persistent Policy History (SQLite)**: Automatically persists all generated policies in an isolated SQLite database (`server/data/nexuscover.db`) with full search, filtering, and retrieval APIs.
- **📈 Real-Time Analytics API**: Computes platform-wide metrics including total policies created, average innovation scores, viability ratings, and recent risk trends.
- **⚡ Dual Execution Engine**: Works seamlessly as a full-stack Express server OR as a standalone static web application with client-side API key fallback.
- **🎨 Elite UI/UX**: Includes custom glassmorphism styling, dark/light theme switching, custom cursor dynamics, particle animations, and interactive tabbed policy inspection.

---

## 🏗️ Architecture & Tech Stack

```
                     ┌────────────────────────────────────────┐
                     │          NexusCover Frontend           │
                     │    HTML5 · CSS Tokens · JetBrains Mono │
                     └───────────────────┬────────────────────┘
                                         │
                                   HTTP / REST API
                                         │
                     ┌───────────────────▼────────────────────┐
                     │           Express Backend              │
                     │   Node.js · CORS · Rate Limiter · DB  │
                     └─────────┬────────────────────┬─────────┘
                               │                    │
                    ┌──────────▼──────────┐  ┌──────▼────────────────┐
                    │  SQLite Database    │  │   Google Gemini API   │
                    │  server/data/*.db   │  │   gemini-1.5-flash    │
                    └─────────────────────┘  └───────────────────────┘
```

### **Backend**
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: SQLite3 (`server/data/nexuscover.db`)
- **Security & Middleware**: `helmet`, `cors`, `morgan`, `express-rate-limit`, `dotenv`

### **Frontend**
- **Design System**: DM Sans, Instrument Serif, JetBrains Mono
- **Interactivity**: Native JavaScript (ES6+), Canvas Particle Engine, Glassmorphism design tokens

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/AryaVerma336/Nexuscover-predictive-policy-generator.git
cd Nexuscover-predictive-policy-generator

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env` and add your **Gemini API Key**:
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```
*(Get a free API key at [Google AI Studio](https://aistudio.google.com/apikey))*

### 4. Run the Server
```bash
# Start production server
npm start

# Or run with auto-reload (development)
npm run dev
```

Open **`http://localhost:5000`** in your browser!

---

## 📡 API Reference

NexusCover provides a clean REST API mounted under `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/policies/generate` | Generates a policy via Gemini AI & saves to DB |
| `GET` | `/api/policies` | Fetches list of saved policies (supports `?search=` filter) |
| `GET` | `/api/policies/:id` | Retrieves full JSON payload of a specific policy |
| `POST` | `/api/policies` | Manually saves a policy into the database |
| `DELETE` | `/api/policies/:id` | Deletes a policy by ID |
| `GET` | `/api/analytics` | Returns aggregate policy analytics and risk metrics |

---

## 📂 Project Structure

```
.
├── index.html                  # Responsive Frontend Web Application
├── package.json                # Server dependencies & npm scripts
├── .env.example                # Environment variables template
├── .gitignore                  # Git exclusions
├── README.md                   # Project documentation
└── server/                     # Isolated Backend Service
    ├── index.js                # Express app bootstrap & static server
    ├── config/
    │   └── db.js               # SQLite database setup & migration
    ├── controllers/
    │   ├── policyController.js # Gemini API proxy & CRUD logic
    │   └── analyticsController.js # Policy analytics aggregator
    ├── middleware/
    │   ├── errorHandler.js     # Global error handling
    │   └── rateLimiter.js      # Endpoint rate limiters
    └── routes/
        └── api.js              # REST API router
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
