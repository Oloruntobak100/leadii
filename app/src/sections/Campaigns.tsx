import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { mockCampaigns } from '@/data/mockData';
import { 
  Target, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Play,
  Sparkles,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const dataSources = [
  { id: 'google', name: 'Google Search', icon: '🔍' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'yellow_pages', name: 'Yellow Pages', icon: '📒' },
  { id: 'yelp', name: 'Yelp', icon: '⭐' },
  { id: 'crunchbase', name: 'Crunchbase', icon: '📊' },
];

const industries = [
  'Real Estate', 'SaaS', 'Healthcare', 'E-commerce', 'Finance', 
  'Technology', 'Marketing', 'Legal', 'Construction', 'Education'
];

export function Campaigns() {
  const { campaigns, addCampaign, setCurrentPage } = useAppStore();
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wizardStep, setWizardStep] = useState(1);
  
  // Wizard state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    nicheType: 'B2B' as 'B2B' | 'B2C',
    industry: '',
    location: '',
    keywords: '',
    sources: [] as string[],
  });

  const displayCampaigns = campaigns.length > 0 ? campaigns : mockCampaigns;
  
  const filteredCampaigns = displayCampaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCampaign = () => {
    const campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      description: newCampaign.description,
      status: 'draft' as const,
      nicheType: newCampaign.nicheType,
      industry: newCampaign.industry,
      location: newCampaign.location,
      keywords: newCampaign.keywords.split(',').map(k => k.trim()),
      sources: newCampaign.sources as any,
      totalLeadsFound: 0,
      enrichedCount: 0,
      contactedCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    addCampaign(campaign);
    setShowWizard(false);
    setWizardStep(1);
    setNewCampaign({
      name: '',
      description: '',
      nicheType: 'B2B',
      industry: '',
      location: '',
      keywords: '',
      sources: [],
    });
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
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-400 mt-1">Manage your lead generation campaigns</p>
        </div>
        <Button className="btn-neon" onClick={() => setShowWizard(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search campaigns..."
            className="pl-10 bg-slate-900/50 border-slate-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </motion.div>

      {/* Campaigns Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => (
          <Card 
            key={campaign.id} 
            className="glass-card border-0 card-hover cursor-pointer group"
            onClick={() => setCurrentPage('leads')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  campaign.status === 'ready' ? 'bg-emerald-500/20' :
                  campaign.status === 'enriching' ? 'bg-amber-500/20' :
                  campaign.status === 'scraping' ? 'bg-cyan-500/20' :
                  'bg-slate-800'
                }`}>
                  <Target className={`w-6 h-6 ${
                    campaign.status === 'ready' ? 'text-emerald-400' :
                    campaign.status === 'enriching' ? 'text-amber-400' :
                    campaign.status === 'scraping' ? 'text-cyan-400' :
                    'text-slate-400'
                  }`} />
                </div>
                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400">
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                {campaign.name}
              </h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {campaign.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {campaign.industry}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {campaign.location}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">{campaign.totalLeadsFound}</p>
                    <p className="text-xs text-slate-500">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-cyan-400">{campaign.enrichedCount}</p>
                    <p className="text-xs text-slate-500">Enriched</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-indigo-400">{campaign.contactedCount}</p>
                    <p className="text-xs text-slate-500">Contacted</p>
                  </div>
                </div>
                <Badge className={cn(
                  campaign.status === 'ready' && 'bg-emerald-500/20 text-emerald-400',
                  campaign.status === 'enriching' && 'bg-amber-500/20 text-amber-400',
                  campaign.status === 'scraping' && 'bg-cyan-500/20 text-cyan-400',
                  campaign.status === 'draft' && 'bg-slate-700 text-slate-400',
                  campaign.status === 'completed' && 'bg-slate-700 text-slate-400',
                )}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* New Campaign Wizard */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              Create New Campaign
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors",
                    wizardStep >= step 
                      ? "bg-cyan-500 text-white" 
                      : "bg-slate-800 text-slate-400"
                  )}>
                    {wizardStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={cn(
                      "w-24 h-1 mx-2",
                      wizardStep > step ? "bg-cyan-500" : "bg-slate-800"
                    )} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {wizardStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-white">Campaign Details</h3>
                  
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Campaign Name</label>
                    <Input 
                      placeholder="e.g., Real Estate Investors - Miami"
                      className="bg-slate-900 border-slate-700 text-white"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Description</label>
                    <Input 
                      placeholder="Brief description of your target audience"
                      className="bg-slate-900 border-slate-700 text-white"
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Target Type</label>
                    <div className="flex gap-4">
                      {(['B2B', 'B2C'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewCampaign({...newCampaign, nicheType: type})}
                          className={cn(
                            "flex-1 p-4 rounded-xl border transition-all",
                            newCampaign.nicheType === type
                              ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                              : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          <Building2 className="w-6 h-6 mb-2 mx-auto" />
                          <p className="font-medium">{type}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {wizardStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-white">Target Criteria</h3>
                  
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Industry</label>
                    <div className="flex flex-wrap gap-2">
                      {industries.map((industry) => (
                        <button
                          key={industry}
                          onClick={() => setNewCampaign({...newCampaign, industry})}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-sm transition-all",
                            newCampaign.industry === industry
                              ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                              : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Location</label>
                    <Input 
                      placeholder="e.g., Miami, FL or United States"
                      className="bg-slate-900 border-slate-700 text-white"
                      value={newCampaign.location}
                      onChange={(e) => setNewCampaign({...newCampaign, location: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Keywords (comma separated)</label>
                    <Input 
                      placeholder="e.g., real estate investor, property management"
                      className="bg-slate-900 border-slate-700 text-white"
                      value={newCampaign.keywords}
                      onChange={(e) => setNewCampaign({...newCampaign, keywords: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}

              {wizardStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-white">Data Sources</h3>
                  <p className="text-sm text-slate-400">Select where to search for leads</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {dataSources.map((source) => (
                      <button
                        key={source.id}
                        onClick={() => {
                          const sources = newCampaign.sources.includes(source.id)
                            ? newCampaign.sources.filter(s => s !== source.id)
                            : [...newCampaign.sources, source.id];
                          setNewCampaign({...newCampaign, sources});
                        }}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          newCampaign.sources.includes(source.id)
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-slate-700 bg-slate-900 hover:border-slate-600"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{source.icon}</span>
                          <div>
                            <p className={cn(
                              "font-medium",
                              newCampaign.sources.includes(source.id) ? "text-cyan-400" : "text-white"
                            )}>
                              {source.name}
                            </p>
                          </div>
                          {newCampaign.sources.includes(source.id) && (
                            <CheckCircle2 className="w-5 h-5 text-cyan-400 ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="text-sm text-amber-400">
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Estimated cost: <strong>~50 credits</strong> for initial lead discovery
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setShowWizard(false)}
                className="border-slate-700 text-slate-300"
              >
                {wizardStep === 1 ? 'Cancel' : 'Back'}
              </Button>
              
              <Button
                className="btn-neon"
                onClick={() => {
                  if (wizardStep < 3) {
                    setWizardStep(wizardStep + 1);
                  } else {
                    handleCreateCampaign();
                  }
                }}
                disabled={
                  (wizardStep === 1 && !newCampaign.name) ||
                  (wizardStep === 3 && newCampaign.sources.length === 0)
                }
              >
                {wizardStep === 3 ? 'Create Campaign' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
