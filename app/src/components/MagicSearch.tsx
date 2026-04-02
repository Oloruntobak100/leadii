'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  Globe, 
  Database,
  Building2,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  name: string;
  company: string;
  title: string;
  location: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  confidence: number;
}

const demoLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    company: 'Luxe Interiors Dubai',
    title: 'Creative Director',
    location: 'Dubai, UAE',
    email: 'sarah@luxeinteriors.ae',
    linkedin: 'linkedin.com/in/sarahmitchell',
    confidence: 94,
  },
  {
    id: '2',
    name: 'Ahmed Hassan',
    company: 'Royal Design Studio',
    title: 'Founder & CEO',
    location: 'Dubai, UAE',
    phone: '+971 50 123 4567',
    linkedin: 'linkedin.com/in/ahmedhassan',
    confidence: 89,
  },
  {
    id: '3',
    name: 'Emma Thompson',
    company: 'Modern Spaces LLC',
    title: 'Senior Designer',
    location: 'Dubai, UAE',
    email: 'emma@modernspaces.ae',
    confidence: 87,
  },
  {
    id: '4',
    name: 'Khalid Al-Rashid',
    company: 'Elite Home Designs',
    title: 'Design Lead',
    location: 'Dubai, UAE',
    phone: '+971 55 987 6543',
    linkedin: 'linkedin.com/in/khalidalrashid',
    confidence: 92,
  },
];

const searchQueries = [
  'Interior Designers in Dubai',
  'Real Estate Investors Miami',
  'SaaS Founders Series A',
  'Healthcare Clinics Texas',
  'E-commerce Store Owners',
];

export function MagicSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentSource, setCurrentSource] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sources = ['Google', 'LinkedIn', 'Yellow Pages', 'Crunchbase', 'Apollo'];

  useEffect(() => {
    if (!isSearching) return;

    let progress = 0;
    let sourceIndex = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;
      setScanProgress(progress);
      
      if (Math.random() > 0.7) {
        sourceIndex = (sourceIndex + 1) % sources.length;
        setCurrentSource(sources[sourceIndex]);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLeads(demoLeads);
          setShowResults(true);
          setIsSearching(false);
        }, 500);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isSearching]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setShowResults(false);
    setScanProgress(0);
    setLeads([]);
  };

  const handleGhostType = (text: string) => {
    setQuery('');
    setShowResults(false);
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i <= text.length) {
        setQuery(text.slice(0, i));
        i++;
      } else {
        clearInterval(typeInterval);
        setTimeout(handleSearch, 500);
      }
    }, 80);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className={cn(
          "relative flex items-center gap-4 p-2 rounded-2xl transition-all duration-500",
          "bg-slate-900/80 backdrop-blur-xl border border-slate-700",
          isSearching && "border-cyan-500/50 shadow-lg shadow-cyan-500/20"
        )}>
          <div className="pl-4">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Describe your target audience..."
            className="flex-1 bg-transparent text-white text-lg placeholder:text-slate-500 outline-none py-3"
            disabled={isSearching}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
              isSearching || !query.trim()
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-cyan-500/30"
            )}
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Find Leads
              </>
            )}
          </button>
        </div>

        {/* Ghost Type Suggestions */}
        {!isSearching && !showResults && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <span className="text-sm text-slate-500">Try:</span>
            {searchQueries.map((q) => (
              <button
                key={q}
                onClick={() => handleGhostType(q)}
                className="px-3 py-1 rounded-full text-sm bg-slate-800/50 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scanning Animation */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            {/* Scanning Sources */}
            <div className="grid grid-cols-5 gap-4">
              {sources.map((source) => (
                <motion.div
                  key={source}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: currentSource === source ? 1 : 0.4,
                    scale: currentSource === source ? 1.05 : 1
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                    currentSource === source 
                      ? "bg-cyan-500/20 border border-cyan-500/30" 
                      : "bg-slate-900/50 border border-slate-800"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    currentSource === source ? "bg-cyan-500/30" : "bg-slate-800"
                  )}>
                    {source === 'Google' && <Globe className="w-5 h-5 text-cyan-400" />}
                    {source === 'LinkedIn' && <Linkedin className="w-5 h-5 text-blue-400" />}
                    {source === 'Yellow Pages' && <Database className="w-5 h-5 text-yellow-400" />}
                    {source === 'Crunchbase' && <Building2 className="w-5 h-5 text-green-400" />}
                    {source === 'Apollo' && <Zap className="w-5 h-5 text-purple-400" />}
                  </div>
                  <span className={cn(
                    "text-xs",
                    currentSource === source ? "text-cyan-400" : "text-slate-500"
                  )}>
                    {source}
                  </span>
                  {currentSource === source && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-1"
                    >
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-bold text-cyan-400"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {Math.floor(scanProgress * 2.4)}
                </motion.p>
                <p className="text-xs text-slate-500">Sources Scanned</p>
              </div>
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-bold text-indigo-400"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                >
                  {Math.floor(scanProgress * 0.8)}
                </motion.p>
                <p className="text-xs text-slate-500">Profiles Found</p>
              </div>
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-bold text-purple-400"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                >
                  {Math.floor(scanProgress * 0.3)}
                </motion.p>
                <p className="text-xs text-slate-500">Enriched</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span className="text-white font-medium">
                  Found <span className="text-cyan-400">{leads.length}</span> qualified leads
                </span>
              </div>
              <button 
                onClick={() => {
                  setShowResults(false);
                  setQuery('');
                }}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                New Search
              </button>
            </div>

            <div className="grid gap-4">
              {leads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-slate-700 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
                          {lead.name}
                        </h4>
                        <p className="text-slate-400 text-sm">{lead.title}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Building2 className="w-4 h-4" />
                            {lead.company}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-4 h-4" />
                            {lead.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-cyan-400">{lead.confidence}%</span>
                      </div>
                      <p className="text-xs text-slate-500">Match Score</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800">
                    {lead.email && (
                      <span className="flex items-center gap-1 text-sm text-slate-400">
                        <Mail className="w-4 h-4" />
                        {lead.email}
                      </span>
                    )}
                    {lead.phone && (
                      <span className="flex items-center gap-1 text-sm text-slate-400">
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </span>
                    )}
                    {lead.linkedin && (
                      <span className="flex items-center gap-1 text-sm text-slate-400">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-6"
            >
              <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Enrich All Leads with AI
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
