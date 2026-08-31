'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  Power, 
  Plus, 
  Check, 
  X, 
  UserCheck, 
  UserX, 
  Search, 
  Calendar as CalendarIcon, 
  Dog, 
  Baby, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  Ban, 
  Sparkles, 
  Phone, 
  Lock, 
  Unlock, 
  Layers, 
  AlertCircle,
  ArrowRight,
  PhoneCall,
  UserPlus,
  UtensilsCrossed,
  MapPin
} from 'lucide-react';
import { Booking, BookingStatus, VenueSettings, DayCapacitySummary, ShiftOverride } from '@/types/booking';
import { bookingService } from '@/lib/booking-service';
import { 
  getTodayUKFormatted, 
  addDaysUK, 
  parseUKDate, 
  formatUKDate, 
  formatDateToLongUK, 
  formatDateToDayName,
  isTodayUK 
} from '@/lib/date-utils';

interface ServiceDashboardProps {
  initialBookings: Booking[];
  venueSettings: VenueSettings;
  onSettingsUpdated: (newSettings: VenueSettings) => void;
  onBookingsUpdated: () => void;
}

export function ServiceDashboard({
  initialBookings,
  venueSettings,
  onSettingsUpdated,
  onBookingsUpdated
}: ServiceDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayUKFormatted());
  const [manualDateInput, setManualDateInput] = useState<string>(getTodayUKFormatted());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calendar View Mode (compact bar vs full month grid)
  const [showMonthGrid, setShowMonthGrid] = useState<boolean>(false);
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());

  // Modals
  const [isWalkInOpen, setIsWalkInOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isBlackoutModalOpen, setIsBlackoutModalOpen] = useState<boolean>(false);
  const [isFutureListOpen, setIsFutureListOpen] = useState<boolean>(false);

  // Blackout form state
  const [blackoutDate, setBlackoutDate] = useState<string>(selectedDate);
  const [blackoutShift, setBlackoutShift] = useState<'lunch' | 'dinner' | 'allDay'>('allDay');
  const [blackoutReason, setBlackoutReason] = useState<string>('Private Event / Maintenance');
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  // Walk-in form state
  const [walkInCovers, setWalkInCovers] = useState<number>(2);
  const [walkInService, setWalkInService] = useState<'lunch' | 'dinner'>('dinner');
  const [walkInTime, setWalkInTime] = useState<string>('18:00');
  const [walkInNotes, setWalkInNotes] = useState<string>('');

  // Staff Phone / Advanced Booking state
  const [isStaffBookingModalOpen, setIsStaffBookingModalOpen] = useState<boolean>(false);
  const [staffBookingDate, setStaffBookingDate] = useState<string>(selectedDate);
  const [staffBookingTime, setStaffBookingTime] = useState<string>('19:00');
  const [staffBookingService, setStaffBookingService] = useState<'lunch' | 'dinner'>('dinner');
  const [staffBookingCovers, setStaffBookingCovers] = useState<number>(2);
  const [staffGuestName, setStaffGuestName] = useState<string>('');
  const [staffGuestPhone, setStaffGuestPhone] = useState<string>('');
  const [staffGuestEmail, setStaffGuestEmail] = useState<string>('');
  const [staffTableArea, setStaffTableArea] = useState<string>('Main Dining');
  const [staffDietaryNotes, setStaffDietaryNotes] = useState<string>('');
  const [staffIsDogFriendly, setStaffIsDogFriendly] = useState<boolean>(false);
  const [staffIsHighchair, setStaffIsHighchair] = useState<boolean>(false);
  const [staffStatus, setStaffStatus] = useState<BookingStatus>('confirmed');

  // Pacing settings editor state
  const [editedPaceCap, setEditedPaceCap] = useState<number>(venueSettings.maxCoversPer15Mins);
  const [editedLunchCap, setEditedLunchCap] = useState<number>(venueSettings.maxCoversPerShift.lunch);
  const [editedDinnerCap, setEditedDinnerCap] = useState<number>(venueSettings.maxCoversPerShift.dinner);

  // Active date override info
  const currentOverride: ShiftOverride | undefined = venueSettings.shiftOverrides?.[selectedDate];
  const isAllDayClosed = !!currentOverride?.allDayClosed;
  const isLunchClosed = isAllDayClosed || !!currentOverride?.lunchClosed;
  const isDinnerClosed = isAllDayClosed || !!currentOverride?.dinnerClosed;

  // Filter bookings for selected date & criteria
  const dayBookings = useMemo(() => {
    return initialBookings.filter((b) => b.date === selectedDate);
  }, [initialBookings, selectedDate]);

  const filteredBookings = useMemo(() => {
    return dayBookings
      .filter((b) => {
        if (statusFilter !== 'all' && b.status !== statusFilter) return false;
        if (serviceFilter !== 'all' && b.service !== serviceFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = b.customer.fullName.toLowerCase().includes(q);
          const matchesId = b.id.toLowerCase().includes(q);
          const matchesPhone = b.customer.phone.toLowerCase().includes(q);
          return matchesName || matchesId || matchesPhone;
        }
        return true;
      })
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [dayBookings, statusFilter, serviceFilter, searchQuery]);

  // Live Metrics
  const metrics: DayCapacitySummary = useMemo(() => {
    return bookingService.getDayMetrics(selectedDate);
  }, [selectedDate, initialBookings, venueSettings]);

  // Quick navigation dates
  const quickDatePills = useMemo(() => {
    const today = getTodayUKFormatted();
    const tomorrow = addDaysUK(today, 1);
    const day3 = addDaysUK(today, 2);
    const day4 = addDaysUK(today, 3);
    const day5 = addDaysUK(today, 4);

    return [
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: tomorrow },
      { label: formatDateToDayName(day3), date: day3 },
      { label: formatDateToDayName(day4), date: day4 },
      { label: formatDateToDayName(day5), date: day5 }
    ];
  }, []);

  // Compute days for the month grid
  const monthGridDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const startingDayIndex = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days: { dateUK: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Leading blanks
    for (let i = 0; i < startingDayIndex; i++) {
      days.push({ dateUK: '', dayNumber: 0, isCurrentMonth: false });
    }

    // Month days
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(calendarYear, calendarMonth, d);
      days.push({
        dateUK: formatUKDate(dateObj),
        dayNumber: d,
        isCurrentMonth: true
      });
    }

    return days;
  }, [calendarYear, calendarMonth]);

  // Future blackouts list
  const futureBlackouts = useMemo(() => {
    const overrides = venueSettings.shiftOverrides || {};
    return Object.entries(overrides)
      .filter(([_, ov]) => ov.lunchClosed || ov.dinnerClosed || ov.allDayClosed)
      .map(([date, ov]) => ({ date, ...ov }));
  }, [venueSettings.shiftOverrides]);

  // Show notice banner
  const triggerNotice = (msg: string) => {
    setConfirmationNotice(msg);
    setTimeout(() => {
      setConfirmationNotice(null);
    }, 5000);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setManualDateInput(date);
  };

  const handleManualDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualDateInput.trim()) {
      handleSelectDate(manualDateInput.trim());
    }
  };

  // Handle Master Kill Switch
  const toggleMasterKillSwitch = async () => {
    const nextState = !venueSettings.isOnlineBookingEnabled;
    const updated = await bookingService.updateVenueSettings({
      isOnlineBookingEnabled: nextState
    });
    onSettingsUpdated(updated);
    triggerNotice(nextState ? 'Master Switch: Online bookings enabled' : 'Master Switch: All online bookings paused');
  };

  // Handle Shift Blackout Toggle
  const handleToggleShiftClosure = async (shift: 'lunch' | 'dinner' | 'allDay', isClosed: boolean, reason?: string) => {
    const updated = await bookingService.toggleShiftOverride(
      selectedDate,
      shift,
      isClosed,
      reason || 'Service closed by FOH Manager'
    );
    onSettingsUpdated(updated);
    triggerNotice(
      isClosed 
        ? `⛔ ${shift.toUpperCase()} closed for ${selectedDate} (Online bookings blocked)` 
        : `✅ ${shift.toUpperCase()} re-opened for ${selectedDate}`
    );
  };

  // Handle Submit Custom Blackout Modal
  const handleConfirmCustomBlackout = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetDate = blackoutDate.trim() || selectedDate;
    
    const updated = await bookingService.toggleShiftOverride(
      targetDate,
      blackoutShift,
      true,
      blackoutReason.trim() || 'Service closed by FOH Manager'
    );
    
    onSettingsUpdated(updated);
    handleSelectDate(targetDate);
    setIsBlackoutModalOpen(false);
    
    triggerNotice(
      `⛔ Confirmed: ${blackoutShift === 'allDay' ? 'All Day' : blackoutShift.toUpperCase()} closed on ${targetDate}. Reason: "${blackoutReason}"`
    );
  };

  // Handle Re-opening a closed shift
  const handleReopenShift = async (dateUK: string, shift: 'lunch' | 'dinner' | 'allDay') => {
    const updated = await bookingService.toggleShiftOverride(dateUK, shift, false);
    onSettingsUpdated(updated);
    triggerNotice(`✅ Restored online bookings for ${dateUK}`);
  };

  // Handle Status Update
  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    await bookingService.updateBookingStatus(bookingId, newStatus);
    onBookingsUpdated();
  };

  // Handle Walk-In Submission
  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await bookingService.createWalkIn(walkInCovers, walkInService, walkInTime, walkInNotes, selectedDate);
    setIsWalkInOpen(false);
    setWalkInNotes('');
    onBookingsUpdated();
    triggerNotice(`Walk-in guest (${walkInCovers} covers) seated for ${selectedDate}`);
  };

  // Handle Staff / Phone Reservation Submission
  const handleCreateStaffBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffGuestName.trim()) {
      triggerNotice('⚠️ Guest Full Name is required');
      return;
    }

    const targetDate = staffBookingDate.trim() || selectedDate;
    const phoneVal = staffGuestPhone.trim() || '+44 7000 000000';

    const specialDetails = [
      staffDietaryNotes.trim() ? `Dietary: ${staffDietaryNotes.trim()}` : '',
      staffTableArea ? `Table: ${staffTableArea}` : ''
    ].filter(Boolean).join(' • ');

    const newBooking = await bookingService.createBooking({
      uid: 'user_foh_staff',
      venueId: 'venue_uk_01',
      date: targetDate,
      timeSlot: staffBookingTime,
      covers: Number(staffBookingCovers),
      service: staffBookingService,
      customer: {
        fullName: staffGuestName.trim(),
        email: staffGuestEmail.trim() || 'phone-booking@venue.local',
        phone: phoneVal,
        dietaryRequirements: specialDetails || undefined,
        isDogFriendlyRequested: staffIsDogFriendly,
        isHighchairRequested: staffIsHighchair
      },
      status: staffStatus,
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: false,
        timestamp: new Date().toISOString()
      }
    });

    setIsStaffBookingModalOpen(false);
    // Reset form
    setStaffGuestName('');
    setStaffGuestPhone('');
    setStaffGuestEmail('');
    setStaffDietaryNotes('');
    setStaffIsDogFriendly(false);
    setStaffIsHighchair(false);

    handleSelectDate(targetDate);
    onBookingsUpdated();
    triggerNotice(`✅ Staff Reservation #${newBooking.id} created for ${staffGuestName} (${staffBookingCovers} covers) on ${targetDate}`);
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await bookingService.updateVenueSettings({
      maxCoversPer15Mins: Number(editedPaceCap),
      maxCoversPerShift: {
        lunch: Number(editedLunchCap),
        dinner: Number(editedDinnerCap)
      }
    });
    onSettingsUpdated(updated);
    setIsSettingsOpen(false);
    triggerNotice('Updated kitchen pacing and shift caps');
  };

  // Helper for Status Badge
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'seated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
            <UserCheck className="w-3 h-3" /> Seated
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-700">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'no-show':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-700">
            <UserX className="w-3 h-3" /> No-Show
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-950 text-red-400 border border-red-800">
            <X className="w-3 h-3" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Visual Confirmation Toast Banner */}
      {confirmationNotice && (
        <div className="p-4 bg-neutral-900 border-2 border-emerald-500 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-sm text-white animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{confirmationNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setConfirmationNotice(null)}
            className="p-1 text-neutral-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP BAR: Calendar Date Navigator & Master Controls */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
          {/* Active Date Title & Prev/Next Navigator */}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                Front of House Service Console
              </span>
              {isTodayUK(selectedDate) && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-neutral-950">
                  TODAY
                </span>
              )}
              {isAllDayClosed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                  ALL DAY SHUT
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => handleSelectDate(addDaysUK(selectedDate, -1))}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg border border-white/10 transition cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {formatDateToLongUK(selectedDate)}
              </h2>

              <button
                type="button"
                onClick={() => handleSelectDate(addDaysUK(selectedDate, 1))}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg border border-white/10 transition cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Direct Date Input */}
              <form onSubmit={handleManualDateSubmit} className="flex items-center gap-1.5 ml-2">
                <input
                  type="text"
                  value={manualDateInput}
                  onChange={(e) => setManualDateInput(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-28 min-h-[36px] px-2.5 py-1 bg-neutral-950 border border-white/20 rounded-lg text-xs font-mono text-white text-center focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="min-h-[36px] px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-lg border border-white/10 transition cursor-pointer"
                >
                  Go
                </button>
              </form>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Month Calendar Button */}
            <button
              type="button"
              onClick={() => setShowMonthGrid(!showMonthGrid)}
              className={`min-h-[42px] px-3.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border cursor-pointer ${
                showMonthGrid
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md'
                  : 'bg-neutral-800 text-neutral-200 border-white/10 hover:bg-neutral-750'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>{showMonthGrid ? 'Hide Calendar' : 'Month Calendar'}</span>
            </button>

            {/* Take Phone / Staff Table Reservation Button */}
            <button
              type="button"
              onClick={() => {
                setStaffBookingDate(selectedDate);
                setIsStaffBookingModalOpen(true);
              }}
              className="min-h-[42px] px-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
              title="Take telephone or in-person advance reservation"
            >
              <PhoneCall className="w-4 h-4 text-neutral-950" /> + Take Phone / Table Booking
            </button>

            {/* Fast Walk-In Button */}
            <button
              type="button"
              onClick={() => setIsWalkInOpen(true)}
              className="min-h-[42px] px-3.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-bold rounded-xl text-xs border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Fast Walk-In
            </button>

            {/* Shift Blackout Creator */}
            <button
              type="button"
              onClick={() => {
                setBlackoutDate(selectedDate);
                setIsBlackoutModalOpen(true);
              }}
              className="min-h-[42px] px-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Shut down a shift or entire day in the future"
            >
              <Ban className="w-4 h-4 text-neutral-950" /> Shut Down Service
            </button>

            {/* Future Blackouts List Trigger */}
            {futureBlackouts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsFutureListOpen(true)}
                className="min-h-[42px] px-3 bg-neutral-800 hover:bg-neutral-750 text-red-300 font-semibold rounded-xl text-xs border border-red-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-red-400" /> {futureBlackouts.length} Closed
              </button>
            )}

            {/* Master Kill Switch */}
            <button
              type="button"
              onClick={toggleMasterKillSwitch}
              className={`min-h-[42px] px-3.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border cursor-pointer ${
                venueSettings.isOnlineBookingEnabled
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                  : 'bg-red-950 text-red-300 border-red-600 hover:bg-red-900 animate-pulse'
              }`}
            >
              <Power className="w-4 h-4" />
              {venueSettings.isOnlineBookingEnabled ? 'System: ACTIVE' : 'System: PAUSED'}
            </button>
          </div>
        </div>

        {/* Quick Date Selectors Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-neutral-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" /> Quick Jump:
          </span>
          {quickDatePills.map(({ label, date }) => {
            const isSelected = selectedDate === date;
            const dayCount = initialBookings.filter((b) => b.date === date && b.status !== 'cancelled').reduce((s, b) => s + b.covers, 0);
            const override = venueSettings.shiftOverrides?.[date];
            const isShut = override?.allDayClosed || override?.lunchClosed || override?.dinnerClosed;

            return (
              <button
                key={date}
                type="button"
                onClick={() => handleSelectDate(date)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold shadow-md'
                    : isShut
                    ? 'bg-red-950/50 text-red-200 border-red-800/60 hover:bg-red-900'
                    : 'bg-neutral-950 text-neutral-300 border-white/10 hover:bg-neutral-800'
                }`}
              >
                <span>{label}</span>
                {isShut ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold">
                    SHUT
                  </span>
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-neutral-950 text-emerald-400 font-bold' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {dayCount} cov
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* EXPANDABLE MONTH CALENDAR GRID */}
        {showMonthGrid && (
          <div className="p-5 bg-neutral-950 rounded-2xl border border-white/15 space-y-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-emerald-400" /> Multi-Day Master Calendar
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Click any day to view covers, manage reservations, or shut down shifts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 0) {
                      setCalendarMonth(11);
                      setCalendarYear(calendarYear - 1);
                    } else {
                      setCalendarMonth(calendarMonth - 1);
                    }
                  }}
                  className="p-1.5 text-neutral-300 hover:text-white rounded-lg bg-neutral-900 border border-white/10 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-white px-2">
                  {new Date(calendarYear, calendarMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 11) {
                      setCalendarMonth(0);
                      setCalendarYear(calendarYear + 1);
                    } else {
                      setCalendarMonth(calendarMonth + 1);
                    }
                  }}
                  className="p-1.5 text-neutral-300 hover:text-white rounded-lg bg-neutral-900 border border-white/10 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-neutral-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthGridDays.map((d, index) => {
                if (!d.isCurrentMonth) {
                  return <div key={index} className="min-h-[58px] rounded-xl bg-neutral-900/10 border border-transparent" />;
                }

                const isSelected = selectedDate === d.dateUK;
                const isToday = isTodayUK(d.dateUK);
                const dayBookingsCount = initialBookings
                  .filter((b) => b.date === d.dateUK && b.status !== 'cancelled')
                  .reduce((sum, b) => sum + b.covers, 0);

                const override = venueSettings.shiftOverrides?.[d.dateUK];
                const isAllShut = !!override?.allDayClosed;
                const isLunchShut = !isAllShut && !!override?.lunchClosed;
                const isDinnerShut = !isAllShut && !!override?.dinnerClosed;
                const hasClosure = isAllShut || isLunchShut || isDinnerShut;

                return (
                  <button
                    key={d.dateUK}
                    type="button"
                    onClick={() => handleSelectDate(d.dateUK)}
                    className={`min-h-[58px] p-2 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-lg font-bold scale-[1.02]'
                        : isAllShut
                        ? 'bg-red-950/80 text-red-100 border-red-600 hover:bg-red-900'
                        : hasClosure
                        ? 'bg-amber-950/60 text-amber-200 border-amber-600/70 hover:bg-amber-900'
                        : isToday
                        ? 'bg-neutral-800 text-white border-emerald-500/70'
                        : 'bg-neutral-900 text-neutral-300 border-white/10 hover:bg-neutral-800 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black">{d.dayNumber}</span>
                      {hasClosure && (
                        <span className={`px-1 rounded text-[9px] font-black ${isSelected ? 'bg-neutral-950 text-red-400' : 'bg-red-600 text-white'}`}>
                          {isAllShut ? 'SHUT' : isLunchShut ? 'NO LUNCH' : 'NO DINNER'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] truncate">
                      {isAllShut ? (
                        <span className={isSelected ? 'text-neutral-950 font-black' : 'text-red-300 font-bold'}>
                          Closed ({override?.reason || 'Event'})
                        </span>
                      ) : dayBookingsCount > 0 ? (
                        <span className={isSelected ? 'text-neutral-950 font-black' : 'text-emerald-400 font-bold'}>
                          {dayBookingsCount} covers
                        </span>
                      ) : (
                        <span className="text-neutral-500">0 covers</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SHIFT STATUS & ONLINE BOOKING KILL SWITCHES FOR SELECTED DATE */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isAllDayClosed 
            ? 'bg-red-950/70 border-red-600' 
            : 'bg-neutral-950 border-white/10'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isAllDayClosed ? 'bg-red-900 border-red-500 text-white' : 'bg-neutral-900 border-white/10 text-amber-400'
            }`}>
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  Service Online Controls for {selectedDate}
                </span>
                {isAllDayClosed ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white">
                    ALL DAY CLOSED
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400">
                    ({formatDateToDayName(selectedDate)})
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                {currentOverride?.reason ? (
                  <span className="text-red-300 font-semibold">Closure Reason: &ldquo;{currentOverride.reason}&rdquo;</span>
                ) : (
                  'Toggle online reservations open or shut for this date instantly.'
                )}
              </p>
            </div>
          </div>

          {/* Granular Shift Kill Switches */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Lunch Toggle */}
            <div className="flex items-center gap-2 p-2 bg-neutral-900 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-amber-400">Lunch:</span>
              <button
                type="button"
                onClick={() => handleToggleShiftClosure('lunch', !isLunchClosed)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isLunchClosed
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-emerald-600 text-neutral-950'
                }`}
              >
                {isLunchClosed ? (
                  <>
                    <Lock className="w-3.5 h-3.5" /> SHUT
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" /> OPEN
                  </>
                )}
              </button>
            </div>

            {/* Dinner Toggle */}
            <div className="flex items-center gap-2 p-2 bg-neutral-900 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-sky-400">Dinner:</span>
              <button
                type="button"
                onClick={() => handleToggleShiftClosure('dinner', !isDinnerClosed)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isDinnerClosed
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-emerald-600 text-neutral-950'
                }`}
              >
                {isDinnerClosed ? (
                  <>
                    <Lock className="w-3.5 h-3.5" /> SHUT
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" /> OPEN
                  </>
                )}
              </button>
            </div>

            {/* All Day Shut Toggle */}
            <button
              type="button"
              onClick={() => handleToggleShiftClosure('allDay', !isAllDayClosed)}
              className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                isAllDayClosed
                  ? 'bg-emerald-600 text-neutral-950 border-emerald-400'
                  : 'bg-red-950 text-red-300 border-red-700 hover:bg-red-900'
              }`}
            >
              {isAllDayClosed ? (
                <>
                  <Unlock className="w-3.5 h-3.5" /> Re-Open All Day
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" /> Shut All Day
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Metrics Cards for Selected Date */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-neutral-950 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Total Booked</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.totalBookedCovers}</div>
            <div className="text-[11px] text-neutral-500 mt-1">Covers for {selectedDate}</div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Seated Covers</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{metrics.seatedCovers}</div>
            <div className="text-[11px] text-neutral-500 mt-1">Currently in dining room</div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Remaining Lunch</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className={`text-2xl font-black ${isLunchClosed ? 'text-red-400' : 'text-amber-400'}`}>
              {isLunchClosed ? 'SHUT' : `${metrics.remainingLunchCapacity}`}
              {!isLunchClosed && (
                <span className="text-xs text-neutral-500 font-normal"> / {venueSettings.maxCoversPerShift.lunch} max</span>
              )}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              {isLunchClosed ? 'Online booking closed' : '12:00 - 15:00 Service'}
            </div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Remaining Dinner</span>
              <Flame className="w-4 h-4 text-sky-400" />
            </div>
            <div className={`text-2xl font-black ${isDinnerClosed ? 'text-red-400' : 'text-sky-400'}`}>
              {isDinnerClosed ? 'SHUT' : `${metrics.remainingDinnerCapacity}`}
              {!isDinnerClosed && (
                <span className="text-xs text-neutral-500 font-normal"> / {venueSettings.maxCoversPerShift.dinner} max</span>
              )}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              {isDinnerClosed ? 'Online booking closed' : '17:30 - 22:00 Service'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest, ID, phone..."
            className="w-full min-h-[42px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['all', 'confirmed', 'seated', 'pending', 'cancelled', 'no-show'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg capitalize border transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-neutral-100 text-neutral-950 border-white font-bold'
                  : 'bg-neutral-800 text-neutral-300 border-white/10 hover:bg-neutral-750'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE SHEET / RESERVATIONS REGISTER FOR ACTIVE DATE */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              Reservations for {selectedDate} ({filteredBookings.length})
            </h3>
          </div>
          <span className="text-xs text-neutral-400">Pacing: Max {venueSettings.maxCoversPer15Mins} covers/15m</span>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <AlertTriangle className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
            <p className="text-sm font-semibold text-neutral-300">No reservations found for {selectedDate}</p>
            <p className="text-xs text-neutral-500 mt-1">Use the Walk-In button above to seat guests on the fly or select another date.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 hover:bg-neutral-850/50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Time, Covers & Guest Info */}
                <div className="flex items-start gap-4">
                  <div className="min-w-[64px] text-center p-2 bg-neutral-950 rounded-xl border border-white/10">
                    <span className="text-base font-black text-white block">{b.timeSlot}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">{b.service}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-bold text-white">{b.customer.fullName}</span>
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-xs font-semibold text-neutral-200 border border-white/10">
                        {b.covers} {b.covers === 1 ? 'Cover' : 'Covers'}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">{b.id}</span>
                      {getStatusBadge(b.status)}
                    </div>

                    {/* Contact & Special Requests Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-300">
                      <a href={`tel:${b.customer.phone}`} className="hover:text-emerald-400 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-neutral-400" /> {b.customer.phone}
                      </a>

                      {b.customer.isDogFriendlyRequested && (
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/80 rounded text-[11px] font-semibold flex items-center gap-1">
                          <Dog className="w-3 h-3" /> Dog Friendly
                        </span>
                      )}

                      {b.customer.isHighchairRequested && (
                        <span className="px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800/80 rounded text-[11px] font-semibold flex items-center gap-1">
                          <Baby className="w-3 h-3" /> Highchair
                        </span>
                      )}

                      {b.customer.dietaryRequirements && (
                        <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800/80 rounded text-[11px] font-semibold">
                          ⚠️ {b.customer.dietaryRequirements}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Touch Actions */}
                <div className="flex flex-wrap items-center gap-1.5 self-end lg:self-center">
                  {b.status !== 'seated' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b.id, 'seated')}
                      className="min-h-[38px] px-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Seat party at table"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Seat Table
                    </button>
                  )}

                  {b.status !== 'confirmed' && b.status !== 'seated' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b.id, 'confirmed')}
                      className="min-h-[38px] px-3 bg-neutral-800 hover:bg-neutral-700 text-blue-300 font-semibold rounded-lg text-xs border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm
                    </button>
                  )}

                  {b.status !== 'no-show' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b.id, 'no-show')}
                      className="min-h-[38px] px-2.5 bg-neutral-800 hover:bg-purple-950 text-purple-300 font-semibold rounded-lg text-xs border border-white/10 transition flex items-center gap-1 cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" /> No-Show
                    </button>
                  )}

                  {b.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                      className="min-h-[38px] px-2.5 bg-neutral-800 hover:bg-red-950 text-red-400 font-semibold rounded-lg text-xs border border-white/10 transition flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SHUT SHIFT / CUSTOM BLACKOUT MODAL WITH DIRECT DATE PICKER */}
      {isBlackoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Shut Down Online Bookings</h3>
                <p className="text-xs text-neutral-400">Block online reservations for any specific date & shift</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBlackoutModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCustomBlackout} className="space-y-4">
              {/* Target Date Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Target Date (UK DD/MM/YYYY) *
                </label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={blackoutDate}
                    onChange={(e) => setBlackoutDate(e.target.value)}
                    placeholder="e.g. 05/09/2026"
                    className="w-full min-h-[44px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-sm font-mono text-white focus:border-amber-400"
                  />
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setBlackoutDate(getTodayUKFormatted())}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 rounded"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlackoutDate(addDaysUK(getTodayUKFormatted(), 1))}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 rounded"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlackoutDate('05/09/2026')}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-[11px] text-emerald-400 font-mono rounded"
                  >
                    05/09/2026
                  </button>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Service to Shut Down
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'allDay', label: 'All Day' },
                    { id: 'lunch', label: 'Lunch Only' },
                    { id: 'dinner', label: 'Dinner Only' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBlackoutShift(opt.id as any)}
                      className={`min-h-[44px] rounded-xl text-xs font-bold border transition cursor-pointer ${
                        blackoutShift === opt.id
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 font-black shadow-md'
                          : 'bg-neutral-950 text-neutral-300 border-white/10 hover:bg-neutral-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Reason for Closure
                </label>
                <input
                  type="text"
                  required
                  value={blackoutReason}
                  onChange={(e) => setBlackoutReason(e.target.value)}
                  placeholder="e.g. Private Wedding, Deep Cleaning..."
                  className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white focus:border-amber-400"
                />
              </div>

              <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <p className="font-semibold text-amber-100 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Immediate Guest Widget Blocking
                </p>
                <p>
                  Online reservations on <strong>{blackoutDate || selectedDate}</strong> will be locked immediately and the calendar will display a red &ldquo;SHUT&rdquo; badge.
                </p>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-red-950/50"
              >
                Confirm & Shut Down {blackoutShift === 'allDay' ? 'All Day' : blackoutShift.toUpperCase()} for {blackoutDate}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FUTURE BLACKOUTS MANAGER DRAWER */}
      {isFutureListOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Scheduled Future Shift Closures</h3>
                <p className="text-xs text-neutral-400">Manage all closed dates & reopen at will</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFutureListOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {futureBlackouts.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-6">No future closures currently active.</p>
              ) : (
                futureBlackouts.map((bo) => (
                  <div key={bo.date} className="p-4 bg-neutral-950 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{bo.date}</span>
                        <span className="text-xs text-neutral-400">({formatDateToDayName(bo.date)})</span>
                      </div>
                      <p className="text-xs text-red-400 mt-0.5">
                        {bo.allDayClosed ? 'All Day Closed' : bo.lunchClosed && bo.dinnerClosed ? 'Lunch & Dinner Closed' : bo.lunchClosed ? 'Lunch Closed' : 'Dinner Closed'}
                        {bo.reason ? ` • ${bo.reason}` : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReopenShift(bo.date, 'allDay')}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-emerald-950 hover:text-emerald-300 text-neutral-200 text-xs font-bold rounded-lg border border-white/10 transition cursor-pointer"
                    >
                      Re-Open
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN QUICK ADD MODAL */}
      {isWalkInOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Fast Walk-In for {selectedDate}</h3>
                <p className="text-xs text-neutral-400">Instantly seat walk-in guests on active date</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWalkInOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Tap 1: Party Size (Covers)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setWalkInCovers(c)}
                      className={`min-h-[44px] rounded-xl font-bold text-sm border transition cursor-pointer ${
                        walkInCovers === c
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-black'
                          : 'bg-neutral-800 text-neutral-200 border-white/10'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Service
                  </label>
                  <select
                    value={walkInService}
                    onChange={(e) => setWalkInService(e.target.value as 'lunch' | 'dinner')}
                    className="w-full min-h-[44px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white"
                  >
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Time Slot
                  </label>
                  <input
                    type="time"
                    value={walkInTime}
                    onChange={(e) => setWalkInTime(e.target.value)}
                    className="w-full min-h-[44px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Dietary / Table Notes (Optional)
                </label>
                <input
                  type="text"
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  placeholder="e.g. Table 4, highchair requested"
                  className="w-full min-h-[44px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[50px] bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <UserCheck className="w-4 h-4" /> Tap 3: Confirm & Seat Walk-In ({walkInCovers} covers)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STAFF PHONE & ADVANCE TABLE RESERVATION MODAL */}
      {isStaffBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Take Telephone / Staff Reservation
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Direct staff table booking (bypasses guest pacing caps)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStaffBookingModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaffBooking} className="space-y-4">
              {/* Row 1: Date & Time & Service */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Date (DD/MM/YYYY) *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={staffBookingDate}
                      onChange={(e) => setStaffBookingDate(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full min-h-[40px] pl-9 pr-3 bg-neutral-950 border border-white/15 rounded-xl text-xs font-mono text-white focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Service *
                  </label>
                  <select
                    value={staffBookingService}
                    onChange={(e) => {
                      const s = e.target.value as 'lunch' | 'dinner';
                      setStaffBookingService(s);
                      if (s === 'lunch' && Number(staffBookingTime.split(':')[0]) >= 16) {
                        setStaffBookingTime('12:30');
                      } else if (s === 'dinner' && Number(staffBookingTime.split(':')[0]) < 16) {
                        setStaffBookingTime('19:00');
                      }
                    }}
                    className="w-full min-h-[40px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white focus:border-emerald-400"
                  >
                    <option value="lunch">Lunch Service (12:00 - 15:00)</option>
                    <option value="dinner">Dinner Service (17:30 - 22:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Arrival Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={staffBookingTime}
                    onChange={(e) => setStaffBookingTime(e.target.value)}
                    className="w-full min-h-[40px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Row 2: Party Size (Covers) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-200">
                    Party Size (Covers) *
                  </label>
                  <span className="text-xs text-emerald-400 font-bold">
                    {staffBookingCovers} {staffBookingCovers === 1 ? 'Guest' : 'Guests'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setStaffBookingCovers(num)}
                      className={`min-h-[38px] px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        staffBookingCovers === num
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md'
                          : 'bg-neutral-950 text-neutral-300 border-white/10 hover:bg-neutral-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Guest Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Lead Guest Name *
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={staffGuestName}
                      onChange={(e) => setStaffGuestName(e.target.value)}
                      placeholder="e.g. Lord & Lady Hamilton"
                      className="w-full min-h-[40px] pl-9 pr-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    UK Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={staffGuestPhone}
                      onChange={(e) => setStaffGuestPhone(e.target.value)}
                      placeholder="07700 900123 or 01643 863288"
                      className="w-full min-h-[40px] pl-9 pr-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Table / Seating Area & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Seating Area / Table Allocation
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <select
                      value={staffTableArea}
                      onChange={(e) => setStaffTableArea(e.target.value)}
                      className="w-full min-h-[40px] pl-9 pr-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white focus:border-emerald-400"
                    >
                      <option value="Main Dining Room">Main Dining Room</option>
                      <option value="Snug / Fireplace Area">Snug / Fireplace Area</option>
                      <option value="Bar Area">Bar Area (High Tops)</option>
                      <option value="Garden & Terrace">Garden & Terrace</option>
                      <option value="Window Table">Window Table</option>
                      <option value="Private Dining">Private Dining Room</option>
                      <option value="Table 1">Table 1 (2 Covers)</option>
                      <option value="Table 2">Table 2 (4 Covers)</option>
                      <option value="Table 3">Table 3 (4 Covers)</option>
                      <option value="Table 4">Table 4 (6 Covers)</option>
                      <option value="Table 12">Table 12 (Large Booth)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Guest Email (Optional for confirmations)
                  </label>
                  <input
                    type="email"
                    value={staffGuestEmail}
                    onChange={(e) => setStaffGuestEmail(e.target.value)}
                    placeholder="guest@example.co.uk"
                    className="w-full min-h-[40px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Row 5: Dietary / Allergies / Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Dietary Requirements & Kitchen Notes
                </label>
                <input
                  type="text"
                  value={staffDietaryNotes}
                  onChange={(e) => setStaffDietaryNotes(e.target.value)}
                  placeholder="e.g. 1x Gluten Free, 1x Nut Allergy, VIP regular guest"
                  className="w-full min-h-[40px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:border-emerald-400"
                />
              </div>

              {/* Checkboxes: Dog Friendly / Highchair / Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={staffIsDogFriendly}
                      onChange={(e) => setStaffIsDogFriendly(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded border-neutral-700 bg-neutral-950"
                    />
                    <span className="flex items-center gap-1">
                      <Dog className="w-3.5 h-3.5 text-amber-400" /> Dog Friendly
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={staffIsHighchair}
                      onChange={(e) => setStaffIsHighchair(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded border-neutral-700 bg-neutral-950"
                    />
                    <span className="flex items-center gap-1">
                      <Baby className="w-3.5 h-3.5 text-sky-400" /> Highchair
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-semibold">Status:</span>
                  <select
                    value={staffStatus}
                    onChange={(e) => setStaffStatus(e.target.value as BookingStatus)}
                    className="min-h-[34px] px-2.5 bg-neutral-950 border border-white/15 rounded-lg text-xs font-bold text-emerald-400"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="seated">Seated Now</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full min-h-[50px] bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50 mt-3"
              >
                <Check className="w-5 h-5" /> Save Reservation & Place on Run Sheet ({staffBookingCovers} Covers)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
