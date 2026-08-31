'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Dog, 
  Baby, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  PhoneCall, 
  Utensils, 
  Sparkles,
  Printer,
  MapPin,
  RefreshCw,
  Building2
} from 'lucide-react';
import { Booking, VenueSettings, SlotAvailability } from '@/types/booking';
import { bookingService } from '@/lib/booking-service';
import { getTodayUKFormatted, formatUKDate, isPastUKDate, validateUKPhone } from '@/lib/date-utils';

interface GuestBookingWidgetProps {
  venueSettings: VenueSettings;
  onBookingCreated?: (booking: Booking) => void;
}

export function GuestBookingWidget({ venueSettings, onBookingCreated }: GuestBookingWidgetProps) {
  // Step state (1: Date & Covers, 2: Time Slot, 3: Details & Compliance, 4: Confirmation)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>(getTodayUKFormatted());
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<'lunch' | 'dinner'>('dinner');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'lunch' | 'dinner'>('all');

  // Customer & Special Requests
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dietaryRequirements, setDietaryRequirements] = useState<string>('');
  const [isDogFriendlyRequested, setIsDogFriendlyRequested] = useState<boolean>(false);
  const [isHighchairRequested, setIsHighchairRequested] = useState<boolean>(false);

  // Compliance (UK GDPR)
  const [dataProcessingAgreed, setDataProcessingAgreed] = useState<boolean>(false);
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(false);

  // UI / Error state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Quick dates calculation
  const quickDates = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextFriday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysUntilFri = (5 + 7 - dayOfWeek) % 7 || 7;
    nextFriday.setDate(today.getDate() + daysUntilFri);

    const nextSaturday = new Date(today);
    const daysUntilSat = (6 + 7 - dayOfWeek) % 7 || 7;
    nextSaturday.setDate(today.getDate() + daysUntilSat);

    return [
      { label: 'Today', value: formatUKDate(today) },
      { label: 'Tomorrow', value: formatUKDate(tomorrow) },
      { label: 'This Friday', value: formatUKDate(nextFriday) },
      { label: 'This Saturday', value: formatUKDate(nextSaturday) },
    ];
  }, []);

  // Compute available slots
  const availableSlots: SlotAvailability[] = useMemo(() => {
    if (!venueSettings.isOnlineBookingEnabled) return [];
    const filter = serviceFilter === 'all' ? undefined : serviceFilter;
    return bookingService.getAvailableSlots(selectedDate, partySize, filter);
  }, [selectedDate, partySize, serviceFilter, venueSettings.isOnlineBookingEnabled]);

  // Dietary suggestions chips
  const dietaryChips = ['Gluten-Free', 'Vegetarian', 'Vegan', 'Nut Allergy', 'Coeliac', 'Dairy-Free', 'Halal'];

  const handleAddDietaryChip = (chip: string) => {
    if (dietaryRequirements.includes(chip)) return;
    setDietaryRequirements((prev) => (prev ? `${prev}, ${chip}` : chip));
  };

  // Formatted address string
  const formattedAddress = useMemo(() => {
    const { line1, city, postalCode } = venueSettings.address;
    return `${line1}, ${city} ${postalCode}`;
  }, [venueSettings.address]);

  // Step 1 Validation & Navigation
  const handleProceedToStep2 = () => {
    const errors: Record<string, string> = {};
    if (!selectedDate) {
      errors.date = 'Please select a reservation date';
    } else if (isPastUKDate(selectedDate)) {
      errors.date = 'Past dates cannot be reserved';
    }

    if (partySize > 6) {
      errors.partySize = 'Online bookings are capped at 6 covers. Please call us directly.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setCurrentStep(2);
  };

  // Step 2 Validation & Navigation
  const handleSelectSlot = (slot: SlotAvailability) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot.timeSlot);
    setSelectedService(slot.service === 'drinks' ? 'dinner' : slot.service);
    setFormErrors((prev) => ({ ...prev, slot: '' }));
  };

  const handleProceedToStep3 = () => {
    if (!selectedSlot) {
      setFormErrors({ slot: 'Please choose an available 15-minute time slot' });
      return;
    }
    setFormErrors({});
    setCurrentStep(3);
  };

  // Step 3 Submission & Validation
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please provide a valid email address';
    }

    const phoneValidation = validateUKPhone(phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error || 'Invalid UK phone number';
    }

    if (!dataProcessingAgreed) {
      errors.compliance = 'UK GDPR data retention agreement is required to confirm reservation';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const newBooking = await bookingService.createBooking({
        uid: 'guest_session',
        venueId: venueSettings.venueId,
        date: selectedDate,
        timeSlot: selectedSlot!,
        covers: partySize,
        service: selectedService,
        customer: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phoneValidation.formatted,
          dietaryRequirements: dietaryRequirements.trim() || undefined,
          isDogFriendlyRequested,
          isHighchairRequested
        },
        complianceConsent: {
          dataProcessingAgreed: true,
          marketingOptIn,
          timestamp: new Date().toISOString()
        }
      });

      setCreatedBooking(newBooking);
      setCurrentStep(4);
      if (onBookingCreated) {
        onBookingCreated(newBooking);
      }
    } catch (err) {
      console.error(err);
      setFormErrors({ submit: 'Failed to process booking. Please try again or call us.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBookingForm = () => {
    setCurrentStep(1);
    setSelectedDate(getTodayUKFormatted());
    setPartySize(2);
    setSelectedSlot(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setDietaryRequirements('');
    setIsDogFriendlyRequested(false);
    setIsHighchairRequested(false);
    setDataProcessingAgreed(false);
    setMarketingOptIn(false);
    setCreatedBooking(null);
    setFormErrors({});
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
      {/* Header & Venue Branding Banner */}
      <div className="bg-neutral-950 p-5 sm:p-6 border-b border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {venueSettings.logoUrl ? (
              <img
                src={venueSettings.logoUrl}
                alt={venueSettings.venueName}
                className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                <Sparkles className="w-2.5 h-2.5" /> Instant Table Confirmation
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                {venueSettings.venueName || 'The Royal Oak Gastropub'}
              </h1>
              <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{formattedAddress}</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-neutral-400 block">Enquiries</span>
            <a 
              href={`tel:${venueSettings.phone || '+442079460991'}`} 
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline font-mono"
            >
              {venueSettings.phone || '+44 20 7946 0991'}
            </a>
          </div>
        </div>

        {/* Master Kill Switch Check */}
        {!venueSettings.isOnlineBookingEnabled && (
          <div className="mt-4 p-3.5 bg-red-950/60 border border-red-800/50 rounded-xl flex items-start gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold text-red-100">Online Bookings Temporarily Suspended</p>
              <p className="mt-0.5 text-red-300">
                The venue has temporarily paused automated reservations. Please call us directly at{' '}
                <a href={`tel:${venueSettings.phone}`} className="underline font-bold text-white">
                  {venueSettings.phone || '+44 20 7946 0991'}
                </a>{' '}
                to check real-time table availability.
              </p>
            </div>
          </div>
        )}

        {/* Step Progress Bar */}
        {venueSettings.isOnlineBookingEnabled && currentStep !== 4 && (
          <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
            <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 1 ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
            <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
            <div className={`h-1.5 rounded-full transition-colors ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
          </div>
        )}
      </div>

      {/* STEP 1: Date & Covers */}
      {currentStep === 1 && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Party Size Selector */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-neutral-200 mb-2.5">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Party Size (Guests)
              </span>
              <span className="text-xs text-neutral-400">1 to 6 covers online</span>
            </label>

            {/* Interactive Covers Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPartySize(num)}
                  className={`min-h-[48px] rounded-xl text-base font-bold transition-all flex items-center justify-center border cursor-pointer ${
                    partySize === num
                      ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-lg shadow-emerald-950/50 scale-[1.02]'
                      : 'bg-neutral-800 text-neutral-200 border-white/10 hover:bg-neutral-750 hover:border-white/20'
                  }`}
                  aria-label={`${num} ${num === 1 ? 'Guest' : 'Guests'}`}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPartySize(7)}
                className={`min-h-[48px] rounded-xl text-sm font-bold transition-all flex items-center justify-center border col-span-2 sm:col-span-1 cursor-pointer ${
                  partySize >= 7
                    ? 'bg-amber-500 text-neutral-950 border-amber-400'
                    : 'bg-neutral-800 text-amber-300 border-amber-500/30 hover:bg-neutral-750'
                }`}
              >
                7+
              </button>
            </div>

            {/* Large Group 7+ Call Banner */}
            {partySize >= 7 && (
              <div className="mt-3.5 p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-200">
                  <p className="font-semibold text-amber-100">Large Party Reservation (7+ Covers)</p>
                  <p className="mt-1 text-neutral-300">
                    For groups of 7 or more, we require bespoke seating orchestration. Please speak directly to our team on:
                  </p>
                  <a
                    href={`tel:${venueSettings.phone || '+442079460991'}`}
                    className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call {venueSettings.phone || '+44 20 7946 0991'}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Date Selector */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-neutral-200 mb-2.5">
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" /> Select Date (DD/MM/YYYY)
              </span>
              <span className="text-xs text-neutral-400">UK Format</span>
            </label>

            {/* Quick Pick Date Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {quickDates.map((qd) => (
                <button
                  key={qd.label}
                  type="button"
                  onClick={() => setSelectedDate(qd.value)}
                  className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl border transition flex flex-col items-center justify-center cursor-pointer ${
                    selectedDate === qd.value
                      ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold shadow-md'
                      : 'bg-neutral-800 text-neutral-300 border-white/10 hover:bg-neutral-750'
                  }`}
                >
                  <span>{qd.label}</span>
                  <span className="text-[10px] opacity-80">{qd.value}</span>
                </button>
              ))}
            </div>

            {/* Custom Date Input */}
            <div className="relative">
              <input
                type="text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full min-h-[48px] px-4 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-neutral-400">
                UK DD/MM/YYYY
              </span>
            </div>

            {formErrors.date && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {formErrors.date}
              </p>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            disabled={!venueSettings.isOnlineBookingEnabled || partySize >= 7}
            onClick={handleProceedToStep2}
            className="w-full min-h-[52px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            Find Available Tables <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 2: Time Slot & Kitchen Pacing */}
      {currentStep === 2 && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition py-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Date & Guests
            </button>
            <div className="text-right text-xs text-neutral-300">
              <span className="font-bold text-emerald-400">{partySize} {partySize === 1 ? 'Guest' : 'Guests'}</span> on <span className="font-bold text-white">{selectedDate}</span>
            </div>
          </div>

          {/* Service Filters */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> 15-Minute Service Intervals
              </span>
              <span className="text-xs text-neutral-400">Kitchen Paced (Max {venueSettings.maxCoversPer15Mins}/15m)</span>
            </div>

            <div className="flex gap-2">
              {(['all', 'lunch', 'dinner'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setServiceFilter(mode)}
                  className={`min-h-[40px] px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize border transition cursor-pointer ${
                    serviceFilter === mode
                      ? 'bg-neutral-100 text-neutral-950 border-white'
                      : 'bg-neutral-800 text-neutral-300 border-white/10 hover:bg-neutral-750'
                  }`}
                >
                  {mode === 'all' ? 'All Services' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Matrix */}
          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
            {availableSlots.length === 0 ? (
              <div className="p-6 text-center bg-neutral-950 rounded-xl border border-white/10">
                <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">No available time slots found</p>
                <p className="text-xs text-neutral-400 mt-1">
                  We are fully committed or online bookings are unavailable for this date and party size.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.timeSlot;
                  return (
                    <button
                      key={slot.timeSlot}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => handleSelectSlot(slot)}
                      className={`min-h-[50px] p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md font-bold'
                          : slot.isAvailable
                          ? 'bg-neutral-800 text-neutral-100 border-white/10 hover:border-emerald-500/60 hover:bg-neutral-750'
                          : 'bg-neutral-950/60 text-neutral-600 border-white/5 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="text-sm font-bold tracking-wide">{slot.timeSlot}</span>
                      <span className="text-[10px] mt-0.5 capitalize">
                        {slot.isAvailable ? (
                          <span className={isSelected ? 'text-neutral-950' : 'text-emerald-400'}>
                            {slot.service}
                          </span>
                        ) : (
                          <span className="text-red-400">Full</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {formErrors.slot && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {formErrors.slot}
            </p>
          )}

          {/* Action Button */}
          <button
            type="button"
            disabled={!selectedSlot}
            onClick={handleProceedToStep3}
            className="w-full min-h-[52px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            Confirm Time & Enter Details <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 3: Customer Details & Compliance */}
      {currentStep === 3 && (
        <form onSubmit={handleFinalSubmit} className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition py-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Change Time ({selectedSlot})
            </button>
            <div className="text-right text-xs text-neutral-300">
              <span className="font-bold text-white">{selectedDate} @ {selectedSlot}</span> ({partySize} covers)
            </div>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                Lead Guest Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full min-h-[46px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              {formErrors.fullName && (
                <p className="mt-1 text-xs text-red-400">{formErrors.fullName}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.co.uk"
                    className="w-full min-h-[46px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  UK Phone Number (+44 / 07) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07123 456789"
                    className="w-full min-h-[46px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Dietary Requirements */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                Dietary Requirements & Allergies (Optional)
              </label>
              <textarea
                rows={2}
                value={dietaryRequirements}
                onChange={(e) => setDietaryRequirements(e.target.value)}
                placeholder="e.g. 1x Coeliac, 1x Nut allergy..."
                className="w-full p-3 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {dietaryChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAddDietaryChip(chip)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md border border-white/10 transition cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requests (Dog Friendly / Highchair) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="min-h-[46px] flex items-center gap-3 p-3 bg-neutral-950 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition">
                <input
                  type="checkbox"
                  checked={isDogFriendlyRequested}
                  onChange={(e) => setIsDogFriendlyRequested(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded border-neutral-700 bg-neutral-900"
                />
                <span className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                  <Dog className="w-4 h-4 text-amber-400" /> Dog-Friendly Table
                </span>
              </label>

              <label className="min-h-[46px] flex items-center gap-3 p-3 bg-neutral-950 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition">
                <input
                  type="checkbox"
                  checked={isHighchairRequested}
                  onChange={(e) => setIsHighchairRequested(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded border-neutral-700 bg-neutral-900"
                />
                <span className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-sky-400" /> Highchair Required
                </span>
              </label>
            </div>

            {/* UK GDPR Compliance Section */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> UK GDPR & Compliance Consent
              </div>

              {/* Mandatory Data Agreement (30-day purge policy) */}
              <label className="flex items-start gap-3 p-3 bg-neutral-950 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition">
                <input
                  type="checkbox"
                  required
                  checked={dataProcessingAgreed}
                  onChange={(e) => setDataProcessingAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-emerald-500 rounded border-neutral-700 bg-neutral-900 shrink-0"
                />
                <div className="text-xs text-neutral-300">
                  <span className="font-semibold text-white">Reservation Data Retention Consent (Mandatory)</span>
                  <p className="mt-0.5 text-neutral-400 leading-relaxed">
                    I agree to the storage of my name, contact, and dietary details strictly for managing this table reservation under the venue&apos;s <strong>UK GDPR 30-day automated purge policy</strong>. Zero persistent tracking cookies used.
                  </p>
                </div>
              </label>

              {/* Independent Unchecked Marketing Opt-in */}
              <label className="flex items-start gap-3 p-3 bg-neutral-950 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-emerald-500 rounded border-neutral-700 bg-neutral-900 shrink-0"
                />
                <div className="text-xs text-neutral-300">
                  <span className="font-semibold text-white">Seasonal Kitchen & Menu Updates (Optional)</span>
                  <p className="mt-0.5 text-neutral-400 leading-relaxed">
                    Keep me informed regarding seasonal British culinary specials, guest chef evenings, and venue news. You can unsubscribe at any time in one tap.
                  </p>
                </div>
              </label>

              {formErrors.compliance && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.compliance}
                </p>
              )}
            </div>
          </div>

          {formErrors.submit && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl">
              {formErrors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !dataProcessingAgreed}
            className="w-full min-h-[52px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Securing Reservation...
              </>
            ) : (
              <>
                Confirm & Guarantee Reservation <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 4: Instant Confirmation & Ticket */}
      {currentStep === 4 && createdBooking && (
        <div className="p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Reservation Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              We Look Forward To Welcoming You
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              A confirmation summary has been logged for {createdBooking.customer.fullName}.
            </p>
          </div>

          {/* Confirmation Ticket Card */}
          <div className="p-5 bg-neutral-950 border border-white/15 rounded-2xl text-left space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[11px] text-neutral-400 block uppercase">Booking Reference</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{createdBooking.id}</span>
              </div>
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-semibold uppercase">
                {createdBooking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-400 block">Date</span>
                <span className="font-semibold text-white">{createdBooking.date}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Time & Service</span>
                <span className="font-semibold text-white">{createdBooking.timeSlot} ({createdBooking.service})</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Party Size</span>
                <span className="font-semibold text-white">{createdBooking.covers} Covers</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Lead Guest</span>
                <span className="font-semibold text-white">{createdBooking.customer.fullName}</span>
              </div>
            </div>

            {/* Special flags */}
            {(createdBooking.customer.isDogFriendlyRequested || createdBooking.customer.isHighchairRequested || createdBooking.customer.dietaryRequirements) && (
              <div className="pt-3 border-t border-white/10 space-y-1 text-xs">
                <span className="text-neutral-400 block font-medium">Special Requests:</span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {createdBooking.customer.isDogFriendlyRequested && (
                    <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-800/60 rounded">
                      🐾 Dog-Friendly Table
                    </span>
                  )}
                  {createdBooking.customer.isHighchairRequested && (
                    <span className="px-2 py-0.5 bg-sky-950/80 text-sky-300 border border-sky-800/60 rounded">
                      🪑 Highchair
                    </span>
                  )}
                  {createdBooking.customer.dietaryRequirements && (
                    <span className="px-2 py-0.5 bg-neutral-800 text-neutral-200 border border-white/10 rounded">
                      🍴 {createdBooking.customer.dietaryRequirements}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 min-h-[46px] bg-neutral-800 hover:bg-neutral-750 text-white font-semibold rounded-xl text-xs sm:text-sm border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save Confirmation
            </button>
            <button
              type="button"
              onClick={resetBookingForm}
              className="flex-1 min-h-[46px] bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Utensils className="w-4 h-4" /> Book Another Reservation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
