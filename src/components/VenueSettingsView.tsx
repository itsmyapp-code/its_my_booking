'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Phone, 
  Mail, 
  Globe, 
  Dog, 
  Baby, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Sliders,
  Sparkles,
  RefreshCw,
  Copy,
  Link,
  Code,
  Check,
  LayoutGrid,
  Plus,
  Trash2,
  Armchair,
  Layers
} from 'lucide-react';
import { VenueSettings, DayOfWeek, WeeklySchedule, SeatingArea, TableConfig } from '@/types/booking';
import { bookingService } from '@/lib/booking-service';
import { DEFAULT_SEATING_AREAS } from '@/services/bookingMockService';
import { validateUKPhone } from '@/lib/date-utils';

interface VenueSettingsViewProps {
  initialSettings: VenueSettings;
  onSettingsSaved: (updated: VenueSettings) => void;
}

const PRESET_LOGOS = [
  {
    name: 'Pub & Kitchen Emblem',
    url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=160&auto=format&fit=crop&q=80'
  },
  {
    name: 'Boutique Bistro',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fine Dining & Grill',
    url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=160&auto=format&fit=crop&q=80'
  },
  {
    name: 'Craft Tavern',
    url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=160&auto=format&fit=crop&q=80'
  }
];

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export function VenueSettingsView({ initialSettings, onSettingsSaved }: VenueSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'hours' | 'pacing' | 'tables' | 'policies'>('profile');
  
  // Settings Form State
  const [venueName, setVenueName] = useState(initialSettings.venueName || '');
  const [tagline, setTagline] = useState(initialSettings.tagline || '');
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || '');
  const [phone, setPhone] = useState(initialSettings.phone || '');
  const [email, setEmail] = useState(initialSettings.email || '');
  const [website, setWebsite] = useState(initialSettings.website || '');

  // Address
  const [line1, setLine1] = useState(initialSettings.address.line1 || '');
  const [line2, setLine2] = useState(initialSettings.address.line2 || '');
  const [city, setCity] = useState(initialSettings.address.city || '');
  const [county, setCounty] = useState(initialSettings.address.county || '');
  const [postalCode, setPostalCode] = useState(initialSettings.address.postalCode || '');
  const [country, setCountry] = useState(initialSettings.address.country || 'United Kingdom');

  // Pacing & Limits
  const [maxPacing, setMaxPacing] = useState(initialSettings.maxCoversPer15Mins || 8);
  const [lunchCap, setLunchCap] = useState(initialSettings.maxCoversPerShift.lunch || 40);
  const [dinnerCap, setDinnerCap] = useState(initialSettings.maxCoversPerShift.dinner || 60);
  const [lunchStart, setLunchStart] = useState(initialSettings.serviceWindows.lunch.start || '12:00');
  const [lunchEnd, setLunchEnd] = useState(initialSettings.serviceWindows.lunch.end || '15:00');
  const [dinnerStart, setDinnerStart] = useState(initialSettings.serviceWindows.dinner.start || '17:30');
  const [dinnerEnd, setDinnerEnd] = useState(initialSettings.serviceWindows.dinner.end || '22:00');

  // Weekly Schedule
  const [schedule, setSchedule] = useState<WeeklySchedule>(
    initialSettings.schedule || {
      monday: { isOpen: true, lunch: { enabled: true, start: '12:00', end: '15:00' }, dinner: { enabled: true, start: '17:30', end: '22:00' } },
      tuesday: { isOpen: true, lunch: { enabled: true, start: '12:00', end: '15:00' }, dinner: { enabled: true, start: '17:30', end: '22:00' } },
      wednesday: { isOpen: true, lunch: { enabled: true, start: '12:00', end: '15:00' }, dinner: { enabled: true, start: '17:30', end: '22:00' } },
      thursday: { isOpen: true, lunch: { enabled: true, start: '12:00', end: '15:00' }, dinner: { enabled: true, start: '17:30', end: '22:00' } },
      friday: { isOpen: true, lunch: { enabled: true, start: '12:00', end: '15:00' }, dinner: { enabled: true, start: '17:30', end: '22:30' } },
      saturday: { isOpen: true, lunch: { enabled: true, start: '12:00', end: '15:30' }, dinner: { enabled: true, start: '17:00', end: '23:00' } },
      sunday: { isOpen: true, lunch: { enabled: true, start: '12:00', end: '16:00' }, dinner: { enabled: true, start: '17:00', end: '21:00' } }
    }
  );

  // Seating Areas & Tables
  const [seatingAreas, setSeatingAreas] = useState<SeatingArea[]>(
    initialSettings.seatingAreas || DEFAULT_SEATING_AREAS
  );

  // Policies
  const [dogNotice, setDogNotice] = useState(initialSettings.policies?.dogFriendlyNotice || '');
  const [highchairNotice, setHighchairNotice] = useState(initialSettings.policies?.highchairNotice || '');
  const [cutoffHours, setCutoffHours] = useState(initialSettings.policies?.cancellationCutoffHours || 24);
  const [dietaryNotice, setDietaryNotice] = useState(initialSettings.policies?.specialDietaryNotice || '');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Seating Area Helpers
  const handleAddArea = () => {
    const newId = `area_${Date.now()}`;
    const newArea: SeatingArea = {
      id: newId,
      name: `New Seating Area ${seatingAreas.length + 1}`,
      description: 'Customer dining section',
      isDogFriendly: false,
      isOnlineBookingEnabled: true,
      tables: [
        { id: `tbl_${Date.now()}_1`, tableNumber: 'Table 1', maxCovers: 4, isActive: true },
        { id: `tbl_${Date.now()}_2`, tableNumber: 'Table 2', maxCovers: 4, isActive: true }
      ]
    };
    setSeatingAreas([...seatingAreas, newArea]);
  };

  const handleDeleteArea = (areaId: string) => {
    setSeatingAreas(seatingAreas.filter((a) => a.id !== areaId));
  };

  const handleUpdateArea = (areaId: string, field: keyof SeatingArea, val: any) => {
    setSeatingAreas(
      seatingAreas.map((a) => (a.id === areaId ? { ...a, [field]: val } : a))
    );
  };

  const handleAddTable = (areaId: string) => {
    setSeatingAreas(
      seatingAreas.map((a) => {
        if (a.id !== areaId) return a;
        const nextNum = a.tables.length + 1;
        const newTable: TableConfig = {
          id: `tbl_${Date.now()}_${nextNum}`,
          tableNumber: `Table ${nextNum}`,
          maxCovers: 4,
          isActive: true
        };
        return { ...a, tables: [...a.tables, newTable] };
      })
    );
  };

  const handleDeleteTable = (areaId: string, tableId: string) => {
    setSeatingAreas(
      seatingAreas.map((a) => {
        if (a.id !== areaId) return a;
        return { ...a, tables: a.tables.filter((t) => t.id !== tableId) };
      })
    );
  };

  const handleUpdateTable = (areaId: string, tableId: string, field: keyof TableConfig, val: any) => {
    setSeatingAreas(
      seatingAreas.map((a) => {
        if (a.id !== areaId) return a;
        return {
          ...a,
          tables: a.tables.map((t) => (t.id === tableId ? { ...t, [field]: val } : t))
        };
      })
    );
  };

  const handleToggleDayOpen = (day: DayOfWeek) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen
      }
    }));
  };

  const handleUpdateDayTime = (
    day: DayOfWeek, 
    shift: 'lunch' | 'dinner', 
    field: 'start' | 'end' | 'enabled', 
    val: string | boolean
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [shift]: {
          ...prev[day][shift],
          [field]: val
        }
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!venueName.trim()) {
      errors.venueName = 'Business name is required';
    }

    const phoneValidation = validateUKPhone(phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error || 'Valid UK phone number required';
    }

    if (!line1.trim()) errors.line1 = 'Address line 1 is required';
    if (!city.trim()) errors.city = 'Town / City is required';
    if (!postalCode.trim()) errors.postalCode = 'UK Postcode is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSaving(true);

    try {
      const updatedSettings: VenueSettings = {
        ...initialSettings,
        venueName: venueName.trim(),
        tagline: tagline.trim(),
        logoUrl: logoUrl.trim(),
        phone: phoneValidation.formatted,
        email: email.trim().toLowerCase(),
        website: website.trim(),
        address: {
          line1: line1.trim(),
          line2: line2.trim(),
          city: city.trim(),
          county: county.trim(),
          postalCode: postalCode.trim().toUpperCase(),
          country: country.trim()
        },
        maxCoversPer15Mins: Number(maxPacing),
        maxCoversPerShift: {
          lunch: Number(lunchCap),
          dinner: Number(dinnerCap)
        },
        serviceWindows: {
          lunch: { start: lunchStart, end: lunchEnd },
          dinner: { start: dinnerStart, end: dinnerEnd }
        },
        schedule,
        seatingAreas,
        policies: {
          dogFriendlyNotice: dogNotice.trim(),
          highchairNotice: highchairNotice.trim(),
          cancellationCutoffHours: Number(cutoffHours),
          depositRequired: false,
          specialDietaryNotice: dietaryNotice.trim()
        }
      };

      const result = await bookingService.updateVenueSettings(updatedSettings);
      onSettingsSaved(result);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save venue settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
              <Sparkles className="w-3 h-3 inline mr-1" /> Venue Profile & Operations
            </span>
            <span className="text-xs text-neutral-400">ID: {initialSettings.venueId}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
            Business & Kitchen Settings
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage branding, logos, opening times, UK location, and kitchen pacing throttles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="min-h-[46px] px-6 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-neutral-950" /> Saved Successfully!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Venue Profile
            </>
          )}
        </button>
      </div>

      {/* Direct Booking Link & Embed Code Banner */}
      <div className="p-4 bg-neutral-900 border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Your Public Booking URL for Guests & Website Link
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Publish this direct link on your website (e.g. &ldquo;Book a Table&rdquo; button), Google Business Profile, and Instagram bio.
          </p>
          <div className="pt-1">
            <code className="text-xs font-mono px-3 py-1.5 bg-neutral-950 text-emerald-300 rounded-lg border border-white/10 select-all block sm:inline-block">
              {typeof window !== 'undefined' ? `${window.location.origin}/?venue=${initialSettings.venueId}` : `https://itsmybooking.co.uk/?venue=${initialSettings.venueId}`}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const url = typeof window !== 'undefined' ? `${window.location.origin}/?venue=${initialSettings.venueId}` : `https://itsmybooking.co.uk/?venue=${initialSettings.venueId}`;
              navigator.clipboard.writeText(url);
              alert('Copied direct booking link to clipboard!');
            }}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Booking Link
          </button>

          <button
            type="button"
            onClick={() => {
              const url = typeof window !== 'undefined' ? `${window.location.origin}/?venue=${initialSettings.venueId}` : `https://itsmybooking.co.uk/?venue=${initialSettings.venueId}`;
              const embed = `<iframe src="${url}" width="100%" height="750" frameborder="0" style="border-radius: 16px;"></iframe>`;
              navigator.clipboard.writeText(embed);
              alert('Copied iframe embed code to clipboard!');
            }}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold rounded-xl text-xs border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" /> Copy Embed HTML
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'profile', label: 'Branding & Contact', icon: Building2 },
          { id: 'address', label: 'UK Address & Location', icon: MapPin },
          { id: 'hours', label: 'Opening Hours & Shifts', icon: Clock },
          { id: 'tables', label: 'Seating Areas & Tables', icon: LayoutGrid },
          { id: 'pacing', label: 'Kitchen Pacing & Caps', icon: Flame },
          { id: 'policies', label: 'Guest Policies & Notice', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-white/10 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column (2/3 width on large) */}
        <div className="lg:col-span-2 bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* TAB 1: Branding & Contact */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" /> Business Identity & Visual Branding
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Appears on the guest reservation widget, confirmation tickets, and booking receipts.
                </p>
              </div>

              {/* Venue Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Venue / Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. The Royal Oak Gastropub"
                    className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white focus:border-emerald-400"
                  />
                  {formErrors.venueName && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.venueName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Tagline / Concept
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Seasonal British Cuisine"
                    className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Logo Management & Presets */}
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  Venue Logo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                  />
                  {logoUrl && (
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-neutral-950 border border-white/20 shrink-0">
                      <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Preset Logo Selection */}
                <div className="mt-3">
                  <span className="text-[11px] text-neutral-400 block mb-2 font-medium">
                    Or select a curated British hospitality aesthetic preset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_LOGOS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setLogoUrl(preset.url)}
                        className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                          logoUrl === preset.url
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-neutral-950 border-white/10 hover:bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <span className="text-[11px] font-semibold truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Contact Phone (UK) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 20 7946 0991"
                      className="w-full min-h-[44px] pl-9 pr-3 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Reservations Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="bookings@venue.co.uk"
                      className="w-full min-h-[44px] pl-9 pr-3 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Official Website
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://venue.co.uk"
                      className="w-full min-h-[44px] pl-9 pr-3 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UK Address & Location */}
          {activeTab === 'address' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Physical Venue Location (UK)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Displayed on booking directions and calendar appointments.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="14 High Street"
                    className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white focus:border-emerald-400"
                  />
                  {formErrors.line1 && <p className="mt-1 text-xs text-red-400">{formErrors.line1}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="Riverside Walk, Suite 2"
                    className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                      Town / City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Richmond"
                      className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white focus:border-emerald-400"
                    />
                    {formErrors.city && <p className="mt-1 text-xs text-red-400">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                      County / Region
                    </label>
                    <input
                      type="text"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      placeholder="Greater London"
                      className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                      UK Postcode *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                      placeholder="TW9 1ED"
                      className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-sm text-white uppercase focus:border-emerald-400 font-mono"
                    />
                    {formErrors.postalCode && <p className="mt-1 text-xs text-red-400">{formErrors.postalCode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value={country}
                    className="w-full min-h-[44px] px-3.5 bg-neutral-950/60 border border-white/10 rounded-xl text-sm text-neutral-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Opening Hours & Weekly Shifts */}
          {activeTab === 'hours' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" /> Weekly Opening Schedule & Shift Times
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Controls dynamic 15-minute slot generation across lunch and dinner services.
                </p>
              </div>

              <div className="space-y-3 divide-y divide-white/5">
                {DAYS.map(({ key, label }) => {
                  const dayConfig = schedule[key];
                  return (
                    <div key={key} className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Day Label & Open/Close Toggle */}
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <button
                          type="button"
                          onClick={() => handleToggleDayOpen(key)}
                          className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                            dayConfig.isOpen ? 'bg-emerald-500' : 'bg-neutral-800'
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 rounded-full bg-neutral-950 transition-transform ${
                              dayConfig.isOpen ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <div>
                          <span className="text-sm font-bold text-white block">{label}</span>
                          <span className="text-[10px] text-neutral-400">
                            {dayConfig.isOpen ? 'Open for Service' : 'Closed'}
                          </span>
                        </div>
                      </div>

                      {/* Shift Hours Inputs */}
                      {dayConfig.isOpen ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                          {/* Lunch */}
                          <div className="p-2 bg-neutral-950 rounded-xl border border-white/10 flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-amber-400">Lunch:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={dayConfig.lunch.start}
                                onChange={(e) => handleUpdateDayTime(key, 'lunch', 'start', e.target.value)}
                                className="px-2 py-1 bg-neutral-900 border border-white/15 rounded text-white text-xs"
                              />
                              <span className="text-neutral-500">-</span>
                              <input
                                type="time"
                                value={dayConfig.lunch.end}
                                onChange={(e) => handleUpdateDayTime(key, 'lunch', 'end', e.target.value)}
                                className="px-2 py-1 bg-neutral-900 border border-white/15 rounded text-white text-xs"
                              />
                            </div>
                          </div>

                          {/* Dinner */}
                          <div className="p-2 bg-neutral-950 rounded-xl border border-white/10 flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold text-sky-400">Dinner:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={dayConfig.dinner.start}
                                onChange={(e) => handleUpdateDayTime(key, 'dinner', 'start', e.target.value)}
                                className="px-2 py-1 bg-neutral-900 border border-white/15 rounded text-white text-xs"
                              />
                              <span className="text-neutral-500">-</span>
                              <input
                                type="time"
                                value={dayConfig.dinner.end}
                                onChange={(e) => handleUpdateDayTime(key, 'dinner', 'end', e.target.value)}
                                className="px-2 py-1 bg-neutral-900 border border-white/15 rounded text-white text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-500 italic p-2 bg-neutral-950/40 rounded-xl flex-1 text-center">
                          Venue closed all day (no online reservations generated)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: Seating Areas & Tables Management */}
          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-emerald-400" /> Seating Areas & Table Management
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Define dining sections, table layouts, and area rules (dog-friendly, online bookable).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddArea}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Area
                </button>
              </div>

              {/* Total Summary Metrics Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-white/10 text-center">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Total Areas</span>
                  <span className="text-xl font-black text-white">{seatingAreas.length}</span>
                </div>
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-white/10 text-center">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Active Tables</span>
                  <span className="text-xl font-black text-emerald-400">
                    {seatingAreas.reduce((sum, a) => sum + a.tables.filter((t) => t.isActive).length, 0)}
                  </span>
                </div>
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-white/10 text-center">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Venue Seated Capacity</span>
                  <span className="text-xl font-black text-sky-400">
                    {seatingAreas.reduce(
                      (sum, a) => sum + a.tables.filter((t) => t.isActive).reduce((s, t) => s + Number(t.maxCovers), 0),
                      0
                    )}{' '}
                    <span className="text-xs text-neutral-500 font-normal">covers</span>
                  </span>
                </div>
              </div>

              {/* Seating Areas List */}
              <div className="space-y-4">
                {seatingAreas.map((area, index) => {
                  const areaCapacity = area.tables.filter((t) => t.isActive).reduce((s, t) => s + Number(t.maxCovers), 0);

                  return (
                    <div
                      key={area.id}
                      className="p-4 sm:p-5 bg-neutral-950 rounded-2xl border border-white/10 space-y-4 transition"
                    >
                      {/* Area Header & Name Input */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div className="flex-1 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-bold text-xs">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={area.name}
                            onChange={(e) => handleUpdateArea(area.id, 'name', e.target.value)}
                            placeholder="e.g. Main Dining Room"
                            className="w-full max-w-sm px-3 py-1.5 bg-neutral-900 border border-white/15 rounded-xl text-sm font-bold text-white focus:border-emerald-400"
                          />
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-1 bg-neutral-900 rounded-lg border border-white/10">
                            {areaCapacity} covers ({area.tables.length} tables)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteArea(area.id)}
                            className="p-1.5 bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 rounded-lg border border-white/10 transition cursor-pointer"
                            title="Delete this seating area"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Area Description */}
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                          Section Description & Guest Notes
                        </label>
                        <input
                          type="text"
                          value={area.description || ''}
                          onChange={(e) => handleUpdateArea(area.id, 'description', e.target.value)}
                          placeholder="e.g. Central restaurant section with views of the pass."
                          className="w-full px-3 py-1.5 bg-neutral-900 border border-white/15 rounded-xl text-xs text-neutral-200 focus:border-emerald-400"
                        />
                      </div>

                      {/* Area Rules: Dog-Friendly & Online Booking */}
                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                          <input
                            type="checkbox"
                            checked={area.isDogFriendly}
                            onChange={(e) => handleUpdateArea(area.id, 'isDogFriendly', e.target.checked)}
                            className="w-4 h-4 accent-amber-500 rounded border-neutral-700 bg-neutral-900"
                          />
                          <span className="flex items-center gap-1">
                            <Dog className="w-3.5 h-3.5 text-amber-400" /> Dog-Friendly Area
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                          <input
                            type="checkbox"
                            checked={area.isOnlineBookingEnabled}
                            onChange={(e) => handleUpdateArea(area.id, 'isOnlineBookingEnabled', e.target.checked)}
                            className="w-4 h-4 accent-emerald-500 rounded border-neutral-700 bg-neutral-900"
                          />
                          <span>Allow Online Guest Bookings</span>
                          {!area.isOnlineBookingEnabled && (
                            <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800">
                              Phone / Walk-in Only
                            </span>
                          )}
                        </label>
                      </div>

                      {/* Tables Sub-Section */}
                      <div className="pt-2 border-t border-white/5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                            Tables & Covers Configuration
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddTable(area.id)}
                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Table
                          </button>
                        </div>

                        {/* Tables Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {area.tables.map((table) => (
                            <div
                              key={table.id}
                              className="p-2.5 bg-neutral-900 rounded-xl border border-white/10 flex items-center justify-between gap-2"
                            >
                              <div className="flex-1 flex items-center gap-1.5">
                                <Armchair className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                <input
                                  type="text"
                                  value={table.tableNumber}
                                  onChange={(e) => handleUpdateTable(area.id, table.id, 'tableNumber', e.target.value)}
                                  placeholder="Table name"
                                  className="w-full min-w-[70px] px-2 py-1 bg-neutral-950 border border-white/10 rounded text-xs font-bold text-white focus:border-emerald-400"
                                />
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <input
                                  type="number"
                                  min="1"
                                  max="30"
                                  value={table.maxCovers}
                                  onChange={(e) =>
                                    handleUpdateTable(area.id, table.id, 'maxCovers', Math.max(1, Number(e.target.value)))
                                  }
                                  className="w-12 px-1.5 py-1 bg-neutral-950 border border-white/10 rounded text-xs font-bold text-emerald-400 text-center"
                                  title="Max party covers for this table"
                                />
                                <span className="text-[10px] text-neutral-400">cov</span>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTable(area.id, table.id)}
                                  className="p-1 text-neutral-500 hover:text-red-400 rounded cursor-pointer transition"
                                  title="Delete table"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Kitchen Pacing & Capacity */}
          {activeTab === 'pacing' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-400" /> Kitchen Pacing Caps & Capacity Throttles
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Protects the kitchen brigade from order flooding and caps total dining room covers.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                  <label className="block text-xs font-bold text-white">
                    Kitchen Pacing Cap (Covers / 15 Minutes) *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="1"
                      value={maxPacing}
                      onChange={(e) => setMaxPacing(Number(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                    <span className="w-16 text-center py-1.5 bg-neutral-900 rounded-lg font-mono font-bold text-emerald-400 text-base border border-white/10">
                      {maxPacing}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    If existing reservations in a 15-minute slot + party size exceed <strong>{maxPacing} covers</strong>, that slot is marked as fully committed.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                    <label className="block text-xs font-bold text-amber-400">
                      Lunch Maximum Covers / Shift
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={lunchCap}
                      onChange={(e) => setLunchCap(Number(e.target.value))}
                      className="w-full min-h-[44px] px-3 bg-neutral-900 border border-white/15 rounded-xl text-white font-bold"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Total cumulative covers permitted across the entire lunch shift.
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                    <label className="block text-xs font-bold text-sky-400">
                      Dinner Maximum Covers / Shift
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={dinnerCap}
                      onChange={(e) => setDinnerCap(Number(e.target.value))}
                      className="w-full min-h-[44px] px-3 bg-neutral-900 border border-white/15 rounded-xl text-white font-bold"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Total cumulative covers permitted across the entire dinner shift.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Policies & Guest Notice */}
          {activeTab === 'policies' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Hospitality Policies & Dietary Notices
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Guidance text presented to guests during reservation checkout.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5 flex items-center gap-1.5">
                    <Dog className="w-4 h-4 text-amber-400" /> Dog-Friendly Policy Text
                  </label>
                  <input
                    type="text"
                    value={dogNotice}
                    onChange={(e) => setDogNotice(e.target.value)}
                    placeholder="e.g. Well-behaved dogs on leads are welcome in the bar area."
                    className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5 flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-sky-400" /> Highchair & Families Policy
                  </label>
                  <input
                    type="text"
                    value={highchairNotice}
                    onChange={(e) => setHighchairNotice(e.target.value)}
                    placeholder="e.g. Highchairs and booster seats are provided upon request."
                    className="w-full min-h-[44px] px-3.5 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    Allergen / Dietary Notice
                  </label>
                  <textarea
                    rows={2}
                    value={dietaryNotice}
                    onChange={(e) => setDietaryNotice(e.target.value)}
                    placeholder="e.g. Please inform us of all allergies; our kitchen handles nuts and gluten."
                    className="w-full p-3 bg-neutral-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-400"
                  />
                </div>

                <div className="p-4 bg-neutral-950 rounded-xl border border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">Cancellation Cutoff Window</span>
                    <span className="text-[11px] text-neutral-400">Hours before booking time guests can cancel penalty-free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={cutoffHours}
                      onChange={(e) => setCutoffHours(Number(e.target.value))}
                      className="w-20 min-h-[40px] px-3 bg-neutral-900 border border-white/15 rounded-xl text-white text-center font-bold"
                    />
                    <span className="text-xs text-neutral-300">Hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Column (1/3 width on large) */}
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Guest Card Preview
              </span>
              <span className="text-[10px] text-neutral-500">Real-time</span>
            </div>

            {/* Simulated Guest Booking Header Card */}
            <div className="bg-neutral-950 border border-white/15 rounded-xl p-4 space-y-3.5 text-neutral-100 shadow-inner">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={venueName}
                    className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white text-base truncate">
                    {venueName || 'Your Venue Name'}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {tagline || 'Modern British Gastronomy'}
                  </p>
                </div>
              </div>

              {/* Address Badge */}
              <div className="pt-2 border-t border-white/10 text-xs space-y-1.5 text-neutral-300">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    {line1 ? `${line1}, ${city}, ${postalCode}` : '14 High Street, Richmond, TW9 1ED'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-mono">
                    {phone || '+44 20 7946 0991'}
                  </span>
                </div>
              </div>

              {/* Kitchen Pacing Summary Pill */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Kitchen Pacing:</span>
                <span className="font-mono font-bold text-emerald-400">{maxPacing} covers / 15m</span>
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="mt-4 p-3 bg-neutral-950/60 rounded-xl border border-white/5 text-[11px] text-neutral-400 space-y-1">
              <p className="font-semibold text-neutral-200">Instant Cross-Module Sync</p>
              <p>Saving this profile updates the customer booking engine, confirmation receipts, and FOH operational dashboard immediately.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
