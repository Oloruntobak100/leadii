import { create } from 'zustand';
import type { User, Campaign, Lead, MessageTemplate, CreditPackage } from '@/types';
import {
  mockCampaigns,
  mockLeads,
  mockTemplates,
  mockCreditPackages,
} from '@/data/mockData';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // Campaigns
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  
  // Leads
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  
  // Enrichment
  activeEnrichments: string[];
  addActiveEnrichment: (leadId: string) => void;
  removeActiveEnrichment: (leadId: string) => void;
  
  // Templates
  templates: MessageTemplate[];
  setTemplates: (templates: MessageTemplate[]) => void;
  
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Credit packages
  creditPackages: CreditPackage[];
  setCreditPackages: (packages: CreditPackage[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User — start logged out so landing, login, and signup flows are reachable
  user: null,
  setUser: (user) => set({ user }),

  // Navigation — start on marketing page
  currentPage: 'landing',
  setCurrentPage: (page) => set({ currentPage: page }),

  // Campaigns / leads / templates — seeded for dashboard & module demos
  campaigns: [...mockCampaigns],
  setCampaigns: (campaigns) => set({ campaigns }),
  addCampaign: (campaign) => set((state) => ({ 
    campaigns: [...state.campaigns, campaign] 
  })),
  updateCampaign: (id, updates) => set((state) => ({
    campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  
  leads: [...mockLeads],
  setLeads: (leads) => set({ leads }),
  updateLead: (id, updates) => set((state) => ({
    leads: state.leads.map(l => l.id === id ? { ...l, ...updates } : l)
  })),
  
  // Enrichment
  activeEnrichments: [],
  addActiveEnrichment: (leadId) => set((state) => ({
    activeEnrichments: [...state.activeEnrichments, leadId]
  })),
  removeActiveEnrichment: (leadId) => set((state) => ({
    activeEnrichments: state.activeEnrichments.filter(id => id !== leadId)
  })),
  
  templates: [...mockTemplates],
  setTemplates: (templates) => set({ templates }),
  
  // UI State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  // Credit packages
  creditPackages: [...mockCreditPackages],
  setCreditPackages: (creditPackages) => set({ creditPackages }),
}));
