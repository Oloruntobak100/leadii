'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Autonomous research',
    description:
      'AI agents scan the web to find and profile prospects that match your niche—without manual list building.',
  },
  {
    icon: Sparkles,
    title: 'Deep enrichment',
    description:
      'Dossiers with signals, pain points, and personalization hints so every touch feels human, not bulk.',
  },
  {
    icon: Send,
    title: 'Multi-channel outreach',
    description:
      'Coordinate email, LinkedIn, WhatsApp, and SMS from one place with clear status and credit usage.',
  },
];

export function HomeLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-indigo-600/25 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[min(80rem,100%)] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[80px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-lg shadow-cyan-500/20">
              <Zap className="h-5 w-5 text-white" aria-hidden />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Leadii
            </span>
          </a>
          <nav className="flex items-center gap-3 sm:gap-4">
            <a
              href="#features"
              className="hidden text-sm text-slate-300 transition-colors hover:text-white sm:inline"
            >
              Features
            </a>
            <a
              href="#developers"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-500/40 hover:bg-white/10 hover:text-white"
            >
              Developers
            </a>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-200">
              <MessageSquare className="h-4 w-4" aria-hidden />
              Lead generation that stays human at scale
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Discover, enrich, and reach{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                the right leads
              </span>
              —automatically.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              Leadii combines autonomous research, real-time enrichment, and
              multi-channel outreach so your team spends time closing—not
              Googling.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110"
              >
                See how it works
                <ArrowRight className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#developers"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
              >
                <Mail className="h-5 w-5" aria-hidden />
                Developer access
              </a>
            </div>
          </motion.div>

          <motion.div
            id="features"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-20 grid gap-6 md:grid-cols-3"
          >
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-sm transition hover:border-cyan-500/30 hover:bg-slate-900/80"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/30 text-cyan-300">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {description}
                </p>
              </div>
            ))}
          </motion.div>

          <section
            id="developers"
            className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/10 bg-slate-900/50 px-6 py-8 text-left backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold text-white">API endpoints</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Backend routes are served from your Next.js app. Authenticated
              requests use session-protected handlers (configure Supabase Auth
              next).
            </p>
            <ul className="mt-4 space-y-2 font-mono text-sm text-cyan-200/90">
              <li>
                <span className="text-slate-500">GET/POST</span>{' '}
                <code className="rounded bg-slate-950/80 px-2 py-0.5 text-cyan-300">
                  /api/campaigns
                </code>
              </li>
              <li>
                <span className="text-slate-500">GET/POST</span>{' '}
                <code className="rounded bg-slate-950/80 px-2 py-0.5 text-cyan-300">
                  /api/enrichment
                </code>
              </li>
            </ul>
          </section>
        </section>

        <footer className="relative border-t border-white/10 bg-slate-950/80 py-8 text-center text-sm text-slate-400">
          <p>
            © {new Date().getFullYear()} Leadii · Built for production on Next.js
            & Supabase
          </p>
        </footer>
      </main>
    </div>
  );
}
