'use client';

import React from 'react';
import { ShieldCheck, Server, Globe, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-neutral-950 border-t border-white/10 mt-auto py-8 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">its<span className="text-emerald-400">my</span>booking</span>
            <span className="text-neutral-500">•</span>
            <span>A developer.itsmyapp.co.uk application</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> UK Localization (GBP £ • DD/MM/YYYY)
            </span>
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-400" /> Edge CDN Ready
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" /> Client-Side Firebase SDK
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> UK GDPR / WCAG AAA
            </span>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-[11px] gap-2">
          <p>© {new Date().getFullYear()} itsmyapp.co.uk. All rights reserved. Zero tracking cookies.</p>
          <p>Strict TypeScript • 100% Client-Side Data Orchestration • 30-Day Purge Retention</p>
        </div>
      </div>
    </footer>
  );
}
