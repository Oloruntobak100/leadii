import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { mockLeads, mockTemplates } from '@/data/mockData';
import { 
  Send, 
  MessageSquare,
  Mail,
  Phone,
  Linkedin,
  CheckCircle2,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const channels = [
  { id: 'email', name: 'Email', icon: Mail, color: 'cyan' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'indigo' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'emerald' },
  { id: 'sms', name: 'SMS', icon: Phone, color: 'purple' },
];

export function Outreach() {
  const { leads } = useAppStore();
  const [selectedChannel, setSelectedChannel] = useState('email');
  const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0]);
  const [message, setMessage] = useState(mockTemplates[0].body);
  const [subject, setSubject] = useState(mockTemplates[0].subject || '');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  const displayLeads = leads.length > 0 ? leads : mockLeads;
  const enrichedLeads = displayLeads.filter(l => l.status === 'enriched');

  const handleSend = () => {
    setIsSending(true);
    // Simulate sending
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setSendProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsSending(false);
        setSendProgress(0);
      }
    }, 300);
  };

  const personalizeMessage = (template: string, lead: typeof enrichedLeads[0]) => {
    return template
      .replace(/\{\{firstName\}\}/g, lead.firstName || '')
      .replace(/\{\{lastName\}\}/g, lead.lastName || '')
      .replace(/\{\{company\}\}/g, lead.companyName || '')
      .replace(/\{\{jobTitle\}\}/g, lead.jobTitle || '')
      .replace(/\{\{painPoint\}\}/g, lead.enrichment?.painPoints[0] || '');
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
          <h1 className="text-3xl font-bold text-white">Outreach</h1>
          <p className="text-slate-400 mt-1">Send personalized messages across channels</p>
        </div>
        <div className="flex gap-3">
          <Card className="glass-card border-0 px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-white">335</p>
                <p className="text-xs text-slate-400">Sent</p>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">68%</p>
                <p className="text-xs text-slate-400">Open Rate</p>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="text-center">
                <p className="text-lg font-bold text-cyan-400">23%</p>
                <p className="text-xs text-slate-400">Response</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Composer */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Channel Selector */}
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex gap-2">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                        selectedChannel === channel.id
                          ? `bg-${channel.color}-500/20 text-${channel.color}-400 border border-${channel.color}-500/30`
                          : "bg-slate-900/50 text-slate-400 hover:bg-slate-800/50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{channel.name}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Message Composer */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Message Composer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selector */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Template</label>
                <div className="flex flex-wrap gap-2">
                  {mockTemplates.filter(t => t.channel === selectedChannel).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setMessage(template.body);
                        setSubject(template.subject || '');
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all",
                        selectedTemplate.id === template.id
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-slate-900/50 text-slate-400 hover:bg-slate-800/50"
                      )}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject (for email) */}
              {selectedChannel === 'email' && (
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Subject</label>
                  <Input 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white"
                    placeholder="Email subject..."
                  />
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Message</label>
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white min-h-[200px]"
                  placeholder="Write your message..."
                />
                <p className="text-xs text-slate-500 mt-2">
                  Use {'{{firstName}}'}, {'{{company}}'}, {'{{painPoint}}'} for personalization
                </p>
              </div>

              {/* AI Assist */}
              <div className="flex gap-2">
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Rewrite
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <Zap className="w-4 h-4 mr-2" />
                  Improve Tone
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                {selectedChannel === 'email' && (
                  <div className="mb-3 pb-3 border-b border-slate-800">
                    <span className="text-slate-500">Subject: </span>
                    <span className="text-slate-300">{personalizeMessage(subject, enrichedLeads[0])}</span>
                  </div>
                )}
                <p className="text-slate-300 whitespace-pre-wrap">
                  {personalizeMessage(message, enrichedLeads[0])}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Panel - Recipients */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Recipient Selection */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {enrichedLeads.map((lead) => (
                  <div 
                    key={lead.id}
                    onClick={() => {
                      if (selectedLeads.includes(lead.id)) {
                        setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                      } else {
                        setSelectedLeads([...selectedLeads, lead.id]);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      selectedLeads.includes(lead.id)
                        ? "bg-cyan-500/10 border border-cyan-500/30"
                        : "bg-slate-900/50 hover:bg-slate-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                      selectedLeads.includes(lead.id)
                        ? "bg-cyan-500 border-cyan-500"
                        : "border-slate-600"
                    )}>
                      {selectedLeads.includes(lead.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                      {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{lead.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{lead.companyName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost Estimate */}
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400">Selected Recipients</span>
                <span className="text-white font-medium">{selectedLeads.length}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400">Cost per message</span>
                <span className="text-white font-medium">
                  {selectedChannel === 'email' ? '0.2' : selectedChannel === 'whatsapp' ? '0.5' : '0.3'} credits
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-slate-400">Total Cost</span>
                <span className="text-cyan-400 font-bold">
                  {(selectedLeads.length * (selectedChannel === 'email' ? 0.2 : selectedChannel === 'whatsapp' ? 0.5 : 0.3)).toFixed(1)} credits
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Send Button */}
          <Button 
            className="w-full btn-neon"
            disabled={selectedLeads.length === 0 || isSending}
            onClick={handleSend}
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending... {sendProgress}%
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {selectedLeads.length} Recipients
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
