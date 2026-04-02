'use client';

import { motion } from 'framer-motion';
import {
  Users,
  CreditCard,
  Activity,
  Shield,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const stats = [
  { label: 'Organizations', value: '128', change: '+12%', icon: Users },
  { label: 'MRR (demo)', value: '$24.8k', change: '+8%', icon: CreditCard },
  { label: 'API calls / 24h', value: '1.2M', change: '+3%', icon: Activity },
];

const demoUsers = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex@acme.io', plan: 'Professional', status: 'active' },
  { id: 'u2', name: 'Sam Rivera', email: 'sam@growthlabs.com', plan: 'Empire', status: 'active' },
  { id: 'u3', name: 'Jordan Lee', email: 'jordan@startup.co', plan: 'Explorer', status: 'trialing' },
  { id: 'u4', name: 'Casey Morgan', email: 'casey@enterprise.com', plan: 'Enterprise', status: 'active' },
];

export function Admin() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-amber-400/90">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Demo only — not wired to Supabase
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">Admin portal</h1>
          <p className="mt-1 text-slate-400">
            Static preview of user management, billing overview, and activity (PRD admin area).
          </p>
        </div>
        <Button variant="outline" className="border-slate-600 text-slate-200">
          Export report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-slate-800/80 bg-slate-900/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {s.label}
                </CardTitle>
                <s.icon className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-emerald-400">{s.change} vs last month</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-slate-800/80 bg-slate-900/50">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg text-white">Users</CardTitle>
          <div className="flex w-full max-w-sm items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search users…"
                className="border-slate-700 bg-slate-950/50 pl-9 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">Plan</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoUsers.map((u) => (
                <TableRow key={u.id} className="border-slate-800">
                  <TableCell className="font-medium text-white">{u.name}</TableCell>
                  <TableCell className="text-slate-400">{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-cyan-500/40 text-cyan-300"
                    >
                      {u.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        u.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-slate-500">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
