import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { mockLeads } from '@/data/mockData';
import { 
  Search,
  MoreVertical,
  Mail,
  Phone,
  Linkedin,
  Building2,
  MapPin,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Leads() {
  const { leads, setCurrentPage, addActiveEnrichment, removeActiveEnrichment, activeEnrichments } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [viewingLead, setViewingLead] = useState<typeof mockLeads[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const displayLeads = leads.length > 0 ? leads : mockLeads;
  
  const filteredLeads = displayLeads.filter(lead => {
    const matchesSearch = 
      lead.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleEnrich = (leadId: string) => {
    addActiveEnrichment(leadId);
    // Simulate enrichment completion
    setTimeout(() => {
      removeActiveEnrichment(leadId);
    }, 5000);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
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
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">{filteredLeads.length} leads found</p>
        </div>
        <div className="flex gap-3">
          {selectedLeads.length > 0 && (
            <Button 
              className="btn-neon"
              onClick={() => setCurrentPage('outreach')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Outreach ({selectedLeads.length})
            </Button>
          )}
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search leads..."
            className="pl-10 bg-slate-900/50 border-slate-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'discovered', 'enriching', 'enriched', 'contacted'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filterStatus === status
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-600"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Leads Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="p-4 text-left">
                    <Checkbox 
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Lead</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Company</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Location</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Quality</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Status</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="p-4">
                      <Checkbox 
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={() => {
                          if (selectedLeads.includes(lead.id)) {
                            setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                          } else {
                            setSelectedLeads([...selectedLeads, lead.id]);
                          }
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{lead.fullName}</p>
                          <p className="text-sm text-slate-400">{lead.jobTitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-300">{lead.companyName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-300">{lead.city}, {lead.state}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {lead.qualityScore ? (
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "w-4 h-4",
                                  i < Math.floor(lead.qualityScore! / 20) 
                                    ? "text-amber-400 fill-amber-400" 
                                    : "text-slate-600"
                                )} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-400">{lead.qualityScore}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge className={cn(
                        lead.status === 'enriched' && 'bg-emerald-500/20 text-emerald-400',
                        lead.status === 'enriching' && 'bg-amber-500/20 text-amber-400',
                        lead.status === 'discovered' && 'bg-slate-700 text-slate-400',
                        lead.status === 'contacted' && 'bg-cyan-500/20 text-cyan-400',
                        lead.status === 'responded' && 'bg-purple-500/20 text-purple-400',
                      )}>
                        {activeEnrichments.includes(lead.id) ? (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 animate-pulse" />
                            Enriching...
                          </span>
                        ) : (
                          lead.status.charAt(0).toUpperCase() + lead.status.slice(1)
                        )}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {lead.status === 'discovered' && !activeEnrichments.includes(lead.id) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                            onClick={() => handleEnrich(lead.id)}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Enrich
                          </Button>
                        )}
                        {lead.status === 'enriched' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                            onClick={() => setViewingLead(lead)}
                          >
                            View Dossier
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Lead Detail Modal */}
      <Dialog open={!!viewingLead} onOpenChange={() => setViewingLead(null)}>
        <DialogContent className="max-w-3xl bg-slate-950 border-slate-800 max-h-[90vh] overflow-y-auto">
          {viewingLead && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-medium">
                      {viewingLead.firstName?.charAt(0)}{viewingLead.lastName?.charAt(0)}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl text-white">{viewingLead.fullName}</DialogTitle>
                      <p className="text-slate-400">{viewingLead.jobTitle} @ {viewingLead.companyName}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Enriched
                  </Badge>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  {viewingLead.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50">
                      <Mail className="w-5 h-5 text-cyan-400" />
                      <span className="text-slate-300">{viewingLead.email}</span>
                    </div>
                  )}
                  {viewingLead.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50">
                      <Phone className="w-5 h-5 text-cyan-400" />
                      <span className="text-slate-300">{viewingLead.phone}</span>
                    </div>
                  )}
                  {viewingLead.linkedInUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50">
                      <Linkedin className="w-5 h-5 text-cyan-400" />
                      <a href={viewingLead.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                        View Profile
                      </a>
                    </div>
                  )}
                </div>

                {/* AI Dossier */}
                {viewingLead.enrichment && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      AI-Generated Dossier
                    </h3>

                    {/* Company Overview */}
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Company Overview</h4>
                      <p className="text-slate-300">{viewingLead.enrichment.companyOverview}</p>
                    </div>

                    {/* Pain Points & Opportunities */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <h4 className="text-sm font-medium text-rose-400 mb-2">Pain Points</h4>
                        <ul className="space-y-1">
                          {viewingLead.enrichment.painPoints.map((point, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-rose-400 mt-1">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <h4 className="text-sm font-medium text-emerald-400 mb-2">Opportunities</h4>
                        <ul className="space-y-1">
                          {viewingLead.enrichment.opportunities.map((opp, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-emerald-400 mt-1">•</span>
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Conversation Starters */}
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <h4 className="text-sm font-medium text-cyan-400 mb-3">Suggested Conversation Starters</h4>
                      <div className="space-y-2">
                        {viewingLead.enrichment.conversationStarters.map((starter, i) => (
                          <div 
                            key={i} 
                            className="p-3 rounded-lg bg-slate-900/50 text-sm text-slate-300 cursor-pointer hover:bg-slate-800/50 transition-colors"
                            onClick={() => setCurrentPage('outreach')}
                          >
                            "{starter}"
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50">
                      <span className="text-slate-400">AI Confidence Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                            style={{ width: `${viewingLead.enrichment.confidenceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-cyan-400 font-medium">
                          {Math.round(viewingLead.enrichment.confidenceScore * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="btn-neon flex-1"
                    onClick={() => {
                      setViewingLead(null);
                      setCurrentPage('outreach');
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Outreach
                  </Button>
                  <Button variant="outline" className="border-slate-700 text-slate-300">
                    <Mail className="w-4 h-4 mr-2" />
                    Copy Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
