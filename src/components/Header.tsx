'use client';

import React from 'react';
import { UtensilsCrossed, LayoutDashboard, Settings as SettingsIcon, ShieldCheck, RotateCcw } from 'lucide-react';
import { VenueSettings } from '@/types/booking';

interface HeaderProps {
  activeView: 'guest' | 'dashboard' | 'settings';
  onViewChange: (view: 'guest' | 'dashboard' | 'settings') => void;
  onResetDemo: () => void;
  onOpenCompliance: () => void;
  venueSettings: VenueSettings;
}

export function Header({
  activeView,
  onViewChange,
  onResetDemo,
  onOpenCompliance,
  venueSettings
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-3">
            {venueSettings.logoUrl ? (
              <img
                src={venueSettings.logoUrl}
                alt={venueSettings.venueName}
                className="w-10 h-10 rounded-xl object-cover border border-white/15 shadow-md shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-neutral-950 shadow-lg shadow-emerald-950/50 shrink-0">
                <UtensilsCrossed className="w-5 h-5 font-black" />
              </div>
            )}
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white truncate">
                  {venueSettings.venueName || 'itsmybooking'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-neutral-800 text-neutral-300 rounded border border-white/10 uppercase shrink-0">
                  itsmyapp.co.uk
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block truncate">
                {venueSettings.tagline || 'UK Hospitality Booking & Kitchen Pacing Engine'}
              </p>
            </div>
          </div>

          {/* View Switcher Tabs (Guest vs Dashboard vs Settings) */}
          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => onViewChange('guest')}
              className={`min-h-[38px] px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'guest'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guest</span> Booking
            </button>

            <button
              type="button"
              onClick={() => onViewChange('dashboard')}
              className={`min-h-[38px] px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Operator</span> <span className="hidden md:inline">FOH</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('settings')}
              className={`min-h-[38px] px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'settings'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

          {/* Right Status & Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCompliance}
              className="min-h-[38px] px-2.5 sm:px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
              title="UK GDPR & WCAG Compliance Details"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">UK GDPR</span>
            </button>

            <button
              type="button"
              onClick={onResetDemo}
              className="min-h-[38px] px-2.5 sm:px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-amber-300 text-xs font-medium rounded-xl border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
              title="Reset initial seed bookings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset Seed</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
