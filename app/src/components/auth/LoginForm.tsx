'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Linkedin,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import {
  getSupabase,
  isSupabaseConfigured,
  supabaseKeyConfigError,
} from '@/lib/supabase';
import { authUserExistsByEmail } from '@/lib/authEmail';
import { loadAppUserFromSession } from '@/lib/authSession';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { setCurrentPage, setUser } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const supabase = getSupabase();
      if (supabaseKeyConfigError) {
        toast.error(supabaseKeyConfigError);
        return;
      }
      if (!supabase) {
        toast.error(
          'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (anon key) in app/.env or on Vercel.'
        );
        return;
      }

      const { exists, errorMessage } = await authUserExistsByEmail(
        supabase,
        data.email
      );
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }
      if (!exists) {
        toast.error(
          'No account for this email. Create an account to get started.'
        );
        return;
      }

      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(
          error.message.toLowerCase().includes('invalid login')
            ? 'Incorrect password. Try again or use Forgot password.'
            : error.message
        );
        return;
      }

      if (!signInData.session) {
        toast.error('No session returned. Confirm your email if required.');
        return;
      }

      const appUser = await loadAppUserFromSession(supabase, signInData.session);
      setUser(appUser);
      toast.success('Welcome back');
      setCurrentPage('dashboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin_oidc') => {
    const supabase = getSupabase();
    if (supabaseKeyConfigError) {
      toast.error(supabaseKeyConfigError);
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      toast.error(
        'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (anon) on Vercel or in app/.env.'
      );
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="space-y-6">
      {/* Social Auth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialLogin('google')}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialLogin('linkedin_oidc')}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
        >
          <Linkedin className="w-5 h-5" />
          LinkedIn
        </motion.button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-950 text-slate-500">Or continue with email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className={cn(
                "pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600",
                errors.email && "border-rose-500 focus:border-rose-500"
              )}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-rose-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <button
              type="button"
              onClick={() => setCurrentPage('forgot-password')}
              className="text-sm text-cyan-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={cn(
                "pl-10 pr-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600",
                errors.password && "border-rose-500 focus:border-rose-500"
              )}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-rose-400">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="rememberMe"
            {...register('rememberMe')}
            className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
          />
          <Label htmlFor="rememberMe" className="text-sm text-slate-400 cursor-pointer">
            Remember me for 30 days
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full btn-neon py-6 text-lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center text-slate-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => setCurrentPage('signup')}
          className="text-cyan-400 hover:underline font-medium"
        >
          Create one
        </button>
      </p>
    </div>
  );
}
