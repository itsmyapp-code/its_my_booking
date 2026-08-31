'use client';

import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Building2, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft,
  KeyRound,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { authService, OperatorUser } from '@/lib/auth-service';
import { validateUKPhone } from '@/lib/date-utils';

interface VenueAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: OperatorUser) => void;
  defaultMode?: 'signin' | 'register' | 'forgot';
}

export function VenueAuthModal({
  isOpen,
  onClose,
  onAuthenticated,
  defaultMode = 'signin'
}: VenueAuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>(defaultMode);
  
  // Show / Hide Password state
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [venueName, setVenueName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [rememberTerminal, setRememberTerminal] = useState<boolean>(true);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await authService.signIn(email.trim(), password);
      onAuthenticated(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueName.trim() || !email.trim() || !password) {
      setErrorMsg('Please complete all required fields');
      return;
    }

    const phoneValidation = validateUKPhone(phone);
    if (!phoneValidation.isValid) {
      setErrorMsg(phoneValidation.error || 'Valid UK phone number required');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await authService.register(venueName.trim(), email.trim(), password, phoneValidation.formatted);
      onAuthenticated(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await authService.sendPasswordReset(email.trim());
      setResetSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = authService.signInDemo();
    onAuthenticated(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {mode === 'signin' && 'Venue Operator Login'}
                {mode === 'register' && 'Register New Venue'}
                {mode === 'forgot' && 'Reset Operator Password'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {mode === 'signin' && 'Access Front of House and Kitchen Pacing'}
                {mode === 'register' && 'Create your dedicated booking portal'}
                {mode === 'forgot' && 'Receive a secure recovery link'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN MODE */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@venue.co.uk"
                  className="w-full min-h-[44px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white placeholder-neutral-500 focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Password with Show / Hide Toggle */}
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full min-h-[44px] pl-10 pr-11 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white placeholder-neutral-500 focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={rememberTerminal}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded border-neutral-700 bg-neutral-900"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to FOH Console <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* 1-Click Demo Login Banner */}
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full min-h-[40px] bg-neutral-950 hover:bg-neutral-800 text-emerald-400 font-semibold rounded-xl text-xs border border-emerald-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Manager Sign-In
              </button>
            </div>

            <div className="text-center pt-1">
              <span className="text-xs text-neutral-400">New restaurant or pub? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                Register Venue
              </button>
            </div>
          </form>
        )}

        {/* 2. FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {resetSuccess ? (
              <div className="p-5 bg-neutral-950 rounded-xl border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-white text-base">Reset Link Dispatched</h3>
                <p className="text-xs text-neutral-300">
                  We have sent password recovery instructions to <strong>{email}</strong>. Please check your inbox and spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setResetSuccess(false);
                  }}
                  className="w-full min-h-[42px] bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Enter your registered venue operator email. We will send a secure link to reset your account password.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="manager@venue.co.uk"
                      className="w-full min-h-[44px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white placeholder-neutral-500 focus:border-emerald-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[46px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Sending Reset Link...
                    </>
                  ) : (
                    'Send Password Recovery Email'
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white font-semibold cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 3. REGISTER NEW VENUE MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1">
                Venue Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. The Ship Inn Porlock Weir"
                  className="w-full min-h-[40px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1">
                Operator Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@theshipinnporlockweir.co.uk"
                  className="w-full min-h-[40px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1">
                UK Contact Telephone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01643 863288"
                  className="w-full min-h-[40px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1">
                Choose Secure Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full min-h-[40px] pl-10 pr-11 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[46px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40 mt-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Register Venue & Launch Engine <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <span className="text-xs text-neutral-400">Already registered? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
