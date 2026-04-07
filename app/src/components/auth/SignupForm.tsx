'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Linkedin,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
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
import { authUserExistsByEmail, isEmailAlreadyRegisteredError } from '@/lib/authEmail';
import { loadAppUserFromSession } from '@/lib/authSession';
import { toast } from 'sonner';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export type SignupPhase = 'form' | 'verify';

export interface SignupFormProps {
  onPhaseChange?: (phase: SignupPhase, context?: { email: string }) => void;
}

export function SignupForm({ onPhaseChange }: SignupFormProps) {
  const { setCurrentPage, setUser } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<SignupPhase>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const tick = setInterval(() => {
      setResendCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [resendCooldown]);

  const goToForm = useCallback(() => {
    setPhase('form');
    setPendingEmail('');
    setVerificationCode('');
    setResendCooldown(0);
    onPhaseChange?.('form');
  }, [onPhaseChange]);

  const goToVerify = useCallback(
    (email: string) => {
      setPendingEmail(email);
      setVerificationCode('');
      setPhase('verify');
      onPhaseChange?.('verify', { email });
    },
    [onPhaseChange]
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const password = watch('password', '');

  const onSubmit = async (data: SignupFormData) => {
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
      if (exists) {
        toast.error('This email already has an account. Sign in instead.');
        return;
      }

      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName, name: data.fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (isEmailAlreadyRegisteredError(error.message)) {
          toast.error('This email already has an account. Sign in instead.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (signUpData.session && signUpData.user) {
        const appUser = await loadAppUserFromSession(supabase, signUpData.session);
        setUser(appUser);
        toast.success('Account created');
        setCurrentPage('onboarding');
        return;
      }

      toast.success('Check your email — then enter your code below.');
      goToVerify(data.email);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.trim();
    if (!code) {
      toast.error('Enter the verification code from your email.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      toast.error('Supabase is not configured.');
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: code,
        type: 'signup',
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        const appUser = await loadAppUserFromSession(supabase, data.session);
        setUser(appUser);
        toast.success('Email verified — welcome to Leadii');
        setCurrentPage('onboarding');
        return;
      }

      toast.error('Verification failed — check the code and try again, or request a new email.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;

    const supabase = getSupabase();
    if (!supabase) {
      toast.error('Supabase is not configured.');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('We sent another email — check your inbox.');
      setResendCooldown(60);
    } finally {
      setIsResending(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'linkedin_oidc') => {
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
      <AnimatePresence mode="wait">
        {phase === 'form' ? (
          <motion.div
            key="signup-form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Social Auth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSocialSignup('google')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSocialSignup('linkedin_oidc')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </motion.button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-950 text-slate-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    className={cn(
                      'pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600',
                      errors.fullName && 'border-rose-500 focus:border-rose-500'
                    )}
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-rose-400">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className={cn(
                      'pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600',
                      errors.email && 'border-rose-500 focus:border-rose-500'
                    )}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-rose-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn(
                      'pl-10 pr-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600',
                      errors.password && 'border-rose-500 focus:border-rose-500'
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

                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-colors',
                            password.length >= level * 2
                              ? password.length >= 12
                                ? 'bg-emerald-500'
                                : password.length >= 8
                                  ? 'bg-yellow-500'
                                  : 'bg-rose-500'
                              : 'bg-slate-800'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      {password.length < 8 ? 'Weak' : password.length < 12 ? 'Medium' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn(
                      'pl-10 pr-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600',
                      errors.confirmPassword && 'border-rose-500 focus:border-rose-500'
                    )}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Controller
                    name="acceptTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="acceptTerms"
                        checked={field.value}
                        onCheckedChange={(c) => field.onChange(c === true)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        className="mt-1 border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                      />
                    )}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-slate-400 cursor-pointer">
                    I agree to the{' '}
                    <button type="button" className="text-cyan-400 hover:underline">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-cyan-400 hover:underline">
                      Privacy Policy
                    </button>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-rose-400">{errors.acceptTerms.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-neon py-6 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setCurrentPage('login')}
                className="text-cyan-400 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="verify-email"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <form
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleVerifyCode();
              }}
            >
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-cyan-400/90">Step 2 of 2</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We sent a message to{' '}
                  <span className="text-white font-medium break-all">{pendingEmail}</span>.
                  Paste the verification code from that email below (any length).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verify-code" className="text-slate-300">
                  Verification code
                </Label>
                <Input
                  id="verify-code"
                  name="verification-code"
                  type="text"
                  inputMode="text"
                  autoComplete="one-time-code"
                  spellCheck={false}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Paste your code here"
                  className="font-mono text-base bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 tracking-wide"
                />
                <p className="text-xs text-slate-500">
                  Supports codes of any length — copy the full value from your email.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isVerifying}
                className="w-full btn-neon py-6 text-lg"
              >
                {isVerifying ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Verify & continue
                  </>
                )}
              </Button>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-sm">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isResending}
                  className={cn(
                    'text-cyan-400 hover:underline disabled:opacity-50 disabled:no-underline text-left'
                  )}
                >
                  {isResending
                    ? 'Sending…'
                    : resendCooldown > 0
                      ? `Resend email in ${resendCooldown}s`
                      : 'Resend confirmation email'}
                </button>
                <button
                  type="button"
                  onClick={goToForm}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign up
                </button>
              </div>
            </form>

            <p className="text-center text-slate-400">
              Wrong email?{' '}
              <button
                type="button"
                onClick={goToForm}
                className="text-cyan-400 hover:underline font-medium"
              >
                Start over
              </button>
              {' · '}
              <button
                type="button"
                onClick={() => setCurrentPage('login')}
                className="text-cyan-400 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
