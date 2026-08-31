'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  Flame, 
  Calendar as CalendarIcon, 
  Download, 
  Printer, 
  TrendingUp, 
  PhoneCall, 
  Globe, 
  Dog, 
  Baby, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  PieChart
} from 'lucide-react';
import { Booking, VenueSettings } from '@/types/booking';
import { formatDateToDayName, getTodayUKFormatted, addDaysUK } from '@/lib/date-utils';

interface VenueReportsViewProps {
  bookings: Booking[];
  venueSettings: VenueSettings;
}

export function VenueReportsView({ bookings, venueSettings }: VenueReportsViewProps) {
  const [dateRange, setDateRange] = useState<'today' | '7days' | 'month' | 'all'>('7days');
  const [selectedService, setSelectedService] = useState<'all' | 'lunch' | 'dinner'>('all');

  const todayUK = getTodayUKFormatted();

  // Filter bookings by selected date range and service
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedService !== 'all' && b.service !== selectedService) return false;

      if (dateRange === 'today') {
        return b.date === todayUK;
      }
      if (dateRange === '7days') {
        const next7 = Array.from({ length: 7 }, (_, i) => addDaysUK(todayUK, i));
        return next7.includes(b.date);
      }
      if (dateRange === 'month') {
        // Current month match
        const [todayDay, todayMonth, todayYear] = todayUK.split('/');
        const [bDay, bMonth, bYear] = b.date.split('/');
        return todayMonth === bMonth && todayYear === bYear;
      }
      return true;
    });
  }, [bookings, dateRange, selectedService, todayUK]);

  // Non-cancelled bookings for cover calculations
  const activeBookings = useMemo(() => {
    return filteredBookings.filter((b) => b.status !== 'cancelled');
  }, [filteredBookings]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCovers = activeBookings.reduce((sum, b) => sum + b.covers, 0);
    const totalBookings = activeBookings.length;
    const avgPartySize = totalBookings > 0 ? (totalCovers / totalBookings).toFixed(1) : '0';

    const seatedBookings = filteredBookings.filter((b) => b.status === 'seated');
    const seatedCovers = seatedBookings.reduce((sum, b) => sum + b.covers, 0);

    const cancelledCount = filteredBookings.filter((b) => b.status === 'cancelled').length;
    const noShowCount = filteredBookings.filter((b) => b.status === 'no-show').length;
    const totalRecorded = filteredBookings.length;

    const noShowRate = totalRecorded > 0 ? ((noShowCount / totalRecorded) * 100).toFixed(1) : '0';
    const cancellationRate = totalRecorded > 0 ? ((cancelledCount / totalRecorded) * 100).toFixed(1) : '0';

    // Lunch vs Dinner
    const lunchCovers = activeBookings.filter((b) => b.service === 'lunch').reduce((sum, b) => sum + b.covers, 0);
    const dinnerCovers = activeBookings.filter((b) => b.service === 'dinner').reduce((sum, b) => sum + b.covers, 0);
    const lunchPercent = totalCovers > 0 ? Math.round((lunchCovers / totalCovers) * 100) : 0;
    const dinnerPercent = totalCovers > 0 ? 100 - lunchPercent : 0;

    // Booking Source Breakdown
    const onlineCount = activeBookings.filter((b) => b.uid.startsWith('guest_') || b.id.startsWith('BKG-UK-')).length;
    const staffPhoneCount = activeBookings.filter((b) => b.uid === 'user_foh_staff').length;
    const walkInCount = activeBookings.filter((b) => b.uid === 'user_foh_walkin').length;

    // Special Requests
    const dogFriendlyCovers = activeBookings.filter((b) => b.customer.isDogFriendlyRequested).reduce((s, b) => s + b.covers, 0);
    const highchairCount = activeBookings.filter((b) => b.customer.isHighchairRequested).length;
    const dietaryCount = activeBookings.filter((b) => !!b.customer.dietaryRequirements).length;

    return {
      totalCovers,
      totalBookings,
      avgPartySize,
      seatedCovers,
      noShowRate,
      cancellationRate,
      noShowCount,
      cancelledCount,
      lunchCovers,
      dinnerCovers,
      lunchPercent,
      dinnerPercent,
      onlineCount,
      staffPhoneCount,
      walkInCount,
      dogFriendlyCovers,
      highchairCount,
      dietaryCount
    };
  }, [filteredBookings, activeBookings]);

  // Day-by-Day Breakdown
  const dailyBreakdown = useMemo(() => {
    const map: Record<string, { date: string; dayName: string; lunchCovers: number; dinnerCovers: number; totalCovers: number; count: number }> = {};

    activeBookings.forEach((b) => {
      if (!map[b.date]) {
        map[b.date] = {
          date: b.date,
          dayName: formatDateToDayName(b.date),
          lunchCovers: 0,
          dinnerCovers: 0,
          totalCovers: 0,
          count: 0
        };
      }
      if (b.service === 'lunch') {
        map[b.date].lunchCovers += b.covers;
      } else {
        map[b.date].dinnerCovers += b.covers;
      }
      map[b.date].totalCovers += b.covers;
      map[b.date].count += 1;
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [activeBookings]);

  // Kitchen Arrival Time Distribution (15m Intervals)
  const timeSlotDistribution = useMemo(() => {
    const slotMap: Record<string, number> = {};
    activeBookings.forEach((b) => {
      slotMap[b.timeSlot] = (slotMap[b.timeSlot] || 0) + b.covers;
    });

    return Object.entries(slotMap)
      .map(([slot, covers]) => ({ slot, covers }))
      .sort((a, b) => a.slot.localeCompare(b.slot));
  }, [activeBookings]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Date', 'Time', 'Service', 'Covers', 'Status', 'Guest Name', 'Phone', 'Email', 'Dietary Notes', 'Dog Friendly', 'Highchair'];
    const rows = filteredBookings.map((b) => [
      b.id,
      b.date,
      b.timeSlot,
      b.service,
      b.covers,
      b.status,
      `"${b.customer.fullName.replace(/"/g, '""')}"`,
      `"${b.customer.phone}"`,
      `"${b.customer.email}"`,
      `"${(b.customer.dietaryRequirements || '').replace(/"/g, '""')}"`,
      b.customer.isDogFriendlyRequested ? 'Yes' : 'No',
      b.customer.isHighchairRequested ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `itsmybooking_covers_report_${dateRange}_${todayUK.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxDailyCovers = Math.max(...dailyBreakdown.map((d) => d.totalCovers), 1);
  const maxSlotCovers = Math.max(...timeSlotDistribution.map((s) => s.covers), 1);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
              <BarChart3 className="w-3 h-3 inline mr-1" /> FOH Management Intelligence
            </span>
            <span className="text-xs text-neutral-400">Venue: {venueSettings.venueName}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
            Covers & Performance Reports
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Real-time cover analysis, kitchen pacing curves, shift breakdown, and guest channel metrics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="min-h-[42px] px-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV Report
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[42px] px-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold rounded-xl text-xs border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Date Range & Service Filter Bar */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-neutral-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" /> Range:
          </span>
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Next 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Recorded' }
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setDateRange(r.id as any)}
              className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                dateRange === r.id
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md font-black'
                  : 'bg-neutral-950 text-neutral-300 border-white/10 hover:bg-neutral-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <span className="text-xs font-bold text-neutral-400 mr-1">Service:</span>
          {(['all', 'lunch', 'dinner'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedService(s)}
              className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold capitalize transition cursor-pointer border ${
                selectedService === s
                  ? 'bg-neutral-100 text-neutral-950 border-white font-black'
                  : 'bg-neutral-950 text-neutral-400 border-white/10 hover:bg-neutral-800'
              }`}
            >
              {s === 'all' ? 'All Services' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Top Level KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Covers */}
        <div className="bg-neutral-900 border border-white/10 p-5 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
            <span>Total Booked Covers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalCovers}</div>
          <div className="text-[11px] text-neutral-500">
            Across {metrics.totalBookings} reservations
          </div>
        </div>

        {/* Seated Covers */}
        <div className="bg-neutral-900 border border-white/10 p-5 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
            <span>Seated Covers</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{metrics.seatedCovers}</div>
          <div className="text-[11px] text-neutral-500">
            Seated in dining rooms
          </div>
        </div>

        {/* Average Party Size */}
        <div className="bg-neutral-900 border border-white/10 p-5 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
            <span>Average Party Size</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-sky-400">{metrics.avgPartySize} <span className="text-sm font-normal text-neutral-400">covers</span></div>
          <div className="text-[11px] text-neutral-500">
            Average guests per table
          </div>
        </div>

        {/* No-Show / Cancel Rate */}
        <div className="bg-neutral-900 border border-white/10 p-5 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
            <span>No-Show Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{metrics.noShowRate}%</div>
          <div className="text-[11px] text-neutral-500">
            {metrics.noShowCount} no-shows • {metrics.cancelledCount} cancelled ({metrics.cancellationRate}%)
          </div>
        </div>
      </div>

      {/* 2-Column Split: Daily Volume & Lunch/Dinner Shift Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Cover Volume Matrix (2 Cols) */}
        <div className="lg:col-span-2 bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-400" /> Daily Cover Volume Distribution
            </h3>
            <span className="text-xs text-neutral-400">{dailyBreakdown.length} active service days</span>
          </div>

          {dailyBreakdown.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No reservation data for selected date range.
            </div>
          ) : (
            <div className="space-y-3">
              {dailyBreakdown.map((day) => {
                const percent = Math.round((day.totalCovers / maxDailyCovers) * 100);
                return (
                  <div key={day.date} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{day.date}</span>
                        <span className="text-neutral-400">({day.dayName})</span>
                        <span className="text-[10px] text-neutral-500">• {day.count} bookings</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-amber-400">{day.lunchCovers} Lunch</span>
                        <span className="text-neutral-600">/</span>
                        <span className="text-sky-400">{day.dinnerCovers} Dinner</span>
                        <span className="text-emerald-400 ml-1">({day.totalCovers} Total)</span>
                      </div>
                    </div>

                    {/* Stacked Progress Bar */}
                    <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden flex border border-white/5">
                      <div
                        style={{ width: `${day.totalCovers > 0 ? (day.lunchCovers / maxDailyCovers) * 100 : 0}%` }}
                        className="bg-amber-500 h-full transition-all"
                        title={`Lunch: ${day.lunchCovers} covers`}
                      />
                      <div
                        style={{ width: `${day.totalCovers > 0 ? (day.dinnerCovers / maxDailyCovers) * 100 : 0}%` }}
                        className="bg-sky-500 h-full transition-all"
                        title={`Dinner: ${day.dinnerCovers} covers`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shift Breakdown & Channel Metrics (1 Col) */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" /> Shift & Channel Split
          </h3>

          {/* Lunch vs Dinner Split */}
          <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
              <span className="text-amber-400">Lunch ({metrics.lunchPercent}%)</span>
              <span className="text-sky-400">Dinner ({metrics.dinnerPercent}%)</span>
            </div>
            <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden flex">
              <div style={{ width: `${metrics.lunchPercent}%` }} className="bg-amber-500 h-full" />
              <div style={{ width: `${metrics.dinnerPercent}%` }} className="bg-sky-500 h-full" />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>{metrics.lunchCovers} covers</span>
              <span>{metrics.dinnerCovers} covers</span>
            </div>
          </div>

          {/* Booking Sources */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-neutral-300 block uppercase tracking-wider">
              Booking Channels
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-white/5">
                <span className="flex items-center gap-2 text-neutral-200">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Online Guest Portal
                </span>
                <span className="font-bold text-white">{metrics.onlineCount} parties</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-white/5">
                <span className="flex items-center gap-2 text-neutral-200">
                  <PhoneCall className="w-3.5 h-3.5 text-sky-400" /> Staff Phone / Advance
                </span>
                <span className="font-bold text-white">{metrics.staffPhoneCount} parties</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-white/5">
                <span className="flex items-center gap-2 text-neutral-200">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Fast Walk-Ins
                </span>
                <span className="font-bold text-white">{metrics.walkInCount} parties</span>
              </div>
            </div>
          </div>

          {/* Hospitality Special Requests */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <span className="text-xs font-bold text-neutral-300 block uppercase tracking-wider">
              Special Hospitality Flags
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-white/5">
                <Dog className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-base font-bold text-white">{metrics.dogFriendlyCovers}</div>
                <div className="text-[10px] text-neutral-500">Dog Covers</div>
              </div>

              <div className="p-2.5 bg-neutral-950 rounded-xl border border-white/5">
                <Baby className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                <div className="text-base font-bold text-white">{metrics.highchairCount}</div>
                <div className="text-[10px] text-neutral-500">Highchairs</div>
              </div>

              <div className="p-2.5 bg-neutral-950 rounded-xl border border-white/5">
                <AlertTriangle className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                <div className="text-base font-bold text-white">{metrics.dietaryCount}</div>
                <div className="text-[10px] text-neutral-500">Allergen Notes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 15-Minute Kitchen Arrival Heatmap */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> 15-Minute Kitchen Pacing & Arrival Heatmap
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Guest arrival curve (Pacing throttle limit: {venueSettings.maxCoversPer15Mins} covers/15m)
            </p>
          </div>
        </div>

        {timeSlotDistribution.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-xs">
            No arrival slots recorded for selected range.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {timeSlotDistribution.map(({ slot, covers }) => {
              const isOverPace = covers > venueSettings.maxCoversPer15Mins;
              return (
                <div
                  key={slot}
                  className={`p-3 rounded-xl border text-center transition ${
                    isOverPace
                      ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                      : covers >= venueSettings.maxCoversPer15Mins
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                      : 'bg-neutral-950 border-white/10 text-neutral-300'
                  }`}
                >
                  <span className="text-xs font-mono font-bold block text-white">{slot}</span>
                  <span className="text-lg font-black block mt-0.5">{covers}</span>
                  <span className="text-[10px] text-neutral-500 block">covers</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
