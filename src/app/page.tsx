'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { GuestBookingWidget } from '@/components/GuestBookingWidget';
import { ServiceDashboard } from '@/components/ServiceDashboard';
import { Footer } from '@/components/Footer';
import { ComplianceModal } from '@/components/ComplianceModal';
import { bookingService } from '@/lib/booking-service';
import { Booking, VenueSettings } from '@/types/booking';
import { DEFAULT_VENUE_SETTINGS } from '@/services/bookingMockService';
import { CheckCircle2, Utensils, LayoutDashboard, Shield, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<'guest' | 'dashboard'>('guest');
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
    showToast(newSettings.isOnlineBookingEnabled ? 'Online bookings enabled' : 'Online bookings paused');
  };

  const handleResetDemo = () => {
    bookingService.resetDemoData();
    refreshData();
    showToast('Reset to initial realistic UK seed bookings');
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
        isOnlineBookingEnabled={venueSettings.isOnlineBookingEnabled}
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

          {/* Quick Toggle pill for testing */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('guest')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'guest'
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/50'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" /> 1. Guest Booking Flow
            </button>
            <span className="text-neutral-600">•</span>
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/50'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> 2. Operator FOH Live Dashboard
            </button>
          </div>
        </div>

        {/* View Switcher Container */}
        {activeView === 'guest' ? (
          <div className="transition-all duration-200">
            <GuestBookingWidget
              venueSettings={venueSettings}
              onBookingCreated={handleBookingCreated}
            />
          </div>
        ) : (
          <div className="transition-all duration-200">
            <ServiceDashboard
              initialBookings={bookings}
              venueSettings={venueSettings}
              onSettingsUpdated={handleSettingsUpdated}
              onBookingsUpdated={refreshData}
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
