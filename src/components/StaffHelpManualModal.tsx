'use client';

import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  PhoneCall, 
  UserCheck, 
  Ban, 
  CalendarDays, 
  Flame, 
  Link, 
  ShieldCheck, 
  Printer, 
  CheckCircle2, 
  Search,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  HelpCircle,
  Clock,
  Dog,
  Baby
} from 'lucide-react';

interface StaffHelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffHelpManualModal({ isOpen, onClose }: StaffHelpManualModalProps) {
  const [activeTopic, setActiveTopic] = useState<'daily' | 'blackouts' | 'pacing' | 'links' | 'gdpr'>('daily');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const topics = [
    { id: 'daily', title: 'Daily FOH & Bookings', icon: UserCheck },
    { id: 'blackouts', title: 'Shift Closures & Blackouts', icon: Ban },
    { id: 'pacing', title: 'Kitchen Pacing & Covers', icon: Flame },
    { id: 'links', title: 'Publishing & Embed Links', icon: Link },
    { id: 'gdpr', title: 'UK GDPR & Compliance', icon: ShieldCheck }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Staff Operations & User Manual
              </h2>
              <p className="text-xs text-neutral-400">
                Official guide for Front of House staff, managers, and kitchen hosts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-white/10 transition hidden sm:flex items-center gap-1.5 cursor-pointer"
              title="Print Staff Cheat Sheet"
            >
              <Printer className="w-3.5 h-3.5" /> Print Manual
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0 border-b border-white/10">
          {topics.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTopic === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTopic(t.id)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md font-black'
                    : 'bg-neutral-950 text-neutral-400 border-white/10 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-sm text-neutral-300">
          {/* TOPIC 1: DAILY FOH OPERATIONS */}
          {activeTopic === 'daily' && (
            <div className="space-y-5">
              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400" /> Taking Phone & Advance Table Reservations
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  When a customer calls or walks up in advance, click the green <strong>&ldquo;+ Take Phone / Table Booking&rdquo;</strong> button in the top bar.
                </p>
                <ul className="text-xs text-neutral-400 list-disc list-inside space-y-1 pl-1">
                  <li><strong>Date & Service:</strong> Choose today or select any future date. Select Lunch (12:00–15:00) or Dinner (17:30–22:00).</li>
                  <li><strong>Party Size:</strong> Tap covers 1 to 20+. Staff can bypass public online guest caps.</li>
                  <li><strong>Seating Area / Table:</strong> Allocate specific tables (*Main Dining, Snug, Bar, Terrace, Private Dining*).</li>
                  <li><strong>Special Notes:</strong> Record severe allergies, dog-friendly requests, or highchair requirements.</li>
                </ul>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Fast Walk-In Seating (3-Tap Seat Table)
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  For immediate guests walking into the venue without a prior reservation:
                </p>
                <ol className="text-xs text-neutral-400 list-decimal list-inside space-y-1 pl-1">
                  <li>Tap <strong>&ldquo;Fast Walk-In&rdquo;</strong> in the top header.</li>
                  <li>Tap the party size (1–8 covers) and verify the time slot.</li>
                  <li>Tap <strong>&ldquo;Confirm & Seat Walk-In&rdquo;</strong> $\rightarrow$ The guest is immediately logged as <strong>Seated</strong> and seated cover totals update instantly.</li>
                </ol>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" /> Managing Booking Statuses on the Run Sheet
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-emerald-500/30">
                    <span className="font-bold text-emerald-400">Seat Table</span>: Tap when the party arrives and is seated at their table.
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-blue-500/30">
                    <span className="font-bold text-blue-400">Confirm</span>: Acknowledges unconfirmed online bookings.
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-purple-500/30">
                    <span className="font-bold text-purple-400">No-Show</span>: Flags late parties who failed to arrive after the grace period.
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-red-500/30">
                    <span className="font-bold text-red-400">Cancel</span>: Releases capacity back into available online inventory.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOPIC 2: SHIFT CLOSURES & BLACKOUTS */}
          {activeTopic === 'blackouts' && (
            <div className="space-y-5">
              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Ban className="w-4 h-4 text-red-400" /> Shutting Down Lunch or Dinner (Today or Future)
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  To close online reservations for private weddings, maintenance, or fully committed shifts:
                </p>
                <ol className="text-xs text-neutral-400 list-decimal list-inside space-y-1.5 pl-1">
                  <li>Click <strong>&ldquo;Shut Down Service&rdquo;</strong> in the top header.</li>
                  <li>Type or pick the target date (e.g. <code>05/09/2026</code>).</li>
                  <li>Select <strong>All Day</strong>, <strong>Lunch Only</strong>, or <strong>Dinner Only</strong>.</li>
                  <li>Type the reason (e.g. <em>&ldquo;Private Wedding & Function&rdquo;</em>).</li>
                  <li>Click <strong>&ldquo;Confirm & Shut Down&rdquo;</strong> $\rightarrow$ Online guests will immediately see a red closure alert on the booking widget and time slots will be locked.</li>
                </ol>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-400" /> Multi-Day Month Calendar View
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Click <strong>&ldquo;Month Calendar&rdquo;</strong> to view the entire month grid.
                </p>
                <ul className="text-xs text-neutral-400 list-disc list-inside space-y-1 pl-1">
                  <li><strong>Cover Badges:</strong> Shows total booked covers for every day (e.g. <code>42 cov</code>).</li>
                  <li><strong>Red SHUT Badges:</strong> Closed days are highlighted in bold red.</li>
                  <li><strong>1-Tap Navigation:</strong> Click any day on the calendar to instantly view and manage that day&apos;s run sheet.</li>
                </ul>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Emergency Master Kill Switch
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  The red/green <strong>&ldquo;System: ACTIVE / PAUSED&rdquo;</strong> button in the top right allows the manager to immediately pause all incoming online guest reservations venue-wide with a single click.
                </p>
              </div>
            </div>
          )}

          {/* TOPIC 3: KITCHEN PACING & COVERS */}
          {activeTopic === 'pacing' && (
            <div className="space-y-5">
              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" /> Why Kitchen Pacing Matters
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  <code>itsmybooking</code> uses a 15-minute kitchen pacing throttle (default: <strong>8 covers per 15 minutes</strong>). This ensures that arrivals are evenly distributed throughout the service window, preventing the pass and kitchen line from being overwhelmed.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" /> Adjusting Pacing & Shift Caps
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Managers can adjust pacing inside the <strong>Venue Settings</strong> tab:
                </p>
                <ul className="text-xs text-neutral-400 list-disc list-inside space-y-1 pl-1">
                  <li><strong>Covers per 15 mins:</strong> Adjust throttle slider between 2 and 20 covers.</li>
                  <li><strong>Lunch Shift Cap:</strong> Maximum total covers allowed for lunch (12:00–15:00).</li>
                  <li><strong>Dinner Shift Cap:</strong> Maximum total covers allowed for dinner (17:30–22:00).</li>
                </ul>
              </div>
            </div>
          )}

          {/* TOPIC 4: PUBLISHING & EMBED LINKS */}
          {activeTopic === 'links' && (
            <div className="space-y-5">
              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Link className="w-4 h-4 text-emerald-400" /> Your Dedicated Booking URL
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Every venue has a direct public booking link:
                </p>
                <code className="text-xs font-mono px-3 py-1.5 bg-neutral-900 text-emerald-300 rounded-lg border border-white/10 block">
                  https://itsmybooking.co.uk/?venue=venue_uk_01
                </code>
                <p className="text-xs text-neutral-400 pt-1">
                  Publish this link on your official website (&ldquo;Book a Table&rdquo; button), Google Maps Business Profile, Facebook page, and Instagram bio.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Embedding on WordPress, Wix, Squarespace
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  To embed the widget directly onto any web page, copy the 1-line HTML iframe from <strong>Venue Settings</strong>:
                </p>
                <code className="text-xs font-mono px-3 py-1.5 bg-neutral-900 text-neutral-300 rounded-lg border border-white/10 block overflow-x-auto">
                  &lt;iframe src=&quot;https://itsmybooking.co.uk/?venue=venue_uk_01&quot; width=&quot;100%&quot; height=&quot;750&quot; frameborder=&quot;0&quot; style=&quot;border-radius: 16px;&quot;&gt;&lt;/iframe&gt;
                </code>
              </div>
            </div>
          )}

          {/* TOPIC 5: UK GDPR & COMPLIANCE */}
          {activeTopic === 'gdpr' && (
            <div className="space-y-5">
              <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Strict UK GDPR Compliance
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  <code>itsmybooking</code> is designed specifically for UK hospitality compliance:
                </p>
                <ul className="text-xs text-neutral-400 list-disc list-inside space-y-1.5 pl-1">
                  <li><strong>Zero Tracking Cookies:</strong> No persistent advertising or third-party marketing cookies.</li>
                  <li><strong>30-Day Retention Purge:</strong> Customer guest contact data is automatically eligible for purge 30 days post-dining.</li>
                  <li><strong>Unchecked Marketing Opt-In:</strong> Marketing consent is strictly opt-in and never pre-ticked.</li>
                  <li><strong>WCAG 2.1 AAA Contrast:</strong> All operator and guest interfaces exceed $7:1$ contrast ratio for high-visibility terminal use.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <span>itsmybooking Operator Guide • itsmyapp.co.uk</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
}
