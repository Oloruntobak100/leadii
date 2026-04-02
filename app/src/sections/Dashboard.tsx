import { useAppStore } from '@/store/appStore';
import { mockCampaigns } from '@/data/mockData';
import { 
  TrendingUp, 
  Users, 
  Sparkles, 
  Send, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const statsData = [
  { name: 'Mon', leads: 45, enriched: 32, contacted: 18 },
  { name: 'Tue', leads: 52, enriched: 41, contacted: 25 },
  { name: 'Wed', leads: 38, enriched: 28, contacted: 15 },
  { name: 'Thu', leads: 65, enriched: 52, contacted: 35 },
  { name: 'Fri', leads: 48, enriched: 38, contacted: 22 },
  { name: 'Sat', leads: 25, enriched: 20, contacted: 12 },
  { name: 'Sun', leads: 30, enriched: 24, contacted: 14 },
];

const channelData = [
  { name: 'Email', value: 145, color: '#06b6d4' },
  { name: 'LinkedIn', value: 89, color: '#4f46e5' },
  { name: 'WhatsApp', value: 67, color: '#8b5cf6' },
  { name: 'SMS', value: 34, color: '#ec4899' },
];

export function Dashboard() {
  const { user, campaigns, setCurrentPage } = useAppStore();

  const totalLeads = campaigns.reduce((sum, c) => sum + c.totalLeadsFound, 0) || mockCampaigns.reduce((sum, c) => sum + c.totalLeadsFound, 0);
  const enrichedLeads = campaigns.reduce((sum, c) => sum + c.enrichedCount, 0) || mockCampaigns.reduce((sum, c) => sum + c.enrichedCount, 0);
  const contactedLeads = campaigns.reduce((sum, c) => sum + c.contactedCount, 0) || mockCampaigns.reduce((sum, c) => sum + c.contactedCount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'enriching' || c.status === 'ready').length || 2;

  const stats = [
    { 
      label: 'Total Leads', 
      value: totalLeads.toLocaleString(), 
      icon: Users, 
      change: '+12.5%', 
      trend: 'up',
      color: 'cyan'
    },
    { 
      label: 'Enriched', 
      value: enrichedLeads.toLocaleString(), 
      icon: Sparkles, 
      change: '+8.2%', 
      trend: 'up',
      color: 'indigo'
    },
    { 
      label: 'Contacted', 
      value: contactedLeads.toLocaleString(), 
      icon: Send, 
      change: '+23.1%', 
      trend: 'up',
      color: 'purple'
    },
    { 
      label: 'Active Campaigns', 
      value: activeCampaigns.toString(), 
      icon: Target, 
      change: '+2', 
      trend: 'up',
      color: 'pink'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
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
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name.split(' ')[0]}! Here's what's happening.</p>
        </div>
        <Button 
          className="btn-neon"
          onClick={() => setCurrentPage('campaigns')}
        >
          <Zap className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={i} className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`} />
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-slate-500">vs last week</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #1e293b',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="leads" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="enriched" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="contacted" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel Performance */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              Outreach by Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #1e293b',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Campaigns */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Recent Campaigns
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-cyan-400 hover:text-cyan-300"
              onClick={() => setCurrentPage('campaigns')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(campaigns.length > 0 ? campaigns : mockCampaigns).slice(0, 3).map((campaign) => (
                <div 
                  key={campaign.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => setCurrentPage('campaigns')}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      campaign.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400' :
                      campaign.status === 'enriching' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="text-sm text-slate-400">{campaign.industry} • {campaign.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Leads</p>
                      <p className="font-medium text-white">{campaign.totalLeadsFound}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Enriched</p>
                      <p className="font-medium text-cyan-400">{campaign.enrichedCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Contacted</p>
                      <p className="font-medium text-indigo-400">{campaign.contactedCount}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400' :
                      campaign.status === 'enriching' ? 'bg-amber-500/20 text-amber-400' :
                      campaign.status === 'completed' ? 'bg-slate-700 text-slate-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
