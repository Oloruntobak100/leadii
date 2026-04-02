import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { 
  User,
  Bell,
  Shield,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const integrations = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', connected: true, color: 'blue' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', connected: false, color: 'cyan' },
  { id: 'hubspot', name: 'HubSpot', icon: '🟠', connected: false, color: 'orange' },
  { id: 'slack', name: 'Slack', icon: '💬', connected: true, color: 'purple' },
  { id: 'google', name: 'Google Sheets', icon: '📊', connected: false, color: 'green' },
];

export function Settings() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    enrichment: true,
    responses: true,
    weekly: false,
  });

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
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/50 border border-slate-800 mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <LinkIcon className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium">
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <Button variant="outline" className="border-slate-700 text-slate-300">
                      Change Avatar
                    </Button>
                    <p className="text-sm text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Full Name</Label>
                    <Input 
                      defaultValue={user?.name}
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Email</Label>
                    <Input 
                      defaultValue={user?.email}
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Company</Label>
                    <Input 
                      placeholder="Your company name"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Job Title</Label>
                    <Input 
                      placeholder="Your job title"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <Button className="btn-neon">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { id: 'email', label: 'Email Notifications', description: 'Receive updates via email', icon: Mail },
                  { id: 'push', label: 'Push Notifications', description: 'Browser push notifications', icon: Bell },
                  { id: 'enrichment', label: 'Enrichment Complete', description: 'When AI enrichment finishes', icon: CheckCircle2 },
                  { id: 'responses', label: 'Lead Responses', description: 'When a lead replies to your message', icon: MessageSquare },
                  { id: 'weekly', label: 'Weekly Report', description: 'Weekly summary of activities', icon: Mail },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-sm text-slate-400">{item.description}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={notifications[item.id as keyof typeof notifications]}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, [item.id]: checked })
                        }
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Connected Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrations.map((integration) => (
                    <div 
                      key={integration.id} 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                        integration.connected
                          ? "bg-slate-900/50 border-slate-700"
                          : "bg-slate-900/30 border-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{integration.icon}</span>
                        <div>
                          <p className="font-medium text-white">{integration.name}</p>
                          <Badge 
                            className={cn(
                              integration.connected
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-slate-700 text-slate-400"
                            )}
                          >
                            {integration.connected ? 'Connected' : 'Not Connected'}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant={integration.connected ? "outline" : "default"}
                        size="sm"
                        className={cn(
                          integration.connected
                            ? "border-slate-700 text-slate-300"
                            : "btn-neon"
                        )}
                      >
                        {integration.connected ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-400">Enabled via Authenticator app</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-white">Change Password</h4>
                  <div className="space-y-3">
                    <Input 
                      type="password"
                      placeholder="Current password"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                    <Input 
                      type="password"
                      placeholder="New password"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                    <Input 
                      type="password"
                      placeholder="Confirm new password"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <Button className="btn-neon">
                    Update Password
                  </Button>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <h4 className="font-medium text-rose-400 mb-4">Danger Zone</h4>
                  <Button variant="destructive">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
