import { useAppStore } from '@/store/appStore';
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground';
import { Sidebar } from '@/components/Sidebar';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Landing } from '@/sections/Landing';
import { Onboarding } from '@/sections/Onboarding';
import { Dashboard } from '@/sections/Dashboard';
import { Campaigns } from '@/sections/Campaigns';
import { Leads } from '@/sections/Leads';
import { Enrichment } from '@/sections/Enrichment';
import { Outreach } from '@/sections/Outreach';
import { Credits } from '@/sections/Credits';
import { Settings } from '@/sections/Settings';
import { Admin } from '@/sections/Admin';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { currentPage, sidebarOpen, user } = useAppStore();

  // Render authentication pages
  if (currentPage === 'signup') {
    return (
      <div className="min-h-screen bg-slate-950">
        <NeuralNetworkBackground />
        <AuthLayout
          title="Create your account"
          subtitle="Start your 14-day free trial. No credit card required."
        >
          <SignupForm />
        </AuthLayout>
        <Toaster />
      </div>
    );
  }

  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-slate-950">
        <NeuralNetworkBackground />
        <AuthLayout
          title="Welcome back"
          subtitle="Sign in to access your Leadii dashboard"
        >
          <LoginForm />
        </AuthLayout>
        <Toaster />
      </div>
    );
  }

  if (currentPage === 'forgot-password') {
    return (
      <div className="min-h-screen bg-slate-950">
        <NeuralNetworkBackground />
        <AuthLayout
          title="Reset password"
          subtitle="We'll send you a link to reset your password"
          showBackButton={false}
        >
          <ForgotPasswordForm />
        </AuthLayout>
        <Toaster />
      </div>
    );
  }

  if (currentPage === 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-950">
        <NeuralNetworkBackground />
        <Onboarding />
        <Toaster />
      </div>
    );
  }

  // Render landing page if not logged in
  if (currentPage === 'landing' || !user) {
    return (
      <div className="min-h-screen bg-slate-950">
        <NeuralNetworkBackground />
        <Landing />
        <Toaster />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'campaigns':
        return <Campaigns />;
      case 'leads':
        return <Leads />;
      case 'enrichment':
        return <Enrichment />;
      case 'outreach':
        return <Outreach />;
      case 'credits':
        return <Credits />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <NeuralNetworkBackground />
      <Sidebar />
      
      <main 
        className={`
          flex-1 transition-all duration-300 relative z-10
          ${sidebarOpen ? 'lg:ml-[280px]' : ''}
        `}
      >
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(222 47% 6%)',
            border: '1px solid hsl(217 33% 15%)',
            color: 'white',
          },
        }}
      />
    </div>
  );
}

export default App;
