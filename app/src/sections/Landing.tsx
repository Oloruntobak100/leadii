'use client';

import { useAppStore } from '@/store/appStore';
import { motion } from 'framer-motion';
import { 
  Zap,
  Target,
  Sparkles,
  Send,
  ArrowRight,
  CheckCircle2,
  Star,
  Globe,
  MessageSquare,
  Mail,
  Linkedin,
  Smartphone,
  Shield,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MagicSearch } from '@/components/MagicSearch';
import { PricingSection } from './PricingSection';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Target,
    title: 'Autonomous Research',
    description: 'Our AI reads news, social posts, and company data to build complete prospect profiles.',
    color: 'cyan',
  },
  {
    icon: Send,
    title: 'Omni-Channel Outreach',
    description: 'Reach prospects where they are: Email, LinkedIn, WhatsApp, and SMS—all from one platform.',
    color: 'indigo',
  },
  {
    icon: Globe,
    title: 'Industry Agnostic',
    description: 'From local trades to global SaaS. Leadii works for any niche, any market, any size.',
    color: 'purple',
  },
];

const steps = [
  {
    step: 1,
    title: 'Define Your Niche',
    description: 'Tell us who you want to reach - industry, location, company size, and more.',
  },
  {
    step: 2,
    title: 'AI Discovers Leads',
    description: 'Our AI searches the web and finds hundreds of qualified prospects in minutes.',
  },
  {
    step: 3,
    title: 'Deep Research',
    description: 'Each lead gets enriched with company data, recent news, pain points, and personalization hints.',
  },
  {
    step: 4,
    title: 'Start Outreach',
    description: 'Use AI-generated templates to send personalized messages across all channels.',
  },
];

const testimonials = [
  {
    name: 'Michael Chen',
    role: 'Sales Director',
    company: 'TechFlow Inc.',
    content: 'Leadii helped us find 500+ qualified leads in our target market. The AI enrichment is like having a research team working 24/7.',
    rating: 5,
  },
  {
    name: 'Sarah Williams',
    role: 'Founder',
    company: 'GrowthLabs',
    content: 'We increased our response rate by 3x using the personalized conversation starters. Game changer for our outreach.',
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'VP Sales',
    company: 'CloudScale',
    content: 'The multi-channel outreach saved us countless hours. One platform for Email, LinkedIn, and WhatsApp - brilliant!',
    rating: 5,
  },
];

const stats = [
  { value: '10M+', label: 'Leads Discovered' },
  { value: '94%', label: 'Avg. Enrichment Score' },
  { value: '3x', label: 'Response Rate Increase' },
  { value: '50+', label: 'Data Sources' },
];

export function Landing() {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="min-h-screen relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Leadii</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage('login')}
              className="text-slate-400 hover:text-white transition-colors hidden sm:block"
            >
              Sign in
            </button>
            <Button 
              className="btn-neon"
              onClick={() => setCurrentPage('signup')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-6">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Lead Generation
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                Don't just find leads.<br />
                <span className="gradient-text">Understand them.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10">
                Leadii uses autonomous AI agents to research, qualify, and message your prospects 
                across WhatsApp, SMS, and Social Media—all while you sleep.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  className="btn-neon text-lg px-8 py-6"
                  onClick={() => setCurrentPage('signup')}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-700 text-slate-300 text-lg px-8 py-6"
                  onClick={() => setCurrentPage('login')}
                >
                  View Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Magic Search Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-3xl blur-3xl -z-10" />
            <Card className="glass-card border-0 relative overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Try the Magic Search</h3>
                  <p className="text-slate-400">Watch AI scan the web and find your ideal prospects in real-time</p>
                </div>
                <MagicSearch />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 mb-4">
                <Target className="w-3 h-3 mr-1" />
                Powerful Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Everything You Need for <span className="gradient-text">Sales Outreach</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Three powerful tools working together to help you find, research, and connect with your ideal customers.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass-card border-0 h-full card-hover">
                    <CardContent className="p-8">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-6",
                        `bg-${feature.color}-500/20`
                      )}>
                        <Icon className={cn("w-7 h-7", `text-${feature.color}-400`)} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-slate-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Channel Icons */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-slate-500 mb-6">Connect with prospects on their preferred channels</p>
            <div className="flex justify-center gap-6">
              {[
                { icon: Mail, label: 'Email', color: 'cyan' },
                { icon: Linkedin, label: 'LinkedIn', color: 'blue' },
                { icon: MessageSquare, label: 'WhatsApp', color: 'green' },
                { icon: Smartphone, label: 'SMS', color: 'purple' },
              ].map((channel, i) => {
                const Icon = channel.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      `bg-${channel.color}-500/20`
                    )}>
                      <Icon className={cn("w-6 h-6", `text-${channel.color}-400`)} />
                    </div>
                    <span className="text-sm text-slate-400">{channel.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-950/50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">
                <Clock className="w-3 h-3 mr-1" />
                Simple Process
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                How <span className="gradient-text">Leadii Works</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                From niche definition to outreach in four simple steps.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mb-4">
                  {step.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-12 w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                )}
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4">
                <Users className="w-3 h-3 mr-1" />
                Customer Love
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Loved by <span className="gradient-text">Sales Teams</span>
              </h2>
              <p className="text-xl text-slate-400">
                See what our customers have to say about Leadii.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card border-0 h-full">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-300 mb-6">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                      <div>
                        <p className="font-medium text-white">{testimonial.name}</p>
                        <p className="text-sm text-slate-400">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <div id="pricing">
        <PricingSection onSelectPlan={(plan, isYearly) => {
          console.log('Selected plan:', plan, 'Yearly:', isYearly);
          setCurrentPage('signup');
        }} />
      </div>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to <span className="gradient-text">Supercharge</span> Your Sales?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join 1,000+ sales teams using Leadii to find and connect with their ideal customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="btn-neon text-lg px-12 py-6"
                onClick={() => setCurrentPage('signup')}
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                No credit card required
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Leadii</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered lead generation that works while you sleep.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2024 Leadii. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">SOC 2 Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
