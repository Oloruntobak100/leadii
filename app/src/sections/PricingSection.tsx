'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Bot,
  Target,
  Headphones,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PricingFeature {
  name: string;
  icon: React.ElementType;
  basic?: string | boolean;
  premium?: string | boolean;
  highlight?: boolean;
}

const features: PricingFeature[] = [
  { 
    name: 'AI Enrichment Credits', 
    icon: Zap,
    basic: '500 credits',
    premium: 'Unlimited',
    highlight: true
  },
  { 
    name: 'Outreach Channels', 
    icon: MessageSquare,
    basic: 'Email & SMS',
    premium: 'All Channels (WhatsApp, LinkedIn, Twitter)',
    highlight: true
  },
  { 
    name: 'AI Researcher', 
    icon: Bot,
    basic: 'Standard Web Scraping',
    premium: 'Advanced Intelligence Agent',
    highlight: true
  },
  { 
    name: 'Concurrent Campaigns', 
    icon: Target,
    basic: '1 niche at a time',
    premium: '5 campaigns simultaneously',
    highlight: false
  },
  { 
    name: 'Sentiment Analysis', 
    icon: Sparkles,
    basic: false,
    premium: true,
    highlight: true
  },
  { 
    name: 'Custom AI Voice', 
    icon: Mic,
    basic: false,
    premium: true,
    highlight: false
  },
  { 
    name: 'Support Response', 
    icon: Headphones,
    basic: '48 hours',
    premium: '1 hour + Strategy Call',
    highlight: false
  },
];

const basicFeatures = [
  '500 AI Enrichment Credits',
  'Email & SMS Outreach',
  'Standard AI Researcher',
  'Single-Industry Focus',
  '48-hour Support Response',
  'Basic Analytics Dashboard',
];

const premiumFeatures = [
  'Unlimited AI Enrichment',
  'Full Omni-Channel Suite',
  'Advanced Intelligence Agent',
  '5 Concurrent Campaigns',
  'Deep Sentiment Analysis',
  'Custom AI Brand Voice',
  'Priority White-Glove Support',
  '1-on-1 Strategy Call',
];

interface PricingSectionProps {
  onSelectPlan?: (plan: 'basic' | 'premium', isYearly: boolean) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<'basic' | 'premium' | null>(null);

  const basicPrice = isYearly ? 39 : 49;
  const premiumPrice = isYearly ? 119 : 149;
  const yearlySavings = {
    basic: 120,
    premium: 360,
  };

  const handleCheckout = (plan: 'basic' | 'premium') => {
    const priceId = plan === 'basic' 
      ? (isYearly ? 'price_basic_yearly' : 'price_basic_monthly')
      : (isYearly ? 'price_premium_yearly' : 'price_premium_monthly');
    
    onSelectPlan?.(plan, isYearly);
    
    // Stripe integration placeholder
    console.log('Initiating checkout for:', { plan, isYearly, priceId });
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-4">
            <Crown className="w-3 h-3 mr-1" />
            Simple Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="gradient-text">Intelligence Level</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start with the essentials or unlock the full power of autonomous AI lead generation.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={cn(
            "text-sm font-medium transition-colors",
            !isYearly ? "text-white" : "text-slate-500"
          )}>
            Monthly
          </span>
          <div className="relative">
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-cyan-500"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isYearly ? 1 : 0, scale: isYearly ? 1 : 0.8 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2"
            >
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 whitespace-nowrap">
                Save 20%
              </Badge>
            </motion.div>
          </div>
          <span className={cn(
            "text-sm font-medium transition-colors",
            isYearly ? "text-white" : "text-slate-500"
          )}>
            Yearly
          </span>
          {isYearly && (
            <span className="text-xs text-emerald-400 ml-2">
              2 months free
            </span>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Explorer Plan - Basic */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onMouseEnter={() => setHoveredPlan('basic')}
            onMouseLeave={() => setHoveredPlan(null)}
            className={cn(
              "relative rounded-2xl p-8 transition-all duration-500",
              "bg-slate-900/50 backdrop-blur-xl border border-slate-800",
              hoveredPlan === 'basic' && "border-cyan-500/30 shadow-lg shadow-cyan-500/10"
            )}
          >
            {/* Plan Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Explorer</h3>
                  <p className="text-sm text-slate-400">Basic Plan</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={basicPrice}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-5xl font-bold text-white"
                  >
                    ${basicPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="text-slate-400">/month</span>
              </div>
              
              {isYearly && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-emerald-400"
                >
                  Save ${yearlySavings.basic}/year
                </motion.p>
              )}
              
              <p className="text-slate-400 mt-4">
                Perfect for those starting their lead generation journey.
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-4 mb-8">
              {basicFeatures.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-cyan-400" />
                  </div>
                  <span className="text-slate-300">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              onClick={() => handleCheckout('basic')}
              variant="outline"
              className="w-full py-6 text-lg border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
            >
              Start Building
            </Button>
          </motion.div>

          {/* Empire Plan - Premium */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => setHoveredPlan('premium')}
            onMouseLeave={() => setHoveredPlan(null)}
            className={cn(
              "relative rounded-2xl p-8 transition-all duration-500 md:scale-105",
              "bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl",
              "border-2 border-cyan-500/50",
              hoveredPlan === 'premium' && "border-cyan-400 shadow-xl shadow-cyan-500/20"
            )}
          >
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-4 py-1">
                <Crown className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 blur-xl -z-10" />

            {/* Plan Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Empire</h3>
                  <p className="text-sm text-cyan-400">Premium Plan</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={premiumPrice}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-5xl font-bold text-white"
                  >
                    ${premiumPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="text-slate-400">/month</span>
              </div>
              
              {isYearly && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-emerald-400"
                >
                  Save ${yearlySavings.premium}/year
                </motion.p>
              )}
              
              <p className="text-slate-400 mt-4">
                Designed for those who want to dominate their industry with AI intelligence.
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-4 mb-8">
              {premiumFeatures.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white font-medium">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              onClick={() => handleCheckout('premium')}
              className="w-full py-6 text-lg btn-neon relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Unlock Full Power
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </motion.div>
        </div>

        {/* Compare Features Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showComparison ? (
              <>
                Hide Comparison <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Compare All Features <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>

        {/* Feature Comparison Table */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 overflow-hidden"
            >
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="p-4 text-left text-slate-400 font-medium">Feature</th>
                      <th className="p-4 text-center text-slate-400 font-medium">Explorer</th>
                      <th className="p-4 text-center text-cyan-400 font-medium">Empire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, i) => {
                      const Icon = feature.icon;
                      return (
                        <tr 
                          key={i} 
                          className={cn(
                            "border-b border-slate-800/50",
                            feature.highlight && "bg-cyan-500/5"
                          )}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-slate-500" />
                              <span className="text-white">{feature.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {typeof feature.basic === 'boolean' ? (
                              feature.basic ? (
                                <Check className="w-5 h-5 text-cyan-400 mx-auto" />
                              ) : (
                                <span className="text-slate-600">—</span>
                              )
                            ) : (
                              <span className="text-slate-300">{feature.basic}</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof feature.premium === 'boolean' ? (
                              feature.premium ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Check className="w-5 h-5 text-cyan-400" />
                                  <Sparkles className="w-3 h-3 text-cyan-400" />
                                </div>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )
                            ) : (
                              <span className="text-cyan-400 font-medium">{feature.premium}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-500 mb-4">Trusted by 1,000+ sales teams worldwide</p>
          <div className="flex items-center justify-center gap-8">
            {['Stripe', 'Secure', 'GDPR', 'SOC 2'].map((badge) => (
              <div 
                key={badge}
                className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-400 text-sm"
              >
                {badge}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
