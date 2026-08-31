'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { GuestBookingWidget } from '@/components/GuestBookingWidget';
import { ServiceDashboard } from '@/components/ServiceDashboard';
import { VenueSettingsView } from '@/components/VenueSettingsView';
import { Footer } from '@/components/Footer';
import { ComplianceModal } from '@/components/ComplianceModal';
import { bookingService } from '@/lib/booking-service';
import { Booking, VenueSettings } from '@/types/booking';
import { DEFAULT_VENUE_SETTINGS } from '@/services/bookingMockService';
import { CheckCircle2, Utensils, LayoutDashboard, Settings as SettingsIcon, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<'guest' | 'dashboard' | 'settings'>('guest');
  const [venueSettings, setVenueSettings] = useState<VenueSettings>(DEFAULT_VENUE_SETTINGS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isComplianceOpen, setIsComplianceOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial settings and bookings
  const refreshData = useCallback(async () => {
    try {
      const settings = await bookingService.getVenueSettings();
      const allBookings = await bookingService.getBookings();
      setVenueSettings(settings);
      setBookings(allBookings);
    } catch (e) {
      console.error('Failed to load booking data:', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Show quick toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleBookingCreated = (newBooking: Booking) => {
    refreshData();
    showToast(`Reservation #${newBooking.id} confirmed for ${newBooking.customer.fullName}!`);
  };

  const handleSettingsUpdated = (newSettings: VenueSettings) => {
    setVenueSettings(newSettings);
    refreshData();
    showToast(`Updated venue profile: ${newSettings.venueName}`);
  };

  const handleResetDemo = () => {
    bookingService.resetDemoData();
    refreshData();
    showToast('Reset to initial realistic UK seed bookings & settings');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-emerald-500 selection:text-neutral-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-neutral-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        onResetDemo={handleResetDemo}
        onOpenCompliance={() => setIsComplianceOpen(true)}
        venueSettings={venueSettings}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Banner Overview */}
        <div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-neutral-300 border border-white/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> High-Contrast UK Hospitality Module
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Reserve. Pace. Seat.
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 mt-2">
            100% Client-Side Next.js • Firebase Client SDK • UK GDPR 30-Day Purge Retention • Zero Tracking Cookies
          </p>

          {/* Quick 3-Way Mode Toggle */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('guest')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'guest'
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/50 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" /> 1. Guest Booking
            </button>
            <span className="text-neutral-700 hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/50 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> 2. Operator FOH Live
            </button>
            <span className="text-neutral-700 hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => setActiveView('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'settings'
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/50 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" /> 3. Venue Settings
            </button>
          </div>
        </div>

        {/* View Switcher Container */}
        {activeView === 'guest' && (
          <div className="transition-all duration-200">
            <GuestBookingWidget
              venueSettings={venueSettings}
              onBookingCreated={handleBookingCreated}
            />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="transition-all duration-200">
            <ServiceDashboard
              initialBookings={bookings}
              venueSettings={venueSettings}
              onSettingsUpdated={handleSettingsUpdated}
              onBookingsUpdated={refreshData}
            />
          </div>
        )}

        {activeView === 'settings' && (
          <div className="transition-all duration-200">
            <VenueSettingsView
              initialSettings={venueSettings}
              onSettingsSaved={handleSettingsUpdated}
            />
          </div>
        )}
      </main>

      {/* Compliance Modal */}
      <ComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
