# Sales Insight Automator

A secure application that allows team members to upload sales data files (.csv/.xlsx) and instantly receive AI-generated executive summaries delivered to their inbox.

## 🚀 Features

- **📊 Smart File Upload**: Drag-and-drop CSV/Excel file upload with real-time validation
- **🤖 AI-Powered Analysis**: Groq (Llama 3.3 70B) generates professional executive summaries
- **📧 Instant Email Delivery**: Summaries delivered directly via Gmail SMTP
- **🔒 Secured Endpoints**: Rate limiting, CORS, Helmet security headers, and input validation
- **📚 Interactive API Docs**: Live Swagger documentation at `/api-docs`
- **🎨 Modern UI**: React frontend with TailwindCSS and real-time feedback

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS
- Axios
- React Dropzone
- Lucide React icons
- React Hot Toast

### Backend
- Node.js + Express.js
- Groq SDK (Llama 3.3 70B - FREE)
- Nodemailer + Gmail SMTP
- Winston logger
- Swagger/OpenAPI
- Helmet + CORS + Rate Limiting

## 📁 Project Structure

```
sales-insight-automator/
├── .github/
│   └── workflows/
│       └── ci.yml           # CI/CD pipeline
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration & Swagger
│   │   ├── middleware/      # Security middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # AI, Email, File services
│   │   ├── utils/           # Logger
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── data/
│   └── sales_q1_2026.csv    # Sample data
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Groq API key (FREE): https://console.groq.com/keys
- Gmail App Password: https://myaccount.google.com/apppasswords

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sales-insight-automator.git
cd sales-insight-automator

# Setup Backend
cd backend
cp .env.example .env
# Edit .env with your API keys
npm install

# Setup Frontend
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server: http://localhost:5000
# Swagger: http://localhost:5000/api-docs

# Terminal 2 - Frontend
cd frontend
npm run dev
# App: http://localhost:3000
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Security
API_KEY=                    # Optional: Set to require X-API-Key header
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000  # 1 minute window
RATE_LIMIT_MAX=10           # 10 requests per window

# AI (Groq - FREE)
GROQ_API_KEY=gsk_your_api_key_here

# Email (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check & service status |
| POST | `/api/upload` | Upload file, generate AI summary, send email |
| POST | `/api/preview` | Preview parsed file data |
| GET | `/api-docs` | Swagger UI documentation |

### Example Request

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@sales_q1_2026.csv" \
  -F "email=recipient@example.com"
```

## 🔒 Security Implementation

### 1. Rate Limiting
- **10 requests per minute** per IP address
- Prevents abuse and DDoS attacks
- Configurable via environment variables

### 2. CORS Protection
- Whitelist of allowed origins
- Blocks requests from unauthorized domains

### 3. Helmet Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy headers

### 4. Input Validation
- **File validation**: Only .csv, .xlsx, .xls allowed
- **File size limit**: 10MB maximum
- **Email validation**: RFC 5322 compliant regex
- **Data sanitization**: Strips dangerous content

### 5. API Key Authentication (Optional)
- Set `API_KEY` in .env to enable
- Requires `X-API-Key` header on protected endpoints

### 6. Error Handling
- Sanitized error messages (no stack traces in production)
- Structured logging with Winston

## 🚀 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every PR to `main`:

1. **Backend CI**
   - Install dependencies
   - Run ESLint
   - Security audit

2. **Frontend CI**
   - Install dependencies
   - Run ESLint
   - Build validation

## 📊 Sample Data

Test with the included `data/sales_q1_2026.csv`:

```csv
Date,Product_Category,Region,Units_Sold,Unit_Price,Revenue,Status
2026-01-05,Electronics,North,150,1200,180000,Shipped
2026-01-12,Home Appliances,South,45,450,20250,Shipped
2026-01-20,Electronics,East,80,1100,88000,Delivered
2026-02-15,Electronics,North,210,1250,262500,Delivered
2026-02-28,Home Appliances,North,60,400,24000,Cancelled
2026-03-10,Electronics,West,95,1150,109250,Shipped
```

## 📧 Email Output

The AI generates a professional executive summary including:
- Executive Overview
- Key Metrics (Total Revenue, Units Sold)
- Regional Performance Analysis
- Product Category Insights
- Trends & Observations
- Actionable Recommendations

## 🛠️ Development Commands

```bash
# Backend
cd backend
npm run dev      # Start with nodemon
npm run lint     # Run ESLint
npm start        # Production start

# Frontend
cd frontend
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 📝 License

MIT License - Feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [Groq](https://groq.com) for free AI API
- [Llama 3.3](https://ai.meta.com/llama/) by Meta
- [TailwindCSS](https://tailwindcss.com)
- [Rabbitt AI](https://rabbitt.ai) for the challenge
