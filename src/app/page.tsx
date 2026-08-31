'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { GuestBookingWidget } from '@/components/GuestBookingWidget';
import { ServiceDashboard } from '@/components/ServiceDashboard';
import { VenueReportsView } from '@/components/VenueReportsView';
import { VenueSettingsView } from '@/components/VenueSettingsView';
import { VenueAuthModal } from '@/components/VenueAuthModal';
import { Footer } from '@/components/Footer';
import { ComplianceModal } from '@/components/ComplianceModal';
import { bookingService } from '@/lib/booking-service';
import { authService, OperatorUser } from '@/lib/auth-service';
import { Booking, VenueSettings } from '@/types/booking';
import { DEFAULT_VENUE_SETTINGS } from '@/services/bookingMockService';
import { CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<'guest' | 'dashboard' | 'reports' | 'settings'>('guest');
  const [venueSettings, setVenueSettings] = useState<VenueSettings>(DEFAULT_VENUE_SETTINGS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [operatorUser, setOperatorUser] = useState<OperatorUser | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to auth session
  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setOperatorUser(user);
    });
    return () => unsubscribe();
  }, []);

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

  const handleViewChange = (view: 'guest' | 'dashboard' | 'reports' | 'settings') => {
    if ((view === 'dashboard' || view === 'reports' || view === 'settings') && !operatorUser) {
      setIsAuthOpen(true);
      return;
    }
    setActiveView(view);
  };

  const handleAuthenticated = (user: OperatorUser) => {
    setOperatorUser(user);
    showToast(`Signed in as ${user.email}`);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setActiveView('guest');
    showToast('Signed out of venue operator session');
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
        onViewChange={handleViewChange}
        onResetDemo={handleResetDemo}
        onOpenCompliance={() => setIsComplianceOpen(true)}
        onOpenLogin={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        venueSettings={venueSettings}
        operatorUser={operatorUser}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* View Switcher Container */}
        {activeView === 'guest' && (
          <div className="transition-all duration-200">
            <GuestBookingWidget
              venueSettings={venueSettings}
              onBookingCreated={handleBookingCreated}
            />
          </div>
        )}

        {activeView === 'dashboard' && operatorUser && (
          <div className="transition-all duration-200">
            <ServiceDashboard
              initialBookings={bookings}
              venueSettings={venueSettings}
              onSettingsUpdated={handleSettingsUpdated}
              onBookingsUpdated={refreshData}
            />
          </div>
        )}

        {activeView === 'reports' && operatorUser && (
          <div className="transition-all duration-200">
            <VenueReportsView
              bookings={bookings}
              venueSettings={venueSettings}
            />
          </div>
        )}

        {activeView === 'settings' && operatorUser && (
          <div className="transition-all duration-200">
            <VenueSettingsView
              initialSettings={venueSettings}
              onSettingsSaved={handleSettingsUpdated}
            />
          </div>
        )}
      </main>

      {/* Operator Authentication Modal */}
      <VenueAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

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
