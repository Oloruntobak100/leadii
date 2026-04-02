import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { mockLeads } from '@/data/mockData';
import { 
  Sparkles, 
  Play,
  TrendingUp,
  Zap,
  RefreshCw,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AIThinkingPulse, EnrichmentProgress } from '@/components/AIThinkingPulse';

interface EnrichmentJob {
  id: string;
  leadId: string;
  leadName: string;
  companyName?: string;
  status: 'queued' | 'researching' | 'synthesizing' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  estimatedEndAt?: Date;
}

export function Enrichment() {
  const { leads } = useAppStore();
  const [jobs, setJobs] = useState<EnrichmentJob[]>([]);
  const [, setSelectedJob] = useState<EnrichmentJob | null>(null);
  const [stats] = useState({
    totalEnriched: 142,
    inProgress: 3,
    queued: 8,
    failed: 2,
    avgConfidence: 0.84,
  });

  const displayLeads = leads.length > 0 ? leads : mockLeads;
  const pendingLeads = displayLeads.filter(l => l.status === 'discovered');
  const enrichedLeads = displayLeads.filter(l => l.status === 'enriched');

  // Simulate enrichment jobs
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.status === 'completed' || job.status === 'failed') return job;
        
        const newProgress = Math.min(job.progress + Math.random() * 15, 100);
        let newStatus: EnrichmentJob['status'] = job.status;
        
        if (newProgress >= 100) {
          newStatus = 'completed';
        } else if (newProgress > 70) {
          newStatus = 'synthesizing';
        } else if (newProgress > 30) {
          newStatus = 'researching';
        }
        
        return { ...job, progress: newProgress, status: newStatus };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const startEnrichment = (leadIds: string[]) => {
    const newJobs: EnrichmentJob[] = leadIds.map((leadId, i) => {
      const lead = displayLeads.find(l => l.id === leadId);
      return {
        id: `job-${Date.now()}-${i}`,
        leadId,
        leadName: lead?.fullName || 'Unknown',
        companyName: lead?.companyName,
        status: 'queued',
        progress: 0,
        startedAt: new Date(),
        estimatedEndAt: new Date(Date.now() + 60000),
      };
    });
    
    setJobs([...jobs, ...newJobs]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Enrichment</h1>
          <p className="text-slate-400 mt-1">Deep research and dossier generation</p>
        </div>
        {pendingLeads.length > 0 && (
          <Button 
            className="btn-neon"
            onClick={() => startEnrichment(pendingLeads.slice(0, 5).map(l => l.id))}
          >
            <Play className="w-4 h-4 mr-2" />
            Enrich {Math.min(pendingLeads.length, 5)} Leads
          </Button>
        )}
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Total Enriched</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalEnriched}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Queued</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.queued}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Failed</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Avg Confidence</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{Math.round(stats.avgConfidence * 100)}%</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Enrichments */}
      {jobs.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                Active Enrichments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.filter(j => j.status !== 'completed' && j.status !== 'failed').map((job) => (
                  <div 
                    key={job.id} 
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 cursor-pointer hover:border-cyan-500/30 transition-colors"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{job.leadName}</p>
                          <p className="text-sm text-slate-400">{job.companyName}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        job.status === 'queued' && 'bg-slate-700 text-slate-400',
                        job.status === 'researching' && 'bg-cyan-500/20 text-cyan-400',
                        job.status === 'synthesizing' && 'bg-indigo-500/20 text-indigo-400',
                      )}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>
                    <EnrichmentProgress progress={job.progress} />
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>Started {job.startedAt.toLocaleTimeString()}</span>
                      <span>Est. completion: {job.estimatedEndAt?.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Visualization */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Thinking Demo */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              AI Research Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AIThinkingPulse 
              message="AI is actively researching..." 
              subMessage="Analyzing company data, news, and social signals"
              size="lg"
            />
            <div className="mt-8 grid grid-cols-3 gap-4 w-full">
              <div className="text-center p-3 rounded-lg bg-slate-900/50">
                <p className="text-2xl font-bold text-cyan-400">47</p>
                <p className="text-xs text-slate-400">Sources Scanned</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-900/50">
                <p className="text-2xl font-bold text-indigo-400">12</p>
                <p className="text-xs text-slate-400">News Articles</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-900/50">
                <p className="text-2xl font-bold text-purple-400">8</p>
                <p className="text-xs text-slate-400">Social Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Dossiers */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Recent Dossiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrichedLeads.slice(0, 4).map((lead) => (
                <div 
                  key={lead.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{lead.fullName}</p>
                      <p className="text-sm text-slate-400">{lead.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-cyan-400">
                        {lead.enrichment ? Math.round(lead.enrichment.confidenceScore * 100) : 0}%
                      </p>
                      <p className="text-xs text-slate-500">Confidence</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How It Works */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">How AI Enrichment Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: 1,
                  title: 'Web Research',
                  description: 'AI scans 50+ sources including news, LinkedIn, and company websites',
                  icon: ExternalLink,
                  color: 'cyan'
                },
                {
                  step: 2,
                  title: 'Data Synthesis',
                  description: 'GPT-4 analyzes findings to extract pain points and opportunities',
                  icon: Sparkles,
                  color: 'indigo'
                },
                {
                  step: 3,
                  title: 'Personalization',
                  description: 'Generates conversation starters tailored to each lead',
                  icon: FileText,
                  color: 'purple'
                },
                {
                  step: 4,
                  title: 'Confidence Score',
                  description: 'AI rates dossier quality based on data completeness',
                  icon: TrendingUp,
                  color: 'emerald'
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      `bg-${item.color}-500/20`
                    )}>
                      <Icon className={cn("w-6 h-6", `text-${item.color}-400`)} />
                    </div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-medium text-slate-400">
                      {item.step}
                    </div>
                    <h4 className="font-medium text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
