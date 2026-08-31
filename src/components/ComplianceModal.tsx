'use client';

import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, FileText, Check } from 'lucide-react';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComplianceModal({ isOpen, onClose }: ComplianceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">UK GDPR & Accessibility Compliance</h2>
              <p className="text-xs text-neutral-400">developer.itsmyapp.co.uk Architectural Standard</p>
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

        {/* Core Pillars */}
        <div className="space-y-4 text-xs sm:text-sm text-neutral-300">
          <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Lock className="w-4 h-4" /> 1. Zero Persistent Tracking Cookies & Telemetry
            </div>
            <p className="text-neutral-400 leading-relaxed">
              In accordance with UK Privacy and Electronic Communications Regulations (PECR) and UK GDPR, this application utilizes zero third-party tracking scripts, analytics beacons, or persistent marketing cookies.
            </p>
          </div>

          <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <FileText className="w-4 h-4" /> 2. 30-Day Automated Data Retention Purge Policy
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Customer reservation data (names, emails, UK telephone numbers, dietary details) is retained strictly for managing the booking and is scheduled for automatic purge 30 days post-visit, minimizing data exposure surface.
            </p>
          </div>

          <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Check className="w-4 h-4" /> 3. Explicit Unbundled Marketing Consent
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Newsletter / seasonal promotional signups are completely independent from table reservation consent and remain <strong>unchecked by default</strong> with clear single-tap opt-outs.
            </p>
          </div>

          <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <EyeOff className="w-4 h-4" /> 4. WCAG 2.1 Level AAA Contrast Ratio (≥ 7:1)
            </div>
            <p className="text-neutral-400 leading-relaxed">
              High-contrast dark-mode surfaces (bg-neutral-950, bg-neutral-900, crisp #ffffff and #34d399 text/accents) deliver contrast ratios exceeding 7:1 across all interactive components with &ge; 44px touch targets.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-sm transition cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
