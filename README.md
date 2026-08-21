# OpenBook

**OpenBook** is an interactive AI-powered research and study studio (inspired by NotebookLM) that turns your documents, PDFs, and web links into dynamic knowledge artifacts and interactive multi-speaker debate podcasts.

Unlike static audio overviews, OpenBook introduces a **Live "Interrupt & Ask"** capability: listeners can pause the podcast mid-episode to ask the AI co-hosts questions, receive an in-character audio response grounded in their source notes, and seamlessly resume the show.

---

## Key Features

- **Multi-Host AI Debate Podcasts**: Transforms source materials into dynamic, intellectual audio debate shows featuring two AI hosts (Alex, the analytical host, and Jordan, the challenger) powered by ElevenLabs voice synthesis.
- **Live "Interrupt & Ask"**: Pause the audio show at any timestamp to ask specific questions. The hosts generate an immediate conversational response grounded in your workspace documents before continuing the episode.
- **Automated Learning Artifacts**:
  - Structured Executive Reports & Summaries
  - Interactive Study Quizzes with explanations
  - Revision Flashcards
  - Visual Mind Maps
  - Key Takeaways
- **Multi-Format Source Ingestion**:
  - PDF document uploads (parsed, chunked, and stored in Cloudinary)
  - Web links and articles scraped via Firecrawl
  - YouTube video transcripts
  - Raw text notes and research snippets
- **Grounded Semantic RAG**: Vector embeddings and semantic search powered by Pinecone to ensure citations and factual accuracy without hallucinations.
- **Event-Driven Background Processing**: Asynchronous artifact generation pipeline managed by Inngest.
- **Pro Tier & Subscriptions**: Integrated Razorpay subscription workflow with usage limits, plan upgrades, and gated premium features.

---

## Tech Stack

### Frontend (`/client`)
- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Lucide Icons
- **State & Data Fetching**: TanStack React Query
- **Audio Playback**: Custom HTML5 Audio Player with dynamic seeking and real-time waveform visualizers

### Backend (`/server`)
- **Runtime**: Node.js, Express, TypeScript
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Authentication**: Better-Auth (with Google OAuth & Session Management)
- **Vector Database**: Pinecone
- **Asynchronous Jobs**: Inngest
- **File & Media Storage**: Cloudinary (PDFs & Podcast Audio)
- **Payment Gateway**: Razorpay

### AI & Speech Services
- **Voice Synthesis**: ElevenLabs REST API
- **LLM Reasoning & Extraction**: Google Gemini & OpenAI GPT-4o / GPT-4o-mini
- **Web Scraping**: Firecrawl & Tavily Search

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Client                         │
│   (Studio Panel, Podcast Viewer, Chat, Workspace Layout)    │
└──────────────┬──────────────────────────────▲───────────────┘
               │                              │
          REST / SSE                     HTTP Audio
               │                              │
┌──────────────▼──────────────────────────────┴───────────────┐
│                    Express Backend Server                   │
│   (Auth, Workspace Routes, Artifact API, Audio Streaming)   │
└──────┬──────────────┬──────────────┬──────────────┬─────────┘
       │              │              │              │
┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼───────┐
│  PostgreSQL ││   Pinecone  ││  Cloudinary ││  ElevenLabs  │
│  (Prisma)   ││  Vector DB  ││ Media Store ││     TTS      │
└─────────────┘└─────────────┘└─────────────┘└──────────────┘
                      ▲
                      │ Triggers Background Jobs
               ┌──────┴──────┐
               │   Inngest   │
               │   Worker    │
               └─────────────┘
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **PostgreSQL**: Local instance or hosted database (e.g. Neon, Supabase, Railway)
- **API Keys**: OpenAI, Google Gemini, ElevenLabs, Cloudinary, Pinecone, and Firecrawl

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/openbook.git
cd openbook
```

---

### 2. Backend Setup (`/server`)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with your credentials (see [Environment Variables](#environment-variables)).

5. Run database migrations and generate the Prisma client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. Start the backend development server and Inngest dev server:
   ```bash
   # Terminal 1: Express Server
   npm run dev

   # Terminal 2: Inngest Dev Server
   npm run inngest
   ```

---

### 3. Frontend Setup (`/client`)

1. Navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment configuration:
   ```bash
   cp .env.example .env.local
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
| :--- | :--- |
| `PORT` | Backend server port (default: `8081`) |
| `CLIENT_URL` | Frontend origin URL (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | 32+ character random secret for session encryption |
| `BETTER_AUTH_URL` | Base server auth URL (`http://localhost:8081`) |
| `OPENAI_API_KEY` | OpenAI API key for text/chat generation |
| `GEMINI_API_KEY` | Google Gemini API key |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for multi-speaker TTS |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX` | Pinecone index name |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned preset name |
| `FIRECRAWL_API_KEY` | Firecrawl API key for URL scraping |
| `RAZORPAY_KEY_ID` | Razorpay Key ID for payments |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |

### Client (`client/.env.local`)

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public backend API URL (`http://localhost:8081`) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Better Auth server URL (`http://localhost:8081`) |

---

## Project Structure

```
openbook/
├── client/                     # Next.js Frontend
│   ├── app/                    # App Router pages & layouts
│   │   ├── (auth)/             # Login, signup & auth pages
│   │   └── (protected)/        # Protected workspace & dashboard pages
│   ├── components/             # Reusable UI components (Radix / Tailwind)
│   ├── features/
│   │   ├── learn/              # Studio panel, podcast viewer, artifacts
│   │   ├── sources/            # File uploads, link ingestion, source manager
│   │   ├── chat/               # Grounded RAG conversational interface
│   │   └── billing/            # Pricing modal & Razorpay checkout
│   └── lib/                    # API client & helper utilities
│
└── server/                     # Express & Prisma Backend
    ├── prisma/                 # Database schema & migrations
    ├── src/
    │   ├── controllers/        # Express route controllers
    │   ├── routes/             # API routing definitions
    │   ├── services/           # Business logic & AI generation pipelines
    │   ├── inngest/            # Event-driven background workers
    │   └── lib/                # Cloudinary, ElevenLabs, Pinecone & Gemini clients
    └── uploads/                # Local file storage fallback
```

---

## Key API Endpoints

- `POST /api/workspaces/:workspaceId/artifacts`: Generate a learning artifact (Summary, Quiz, Flashcards, Mindmap, Report, Podcast).
- `GET /api/audio/:workspaceId/:artifactId`: Direct byte-range audio streaming for generated podcasts.
- `POST /api/workspaces/:workspaceId/artifacts/:artifactId/podcast/interrupt`: Submit a live listener question to the AI podcast hosts.
- `POST /api/workspaces/:workspaceId/sources`: Ingest a source document (PDF, YouTube link, Web URL, text).
- `POST /api/workspaces/:workspaceId/chat`: Stream grounded RAG answers with citations.

---

## License

This project is licensed under the MIT License.
