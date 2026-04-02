'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Mail,
  MessageSquare,
  Linkedin,
  Smartphone,
  Target,
  Zap,
  TrendingUp,
  Briefcase,
  Home,
  Stethoscope,
  ShoppingBag,
  Code,
  GraduationCap,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

const industries = [
  { id: 'realestate', name: 'Real Estate', icon: Home },
  { id: 'saas', name: 'SaaS / Technology', icon: Code },
  { id: 'healthcare', name: 'Healthcare', icon: Stethoscope },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingBag },
  { id: 'finance', name: 'Finance / Banking', icon: TrendingUp },
  { id: 'consulting', name: 'Consulting', icon: Briefcase },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'legal', name: 'Legal Services', icon: Scale },
];

const channels = [
  { id: 'email', name: 'Email', icon: Mail, description: 'Professional & scalable' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, description: 'B2B focused' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, description: 'High engagement' },
  { id: 'sms', name: 'SMS', icon: Smartphone, description: 'Immediate reach' },
];

export function Onboarding() {
  const { setCurrentPage, user, setUser } = useAppStore();
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Simulate API call to save preferences
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Update user with preferences
    if (user) {
      setUser({
        ...user,
      });
    }
    
    setIsCompleting(false);
    setCurrentPage('dashboard');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Leadii!</h2>
              <p className="text-slate-400">
                Let's personalize your experience. First, tell us about your industry.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {industries.map((industry) => {
                const Icon = industry.icon;
                return (
                  <button
                    key={industry.id}
                    onClick={() => setSelectedIndustry(industry.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                      selectedIndustry === industry.id
                        ? "bg-cyan-500/10 border-cyan-500/50"
                        : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      selectedIndustry === industry.id ? "bg-cyan-500/20" : "bg-slate-800"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        selectedIndustry === industry.id ? "text-cyan-400" : "text-slate-400"
                      )} />
                    </div>
                    <span className={cn(
                      "font-medium",
                      selectedIndustry === industry.id ? "text-white" : "text-slate-300"
                    )}>
                      {industry.name}
                    </span>
                    {selectedIndustry === industry.id && (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">How do you prefer to reach out?</h2>
              <p className="text-slate-400">
                Select your primary outreach channel. You can always change this later.
              </p>
            </div>

            <div className="space-y-3">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                      selectedChannel === channel.id
                        ? "bg-cyan-500/10 border-cyan-500/50"
                        : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      selectedChannel === channel.id ? "bg-cyan-500/20" : "bg-slate-800"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        selectedChannel === channel.id ? "text-cyan-400" : "text-slate-400"
                      )} />
                    </div>
                    <div className="flex-1">
                      <span className={cn(
                        "font-medium block",
                        selectedChannel === channel.id ? "text-white" : "text-slate-300"
                      )}>
                        {channel.name}
                      </span>
                      <span className="text-sm text-slate-500">{channel.description}</span>
                    </div>
                    {selectedChannel === channel.id && (
                      <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">You're all set!</h2>
              <p className="text-slate-400">
                Here's what Leadii will do for you:
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Zap,
                  title: 'AI-Powered Discovery',
                  description: 'Find qualified leads across 50+ sources automatically',
                  color: 'cyan',
                },
                {
                  icon: Sparkles,
                  title: 'Deep Enrichment',
                  description: 'Get complete dossiers with pain points & opportunities',
                  color: 'indigo',
                },
                {
                  icon: Send,
                  title: 'Smart Outreach',
                  description: 'Send personalized messages at scale',
                  color: 'purple',
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      `bg-${feature.color}-500/20`
                    )}>
                      <Icon className={cn("w-5 h-5", `text-${feature.color}-400`)} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{feature.title}</h4>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-sm text-cyan-400 text-center">
                <Sparkles className="w-4 h-4 inline mr-1" />
                You received <strong>100 free credits</strong> to get started!
              </p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Step {step} of {totalSteps}</span>
            <span className="text-sm text-cyan-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-slate-700 text-slate-300"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !selectedIndustry) ||
                  (step === 2 && !selectedChannel)
                }
                className="btn-neon"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="btn-neon"
              >
                {isCompleting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Launch Dashboard
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Skip Option */}
        {step < totalSteps && (
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="block mx-auto mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip for now
          </button>
        )}
      </motion.div>
    </div>
  );
}
