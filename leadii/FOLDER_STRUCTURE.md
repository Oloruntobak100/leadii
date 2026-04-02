# Leadii - Next.js 15 Project Structure

```
leadii/
├── 📁 .github/
│   └── workflows/
│       ├── ci.yml                    # CI pipeline
│       └── deploy.yml                # Deployment automation
│
├── 📁 .vscode/
│   ├── extensions.json               # Recommended extensions
│   ├── settings.json                 # Workspace settings
│   └── launch.json                   # Debug configuration
│
├── 📁 prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Database migrations
│   │   └── migration_lock.toml
│   └── seed.ts                       # Seed data for development
│
├── 📁 src/
│   ├── 📁 app/                       # Next.js 15 App Router
│   │   ├── 📁 (auth)/                # Auth route group
│   │   │   ├── 📁 login/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 register/
│   │   │   │   └── page.tsx
│   │   │   ├── 📁 reset-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── 📁 (dashboard)/           # Dashboard route group
│   │   │   ├── 📁 campaigns/
│   │   │   │   ├── 📁 [id]/
│   │   │   │   │   ├── 📁 leads/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── 📁 enrichment/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── 📁 leads/
│   │   │   │   ├── 📁 [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── 📁 outreach/
│   │   │   │   ├── 📁 templates/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 history/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── 📁 analytics/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── 📁 settings/
│   │   │   │   ├── 📁 billing/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 integrations/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── 📁 credits/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   └── page.tsx              # Dashboard home
│   │   │
│   │   ├── 📁 api/                   # API Routes
│   │   │   ├── 📁 auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── 📁 campaigns/
│   │   │   │   ├── route.ts          # GET, POST campaigns
│   │   │   │   └── 📁 [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── 📁 leads/
│   │   │   │       │   └── route.ts
│   │   │   │       ├── 📁 start/
│   │   │   │       │   └── route.ts  # Start scraping
│   │   │   │       └── 📁 enrich/
│   │   │   │           └── route.ts  # Start enrichment
│   │   │   │
│   │   │   ├── 📁 leads/
│   │   │   │   ├── route.ts
│   │   │   │   └── 📁 [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── 📁 enrich/
│   │   │   │       │   └── route.ts
│   │   │   │       └── 📁 outreach/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── 📁 enrichment/
│   │   │   │   ├── route.ts
│   │   │   │   └── 📁 [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── 📁 status/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── 📁 outreach/
│   │   │   │   ├── route.ts
│   │   │   │   ├── 📁 send/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── 📁 templates/
│   │   │   │   │   └── route.ts
│   │   │   │   └── 📁 webhooks/
│   │   │   │       ├── 📁 twilio/
│   │   │   │       │   └── route.ts
│   │   │   │       └── 📁 stripe/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── 📁 credits/
│   │   │   │   ├── route.ts
│   │   │   │   └── 📁 purchase/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── 📁 billing/
│   │   │   │   ├── 📁 subscription/
│   │   │   │   │   └── route.ts
│   │   │   │   └── 📁 invoices/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   └── 📁 webhooks/
│   │   │       ├── 📁 stripe/
│   │   │       │   └── route.ts
│   │   │       └── 📁 twilio/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Global styles
│   │   └── loading.tsx               # Loading UI
│   │
│   ├── 📁 components/                # React Components
│   │   ├── 📁 ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ...
│   │   │
│   │   ├── 📁 layout/                # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── command-bar.tsx
│   │   │   └── breadcrumbs.tsx
│   │   │
│   │   ├── 📁 dashboard/             # Dashboard-specific
│   │   │   ├── stats-cards.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   ├── credit-indicator.tsx
│   │   │   └── quick-actions.tsx
│   │   │
│   │   ├── 📁 campaigns/             # Campaign components
│   │   │   ├── campaign-list.tsx
│   │   │   ├── campaign-card.tsx
│   │   │   ├── campaign-wizard.tsx
│   │   │   ├── niche-selector.tsx
│   │   │   ├── source-selector.tsx
│   │   │   └── campaign-progress.tsx
│   │   │
│   │   ├── 📁 leads/                 # Lead components
│   │   │   ├── lead-list.tsx
│   │   │   ├── lead-card.tsx
│   │   │   ├── lead-detail.tsx
│   │   │   ├── lead-filters.tsx
│   │   │   ├── lead-table.tsx
│   │   │   └── lead-status-badge.tsx
│   │   │
│   │   ├── 📁 enrichment/            # Enrichment components
│   │   │   ├── enrichment-queue.tsx
│   │   │   ├── enrichment-card.tsx
│   │   │   ├── dossier-view.tsx
│   │   │   ├── ai-thinking-pulse.tsx
│   │   │   ├── insight-card.tsx
│   │   │   └── pain-point-list.tsx
│   │   │
│   │   ├── 📁 outreach/              # Outreach components
│   │   │   ├── outreach-composer.tsx
│   │   │   ├── channel-selector.tsx
│   │   │   ├── template-library.tsx
│   │   │   ├── message-preview.tsx
│   │   │   ├── send-confirmation.tsx
│   │   │   ├── delivery-tracker.tsx
│   │   │   └── response-monitor.tsx
│   │   │
│   │   ├── 📁 analytics/             # Analytics components
│   │   │   ├── conversion-chart.tsx
│   │   │   ├── channel-performance.tsx
│   │   │   ├── lead-funnel.tsx
│   │   │   └── roi-calculator.tsx
│   │   │
│   │   ├── 📁 billing/               # Billing components
│   │   │   ├── credit-balance.tsx
│   │   │   ├── credit-packages.tsx
│   │   │   ├── subscription-card.tsx
│   │   │   ├── usage-chart.tsx
│   │   │   └── invoice-list.tsx
│   │   │
│   │   ├── 📁 auth/                  # Auth components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── oauth-buttons.tsx
│   │   │   └── protected-route.tsx
│   │   │
│   │   └── 📁 landing/               # Landing page sections
│   │       ├── hero.tsx
│   │       ├── features.tsx
│   │       ├── how-it-works.tsx
│   │       ├── pricing.tsx
│   │       ├── testimonials.tsx
│   │       └── cta.tsx
│   │
│   ├── 📁 hooks/                     # Custom React Hooks
│   │   ├── use-auth.ts
│   │   ├── use-campaigns.ts
│   │   ├── use-leads.ts
│   │   ├── use-enrichment.ts
│   │   ├── use-outreach.ts
│   │   ├── use-credits.ts
│   │   ├── use-subscription.ts
│   │   ├── use-realtime.ts
│   │   ├── use-toast.ts
│   │   └── use-local-storage.ts
│   │
│   ├── 📁 lib/                       # Utility libraries
│   │   ├── 📁 supabase/              # Supabase clients
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── admin.ts
│   │   │   └── realtime.ts
│   │   │
│   │   ├── 📁 prisma/                # Prisma client
│   │   │   └── client.ts
│   │   │
│   │   ├── 📁 redis/                 # Redis client
│   │   │   └── client.ts
│   │   │
│   │   ├── 📁 stripe/                # Stripe client
│   │   │   ├── client.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── 📁 ai/                    # AI configuration
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── langchain.ts
│   │   │   └── perplexity.ts
│   │   │
│   │   ├── utils.ts                  # General utilities
│   │   ├── constants.ts              # App constants
│   │   ├── validations.ts            # Zod schemas
│   │   └── formatters.ts             # Data formatters
│   │
│   ├── 📁 services/                  # Business Logic Services
│   │   ├── 📁 campaigns/
│   │   │   ├── campaign.service.ts
│   │   │   └── campaign.types.ts
│   │   │
│   │   ├── 📁 leads/
│   │   │   ├── lead.service.ts
│   │   │   ├── lead.scraper.ts
│   │   │   ├── lead.validator.ts
│   │   │   └── lead.types.ts
│   │   │
│   │   ├── 📁 enrichment/
│   │   │   ├── enrichment.service.ts
│   │   │   ├── enrichment.worker.ts
│   │   │   ├── researcher.agent.ts
│   │   │   ├── enrichment.types.ts
│   │   │   └── prompts/
│   │   │       ├── research-prompt.ts
│   │   │       ├── enrichment-prompt.ts
│   │   │       └── copywriting-prompt.ts
│   │   │
│   │   ├── 📁 outreach/
│   │   │   ├── outreach.service.ts
│   │   │   ├── outreach.worker.ts
│   │   │   ├── channel.adapter.ts
│   │   │   ├── whatsapp.adapter.ts
│   │   │   ├── sms.adapter.ts
│   │   │   ├── email.adapter.ts
│   │   │   ├── social.adapter.ts
│   │   │   └── outreach.types.ts
│   │   │
│   │   ├── 📁 credits/
│   │   │   ├── credit.service.ts
│   │   │   ├── credit.ledger.ts
│   │   │   └── credit.types.ts
│   │   │
│   │   ├── 📁 billing/
│   │   │   ├── billing.service.ts
│   │   │   ├── subscription.service.ts
│   │   │   └── billing.types.ts
│   │   │
│   │   └── 📁 analytics/
│   │       ├── analytics.service.ts
│   │       └── analytics.types.ts
│   │
│   ├── 📁 workers/                   # BullMQ Workers
│   │   ├── queue.config.ts
│   │   ├── scraper.worker.ts
│   │   ├── enrichment.worker.ts
│   │   ├── outreach.worker.ts
│   │   └── billing.worker.ts
│   │
│   ├── 📁 types/                     # TypeScript Types
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── campaign.types.ts
│   │   ├── lead.types.ts
│   │   ├── enrichment.types.ts
│   │   ├── outreach.types.ts
│   │   ├── credit.types.ts
│   │   └── billing.types.ts
│   │
│   ├── 📁 styles/                    # Additional styles
│   │   ├── animations.css
│   │   ├── glassmorphism.css
│   │   └── gradients.css
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── 📁 public/                        # Static assets
│   ├── 📁 images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   ├── hero-illustration.svg
│   │   └── screenshots/
│   ├── 📁 fonts/
│   └── favicon.ico
│
├── 📁 scripts/                       # Utility scripts
│   ├── setup.sh
│   ├── seed-db.ts
│   └── migrate-credits.ts
│
├── 📁 tests/                         # Test files
│   ├── 📁 unit/
│   ├── 📁 integration/
│   └── 📁 e2e/
│
├── .env.example                      # Environment template
├── .env.local                        # Local environment (gitignored)
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── components.json                   # shadcn/ui config
├── next.config.js
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Key File Descriptions

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration with image domains, rewrites |
| `tailwind.config.ts` | Tailwind with custom colors (indigo/cyan neon theme) |
| `components.json` | shadcn/ui component registry configuration |
| `tsconfig.json` | TypeScript configuration with path aliases |

### Critical Source Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Auth check, tenant isolation, rate limiting |
| `src/app/layout.tsx` | Root layout with providers (Theme, Auth, Toast) |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client |
| `src/lib/prisma/client.ts` | Prisma ORM singleton |
| `src/lib/redis/client.ts` | Redis/BullMQ connection |

### Service Architecture

```
services/
├── campaigns/          # Campaign CRUD + lifecycle
├── leads/             # Lead management + scraping
├── enrichment/        # AI enrichment + Researcher Agent
├── outreach/          # Multi-channel messaging
├── credits/           # Credit ledger + transactions
├── billing/           # Stripe subscriptions
└── analytics/         # Metrics + reporting
```

### Worker Architecture

```
workers/
├── scraper.worker.ts      # Background lead scraping
├── enrichment.worker.ts   # AI enrichment jobs
├── outreach.worker.ts     # Message sending
└── billing.worker.ts      # Invoice generation
```
