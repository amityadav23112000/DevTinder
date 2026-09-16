# DevTinder

DevTinder is a MERN stack-based application that connects like-minded developers. Inspired by Tinder, it allows developers to interact, connect, and build meaningful professional relationships.

# Features 🎯

- ✅ Sign up and log in securely (JWT, httpOnly cookies)
- ✅ Feed displaying developer profiles, excluding anyone you've already interacted with
- ✅ Mark profiles as Interested or Ignore
- ✅ Connection requests are sent to Interested profiles
- ✅ View and manage received connection requests (Accept/Reject)
- ✅ Accepted requests appear in the Connections tab
- ✅ Edit profile details — name, age, gender, about, skills, college/company, education history
- ✅ Upload a profile photo — uploaded directly to a private S3 bucket via a presigned URL, served back via short-lived signed URLs
- ✅ Add LinkedIn / GitHub / LeetCode / Codeforces links — only visible to your accepted connections
- ✅ Gender-appropriate default avatar when no photo is uploaded
- ✅ Securely sign out
- ✅ **AI Profile Assistant** — turns rough free-text notes into a polished about/skills draft (Gemini via LangChain.js), reviewed and edited before saving
- ✅ **AI Suggested Connections** — recommends developers by profile similarity (not just keyword overlap), using Gemini embeddings + MongoDB Atlas Vector Search, with a shared-skills-based explanation for each match

# Tech Stack 🛠️

- **Frontend:** React 19, Vite, Redux Toolkit, React Router, Tailwind CSS + daisyUI, Axios
- **Backend:** Node.js, Express 5, Mongoose (routes → controllers → models/utils/ai)
- **Database:** MongoDB Atlas, with Atlas Vector Search for semantic matching
- **AI:** LangChain.js, Google Gemini API (chat + embeddings)
- **Authentication:** JWT + httpOnly cookies, bcrypt password hashing
- **File storage:** AWS S3 (private bucket, presigned upload/download URLs via `@aws-sdk/client-s3`)

# Project Structure

```
DevTinder/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app entry point
│   │   ├── ai/                   # Gemini clients, prompt/schema, embeddings
│   │   ├── config/              # DB + S3 client setup
│   │   ├── controllers/          # Route handler logic
│   │   ├── middleware/          # Auth middleware
│   │   ├── models/              # Mongoose schemas
│   │   ├── routers/             # API routes
│   │   └── utils/                # Validation, signed-photo-URL helpers
│   ├── scripts/                 # One-off setup/seed scripts (S3 bucket, vector index, fake user data)
│   └── .env.example             # Required environment variables
├── Frontend/
│   └── src/
│       ├── Components/          # React components (pages + shared UI)
│       └── utils/                # Redux store/slices, API base URL
└── dev.sh                       # Starts both backend and frontend together
```

# Getting Started

## Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster with [Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/) available (needed for AI Suggested Connections)
- An AWS account with an S3 bucket (see `backend/scripts/create-s3-bucket.js`) if you want profile photo uploads to work
- A Google Gemini API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) if you want the AI features to work

## Setup

1. Clone the repo and install dependencies for both apps:
   ```bash
   cd backend && npm install
   cd ../Frontend && npm install
   ```
2. Copy `backend/.env.example` to `backend/.env` and fill in your own values:
   ```
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=a-long-random-secret
   AWS_REGION=your-region
   S3_BUCKET_NAME=your-bucket-name
   GEMINI_API_KEY=your-google-ai-studio-key
   ```
   AWS credentials themselves are **not** set via `.env` — the AWS SDK picks them up automatically from `~/.aws/credentials` (or an IAM role in production). Never hardcode AWS keys in the app.
3. (One-time) create the S3 bucket, with public access blocked and CORS configured for uploads:
   ```bash
   cd backend && node scripts/create-s3-bucket.js
   ```
4. (One-time) create the Atlas Vector Search index used for AI Suggested Connections:
   ```bash
   cd backend && node scripts/create-vector-index.js
   ```
5. Run both apps together from the repo root:
   ```bash
   ./dev.sh
   ```
   Backend runs on `http://localhost:1234`, frontend on `http://localhost:5173`.

# Demo

Check out my project demo on [LinkedIn](https://www.linkedin.com/posts/amit-yadav-5a884b196_mern-reactjs-mongodb-activity-7353796007425437698-Muon?utm_source=share&utm_medium=member_desktop&rcm=ACoAAC4LEZABSwfG8LFk2lDNY0kdHr871tneAbY)
