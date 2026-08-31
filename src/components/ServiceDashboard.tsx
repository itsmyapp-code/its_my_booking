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
  Filter, 
  Flame, 
  CheckCircle2, 
  RotateCcw,
  Sliders,
  Sparkles,
  Phone
} from 'lucide-react';
import { Booking, BookingStatus, VenueSettings, DayCapacitySummary } from '@/types/booking';
import { bookingService } from '@/lib/booking-service';
import { getTodayUKFormatted } from '@/lib/date-utils';

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isWalkInOpen, setIsWalkInOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Walk-in form state
  const [walkInCovers, setWalkInCovers] = useState<number>(2);
  const [walkInService, setWalkInService] = useState<'lunch' | 'dinner'>('dinner');
  const [walkInTime, setWalkInTime] = useState<string>('18:00');
  const [walkInNotes, setWalkInNotes] = useState<string>('');

  // Local settings editor
  const [editedPaceCap, setEditedPaceCap] = useState<number>(venueSettings.maxCoversPer15Mins);
  const [editedLunchCap, setEditedLunchCap] = useState<number>(venueSettings.maxCoversPerShift.lunch);
  const [editedDinnerCap, setEditedDinnerCap] = useState<number>(venueSettings.maxCoversPerShift.dinner);

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

  // Handle Master Kill Switch
  const toggleMasterKillSwitch = async () => {
    const nextState = !venueSettings.isOnlineBookingEnabled;
    const updated = await bookingService.updateVenueSettings({
      isOnlineBookingEnabled: nextState
    });
    onSettingsUpdated(updated);
  };

  // Handle Status Update
  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    await bookingService.updateBookingStatus(bookingId, newStatus);
    onBookingsUpdated();
  };

  // Handle Walk-In Submission
  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await bookingService.createWalkIn(walkInCovers, walkInService, walkInTime, walkInNotes);
    setIsWalkInOpen(false);
    setWalkInNotes('');
    onBookingsUpdated();
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
      {/* Top Bar: Live Metrics & Kill Switch */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-white/10">
                Front of House Live Operations
              </span>
              <span className="text-xs text-neutral-400">Date: {selectedDate}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              Live Service Control & Kitchen Pacing
            </h2>
          </div>

          {/* Quick Actions & Master Kill Switch */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Walk-In Quick Add Button */}
            <button
              type="button"
              onClick={() => setIsWalkInOpen(true)}
              className="min-h-[44px] px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Fast Walk-In Add
            </button>

            {/* Pacing Settings Config */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="min-h-[44px] px-3.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold rounded-xl text-xs sm:text-sm border border-white/10 transition flex items-center gap-2 cursor-pointer"
              title="Pacing & Capacity Settings"
            >
              <Sliders className="w-4 h-4 text-neutral-400" /> Caps
            </button>

            {/* Red / Green Master Kill Switch */}
            <button
              type="button"
              onClick={toggleMasterKillSwitch}
              className={`min-h-[44px] px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 border cursor-pointer ${
                venueSettings.isOnlineBookingEnabled
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                  : 'bg-red-950 text-red-300 border-red-600 hover:bg-red-900 animate-pulse'
              }`}
            >
              <Power className="w-4 h-4" />
              {venueSettings.isOnlineBookingEnabled ? 'Online Bookings: ACTIVE' : 'Online Bookings: PAUSED'}
            </button>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-5">
          <div className="bg-neutral-950 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Total Booked Covers</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.totalBookedCovers}</div>
            <div className="text-[11px] text-neutral-500 mt-1">Across all services today</div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Seated Covers</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{metrics.seatedCovers}</div>
            <div className="text-[11px] text-neutral-500 mt-1">Currently in the dining room</div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Remaining Lunch</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {metrics.remainingLunchCapacity} <span className="text-xs text-neutral-500 font-normal">/ {venueSettings.maxCoversPerShift.lunch} max</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">12:00 - 15:00 Service</div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Remaining Dinner</span>
              <Flame className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-400">
              {metrics.remainingDinnerCapacity} <span className="text-xs text-neutral-500 font-normal">/ {venueSettings.maxCoversPerShift.dinner} max</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">17:30 - 22:00 Service</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3.5">
        {/* Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest, ID, phone..."
            className="w-full min-h-[42px] pl-10 pr-4 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['all', 'confirmed', 'seated', 'pending', 'cancelled', 'no-show'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg capitalize border transition ${
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

      {/* Timeline Sheet / Live Bookings Register */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              Today&apos;s Chronological Timeline & Reservations ({filteredBookings.length})
            </h3>
          </div>
          <span className="text-xs text-neutral-400">Pacing: Max {venueSettings.maxCoversPer15Mins} covers/15min</span>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <AlertTriangle className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
            <p className="text-sm font-semibold text-neutral-300">No reservations matching filter</p>
            <p className="text-xs text-neutral-500 mt-1">Try switching status filters or clear search</p>
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
                      <a href={`tel:${b.customer.phone}`} className="hover:text-emerald-400 flex items-center gap-1">
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

                {/* Touch Actions (One-tap state transitions) */}
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
                      title="Mark as No-Show"
                    >
                      <UserX className="w-3.5 h-3.5" /> No-Show
                    </button>
                  )}

                  {b.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                      className="min-h-[38px] px-2.5 bg-neutral-800 hover:bg-red-950 text-red-400 font-semibold rounded-lg text-xs border border-white/10 transition flex items-center gap-1 cursor-pointer"
                      title="Cancel Booking"
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

      {/* WALK-IN QUICK ADD MODAL (Fast 3-tap modal) */}
      {isWalkInOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Fast Walk-In Quick Add</h3>
                <p className="text-xs text-neutral-400">Instantly seat walk-in guests & count capacity</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWalkInOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-4">
              {/* Tap 1: Party Size */}
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
                      className={`min-h-[44px] rounded-xl font-bold text-sm border transition ${
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

              {/* Tap 2: Service & Time */}
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

              {/* Notes */}
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

              {/* Tap 3: Confirm & Seat */}
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

      {/* CAPACITY & KITCHEN PACING SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Kitchen Pacing & Shift Limits</h3>
                <p className="text-xs text-neutral-400">Configure online booking throttle thresholds</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Kitchen Pacing Cap (Max covers / 15 mins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={editedPaceCap}
                  onChange={(e) => setEditedPaceCap(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Prevents orders flooding the kitchen in any single 15-minute interval.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Max Lunch Shift Covers
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={editedLunchCap}
                    onChange={(e) => setEditedLunchCap(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Max Dinner Shift Covers
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={editedDinnerCap}
                    onChange={(e) => setEditedDinnerCap(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-sm transition cursor-pointer"
              >
                Save Pacing Settings
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
