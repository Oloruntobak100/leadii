'use client';

/**
 * Dossier View Component
 * Displays the AI-generated enrichment dossier for a lead
 */

import { motion } from 'framer-motion';
import { 
  Building2, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb, 
  MessageSquare,
  ExternalLink,
  Sparkles,
  Calendar,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DossierViewProps {
  enrichment: {
    companyOverview: string;
    recentNews: Array<{
      title: string;
      url: string;
      date: string;
      summary: string;
      relevance: number;
    }>;
    painPoints: string[];
    opportunities: string[];
    triggerEvents: Array<{
      type: string;
      description: string;
      date: string;
      outreachAngle: string;
    }>;
    personalizationHints: {
      mutualInterests: string[];
      recentAchievements: string[];
      professionalChallenges: string[];
      communicationStyle: string;
      preferredTopics: string[];
      avoidTopics: string[];
    };
    conversationStarters: string[];
    confidenceScore: number;
    sourcesUsed: Array<{
      url: string;
      title: string;
      relevanceScore: number;
    }>;
  };
  leadName: string;
  companyName?: string;
}

export function DossierView({ enrichment, leadName, companyName }: DossierViewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Confidence Score */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">
            {leadName}
            {companyName && (
              <span className="text-slate-400 text-lg ml-2">@ {companyName}</span>
            )}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            AI-Generated Dossier
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConfidenceBadge score={enrichment.confidenceScore} />
          <Button
            variant="outline"
            size="sm"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Copy
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-900/50 border border-slate-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Building2 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Lightbulb className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="news" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <TrendingUp className="w-4 h-4 mr-2" />
            News & Events
          </TabsTrigger>
          <TabsTrigger value="outreach" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <MessageSquare className="w-4 h-4 mr-2" />
            Outreach
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <motion.div variants={itemVariants}>
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  {enrichment.companyOverview}
                </p>
              </CardContent>
            </GlassCard>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    Pain Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {enrichment.painPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-rose-400 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {enrichment.opportunities.map((opp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-emerald-400 mt-1">•</span>
                        {opp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </GlassCard>
            </motion.div>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4 mt-4">
          <motion.div variants={itemVariants}>
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-lg text-white">Personalization Hints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Communication Style</p>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                      {enrichment.personalizationHints.communicationStyle}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Mutual Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {enrichment.personalizationHints.mutualInterests.map((interest, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-slate-800">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Preferred Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {enrichment.personalizationHints.preferredTopics.map((topic, i) => (
                      <Badge key={i} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {enrichment.personalizationHints.avoidTopics.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Topics to Avoid</p>
                    <div className="flex flex-wrap gap-2">
                      {enrichment.personalizationHints.avoidTopics.map((topic, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </GlassCard>
          </motion.div>
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news" className="space-y-4 mt-4">
          {enrichment.recentNews.map((news, i) => (
            <motion.div key={i} variants={itemVariants}>
              <GlassCard className="group hover:border-cyan-500/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                        {news.title}
                      </h4>
                      <p className="text-slate-400 text-sm mt-1">{news.summary}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(news.date).toLocaleDateString()}
                        </span>
                        <RelevanceBadge score={news.relevance} />
                      </div>
                    </div>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </GlassCard>
            </motion.div>
          ))}

          {enrichment.triggerEvents.length > 0 && (
            <motion.div variants={itemVariants}>
              <GlassCard className="border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Trigger Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrichment.triggerEvents.map((event, i) => (
                    <div key={i} className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-amber-500 text-white">{event.type}</Badge>
                        <span className="text-slate-400 text-sm">{event.date}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{event.description}</p>
                      <div className="mt-3 pt-3 border-t border-amber-500/20">
                        <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Outreach Angle</p>
                        <p className="text-slate-300 text-sm">{event.outreachAngle}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </GlassCard>
            </motion.div>
          )}
        </TabsContent>

        {/* Outreach Tab */}
        <TabsContent value="outreach" className="space-y-4 mt-4">
          <motion.div variants={itemVariants}>
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  Suggested Conversation Starters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {enrichment.conversationStarters.map((starter, i) => (
                  <div
                    key={i}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <p className="text-slate-300 text-sm group-hover:text-white transition-colors">
                        {starter}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </GlassCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

/**
 * Glassmorphism Card Component
 */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Card
      className={`bg-slate-900/40 backdrop-blur-xl border-slate-800/60 ${className}`}
      style={{
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {children}
    </Card>
  );
}

/**
 * Confidence Score Badge
 */
function ConfidenceBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 0.8) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 0.6) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <Badge
      variant="outline"
      className={`${getColor()} px-3 py-1`}
    >
      <Sparkles className="w-3 h-3 mr-1" />
      {Math.round(score * 100)}% Confidence
    </Badge>
  );
}

/**
 * Relevance Score Badge
 */
function RelevanceBadge({ score }: { score: number }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        score >= 0.8
          ? 'bg-emerald-500/20 text-emerald-400'
          : score >= 0.5
          ? 'bg-amber-500/20 text-amber-400'
          : 'bg-slate-700 text-slate-400'
      }`}
    >
      {Math.round(score * 100)}% relevant
    </span>
  );
}
