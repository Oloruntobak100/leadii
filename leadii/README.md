# Leadii - AI-Powered Lead Generation Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.4-cyan?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/AI-OpenAI-purple?style=for-the-badge&logo=openai" alt="AI Powered">
</p>

Leadii is an autonomous AI-driven lead generation, enrichment, and multi-channel outreach platform. Define your niche, and Leadii performs three automated phases: Lead Generation, AI Deep Enrichment, and Multi-Channel Outreach.

## Features

### Three-Phase Automation

1. **Lead Generation**
   - Scrapes business data across Google, LinkedIn, and Web Directories
   - Validates contact information in real-time
   - Supports both B2B and B2C targeting

2. **AI Deep Enrichment**
   - Autonomous agent performs live web research
   - Generates "Digital Dossiers" with pain points, opportunities, and trigger events
   - Creates personalized conversation starters

3. **Multi-Channel Outreach**
   - Unified command center for WhatsApp, SMS, Email, and Social DMs
   - AI-generated personalized copy
   - Delivery tracking and response monitoring

### Modern UI/UX

- **Glassmorphism Dark Theme** with electric cyan and indigo neon accents
- **Guided Stepper Layout** - the app talks to the user through the process
- **Real-time Animations** - glowing pulse effects during AI processing
- **Responsive Design** - works on desktop, tablet, and mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, Framer Motion |
| **Backend** | Node.js, Next.js API Routes |
| **Database** | Supabase (PostgreSQL); SQL migrations in repo `supabase/migrations/` |
| **AI Engine** | LangChain, OpenAI GPT-4, Perplexity API |
| **Messaging** | Twilio (SMS/WhatsApp), Resend (Email) |
| **Payments** | Stripe (Subscriptions + Credits) |

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase project (apply migrations from repo root `supabase/migrations/`)
- API keys for OpenAI, Perplexity, Twilio, Resend, Stripe

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/leadii.git
   cd leadii
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Apply database schema** (Supabase SQL Editor or CLI) using `../supabase/migrations/*.sql` from the monorepo root.

5. **Start the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
leadii/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── (dashboard)/   # Dashboard pages
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── enrichment/    # Enrichment components
│   │   └── ...
│   ├── services/          # Business logic services
│   │   ├── enrichment/    # AI enrichment service
│   │   ├── credits/       # Credit system
│   │   └── ...
│   └── lib/               # Utilities (e.g. Supabase admin client)
└── ...
```

## Core Concepts

### Credit System

Leadii uses a credit-based billing system:

| Action | Cost |
|--------|------|
| Scrape Lead | 0.1 credits |
| Deep Enrichment | 2.0 credits |
| WhatsApp Message | 0.5 credits |
| SMS Message | 0.3 credits |
| Email Message | 0.2 credits |

Credits can be purchased via Stripe or granted through subscriptions.

### The Researcher Agent

The core AI engine that powers enrichment:

```typescript
import { createResearcherAgent } from '@/services/enrichment/researcher.agent';

const agent = createResearcherAgent({
  perplexityApiKey: process.env.PERPLEXITY_API_KEY!,
  openaiApiKey: process.env.OPENAI_API_KEY!,
  enableSocialScraping: true,
});

const dossier = await agent.researchLead(lead);
```

### Multitenancy

All data is isolated by `tenant_id` using PostgreSQL Row Level Security (RLS).

## API Documentation

### Campaigns

- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `POST /api/campaigns/[id]/start` - Start lead scraping

### Enrichment

- `POST /api/enrichment` - Start enrichment for leads
- `GET /api/enrichment?campaignId=` - Get enrichment status

### Outreach

- `POST /api/outreach/send` - Send messages
- `GET /api/outreach/templates` - List message templates

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Self-Hosted

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for a complete list of required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@leadii.io or join our Discord community.

---

<p align="center">
  Built with ❤️ by the Leadii Team
</p>
