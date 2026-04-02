import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { mockCreditPackages, costMatrix } from '@/data/mockData';
import { 
  CreditCard, 
  Zap,
  Check,
  Sparkles,
  TrendingUp,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const usageHistory = [
  { action: 'Deep Enrichment', leads: 45, credits: 90, date: '2024-01-20' },
  { action: 'Email Outreach', leads: 120, credits: 24, date: '2024-01-19' },
  { action: 'Lead Discovery', leads: 200, credits: 20, date: '2024-01-18' },
  { action: 'LinkedIn Messages', leads: 35, credits: 14, date: '2024-01-17' },
  { action: 'WhatsApp Outreach', leads: 25, credits: 12.5, date: '2024-01-16' },
];

export function Credits() {
  const { user, creditPackages } = useAppStore();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSelectedPackage(null);
    }, 2000);
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
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white">Credits & Billing</h1>
        <p className="text-slate-400 mt-1">Manage your credits and subscription</p>
      </motion.div>

      {/* Credit Balance Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10" />
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 mb-2">Current Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{user?.credits.toLocaleString()}</span>
                  <span className="text-xl text-slate-400">credits</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Estimated ~{Math.floor((user?.credits || 0) / 2)} enrichments remaining
                </p>
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-cyan-500/30 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">65%</p>
                  <p className="text-xs text-slate-400">of monthly</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Monthly Usage</span>
                <span className="text-white">1,250 / 2,000 credits</span>
              </div>
              <Progress value={65} className="h-2 bg-slate-800">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" />
              </Progress>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cost Matrix */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Credit Cost Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { action: 'Lead Discovery', cost: costMatrix.scrapeLead, icon: TrendingUp, color: 'cyan' },
                { action: 'Deep Enrichment', cost: costMatrix.deepEnrichment, icon: Sparkles, color: 'indigo' },
                { action: 'Email', cost: costMatrix.emailMessage, icon: '✉️', color: 'emerald' },
                { action: 'LinkedIn DM', cost: costMatrix.linkedinMessage, icon: '💼', color: 'blue' },
                { action: 'WhatsApp', cost: costMatrix.whatsappMessage, icon: '💬', color: 'green' },
                { action: 'SMS', cost: costMatrix.smsMessage, icon: '📱', color: 'purple' },
              ].map((item) => (
                <div key={item.action} className="p-4 rounded-xl bg-slate-900/50 text-center">
                  <p className="text-2xl mb-2">{typeof item.icon === 'string' ? item.icon : <item.icon className={`w-6 h-6 mx-auto text-${item.color}-400`} />}</p>
                  <p className="text-sm text-slate-400">{item.action}</p>
                  <p className="text-lg font-bold text-white mt-1">{item.cost} cr</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Purchase Credits */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-white mb-4">Purchase Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(creditPackages.length > 0 ? creditPackages : mockCreditPackages).map((pkg) => (
            <Card 
              key={pkg.id} 
              className={cn(
                "glass-card border-0 cursor-pointer transition-all",
                selectedPackage === pkg.id && "border-2 border-cyan-500"
              )}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-white mb-2">{pkg.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">{pkg.credits.toLocaleString()}</span>
                  <span className="text-slate-400">credits</span>
                </div>
                <p className="text-3xl font-bold text-cyan-400 mb-4">${pkg.price}</p>
                <p className="text-sm text-slate-400 mb-4">
                  ~{Math.floor(pkg.credits / 2)} enrichments
                </p>
                <Button 
                  className={cn(
                    "w-full",
                    selectedPackage === pkg.id ? "btn-neon" : "bg-slate-800 text-white hover:bg-slate-700"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPackage(pkg.id);
                  }}
                >
                  {selectedPackage === pkg.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="glass-card border-0 border-t-4 border-t-cyan-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400">Selected Package</p>
                    <p className="text-xl font-medium text-white">
                      {(creditPackages.length > 0 ? creditPackages : mockCreditPackages).find(p => p.id === selectedPackage)?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">Total</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      ${(creditPackages.length > 0 ? creditPackages : mockCreditPackages).find(p => p.id === selectedPackage)?.price}
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 btn-neon"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase with Stripe
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Usage History */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Recent Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.action}</p>
                      <p className="text-sm text-slate-400">{item.leads} leads • {item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-rose-400">-{item.credits} cr</p>
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
