import { 
  Booking, 
  BookingStatus, 
  VenueSettings, 
  SlotAvailability, 
  DayCapacitySummary, 
  WeeklySchedule,
  ShiftOverride 
} from '@/types/booking';
import { getTodayUKFormatted, addDaysUK, parseUKDate, formatUKDate } from '@/lib/date-utils';

const STORAGE_KEY_BOOKINGS = 'itsmybooking_bookings_data_v1';
const STORAGE_KEY_SETTINGS = 'itsmybooking_venue_settings_v1';

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  monday: {
    isOpen: true,
    lunch: { enabled: true, start: '12:00', end: '15:00' },
    dinner: { enabled: true, start: '17:30', end: '22:00' }
  },
  tuesday: {
    isOpen: true,
    lunch: { enabled: true, start: '12:00', end: '15:00' },
    dinner: { enabled: true, start: '17:30', end: '22:00' }
  },
  wednesday: {
    isOpen: true,
    lunch: { enabled: true, start: '12:00', end: '15:00' },
    dinner: { enabled: true, start: '17:30', end: '22:00' }
  },
  thursday: {
    isOpen: true,
    lunch: { enabled: true, start: '12:00', end: '15:00' },
    dinner: { enabled: true, start: '17:30', end: '22:00' }
  },
  friday: {
    isOpen: true,
    lunch: { enabled: true, start: '12:00', end: '15:00' },
    dinner: { enabled: true, start: '17:30', end: '22:30' }
  },
  saturday: {
    isOpen: true,
    lunch: { enabled: true, start: '12:00', end: '15:30' },
    dinner: { enabled: true, start: '17:00', end: '23:00' }
  },
  sunday: {
    isOpen: true,
    lunch: { enabled: true, start: '12:00', end: '16:00' },
    dinner: { enabled: true, start: '17:00', end: '21:00' }
  }
};

export const DEFAULT_SEATING_AREAS = [
  {
    id: 'area_main_dining',
    name: 'Main Dining Room',
    description: 'Central restaurant dining room with tablecloths and view of the open pass.',
    isDogFriendly: false,
    isHighchairAllowed: true,
    isOnlineBookingEnabled: true,
    tables: [
      { id: 'tbl_1', tableNumber: 'Table 1', maxCovers: 2, isActive: true },
      { id: 'tbl_2', tableNumber: 'Table 2', maxCovers: 2, isActive: true },
      { id: 'tbl_3', tableNumber: 'Table 3', maxCovers: 4, isActive: true },
      { id: 'tbl_4', tableNumber: 'Table 4', maxCovers: 4, isActive: true },
      { id: 'tbl_5', tableNumber: 'Table 5', maxCovers: 6, isActive: true },
      { id: 'tbl_6', tableNumber: 'Table 6', maxCovers: 6, isActive: true }
    ]
  },
  {
    id: 'area_snug_fireplace',
    name: 'Snug & Fireplace Lounge',
    description: 'Cosy wood-panelled booths beside the historic log fireplace.',
    isDogFriendly: true,
    isHighchairAllowed: true,
    isOnlineBookingEnabled: true,
    tables: [
      { id: 'tbl_snug_1', tableNumber: 'Booth 1', maxCovers: 4, isActive: true },
      { id: 'tbl_snug_2', tableNumber: 'Booth 2', maxCovers: 4, isActive: true },
      { id: 'tbl_snug_3', tableNumber: 'Booth 3', maxCovers: 6, isActive: true }
    ]
  },
  {
    id: 'area_bar_area',
    name: 'Bar Area (High Tops)',
    description: 'Informal bar tables near the ale pumps for drinks and casual dining.',
    isDogFriendly: true,
    isHighchairAllowed: false, // High stools - no highchairs
    isOnlineBookingEnabled: false, // Walk-in only
    tables: [
      { id: 'tbl_bar_1', tableNumber: 'Bar Table 1', maxCovers: 2, isActive: true },
      { id: 'tbl_bar_2', tableNumber: 'Bar Table 2', maxCovers: 2, isActive: true },
      { id: 'tbl_bar_3', tableNumber: 'Bar Table 3', maxCovers: 4, isActive: true },
      { id: 'tbl_bar_4', tableNumber: 'Bar Table 4', maxCovers: 4, isActive: true }
    ]
  },
  {
    id: 'area_terrace_garden',
    name: 'Garden & Riverside Terrace',
    description: 'Outdoor heated parasol tables with garden views.',
    isDogFriendly: true,
    isHighchairAllowed: true,
    isOnlineBookingEnabled: true,
    tables: [
      { id: 'tbl_terrace_1', tableNumber: 'Terrace 1', maxCovers: 4, isActive: true },
      { id: 'tbl_terrace_2', tableNumber: 'Terrace 2', maxCovers: 4, isActive: true },
      { id: 'tbl_terrace_3', tableNumber: 'Terrace 3', maxCovers: 6, isActive: true },
      { id: 'tbl_terrace_4', tableNumber: 'Terrace 4', maxCovers: 6, isActive: true }
    ]
  },
  {
    id: 'area_private_dining',
    name: 'Private Dining Room',
    description: 'Exclusive private suite for private parties and corporate banquets.',
    isDogFriendly: false,
    isHighchairAllowed: true,
    isOnlineBookingEnabled: false, // Phone only
    tables: [
      { id: 'tbl_pdr_1', tableNumber: 'Private Dining Table', maxCovers: 14, isActive: true }
    ]
  }
];

export const DEFAULT_VENUE_SETTINGS: VenueSettings = {
  venueId: 'venue_uk_01',
  venueName: 'The Royal Oak Gastropub & Kitchen',
  tagline: 'Modern British Gastronomy & Seasonal Local Fare',
  logoUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=160&auto=format&fit=crop&q=80',
  phone: '+44 20 7946 0991',
  email: 'reservations@theroyaloak-richmond.co.uk',
  website: 'https://theroyaloak-richmond.co.uk',
  address: {
    line1: '14 High Street',
    line2: 'Riverside Walk',
    city: 'Richmond',
    county: 'Greater London',
    postalCode: 'TW9 1ED',
    country: 'United Kingdom'
  },
  isOnlineBookingEnabled: true,
  maxCoversPerShift: {
    lunch: 40,
    dinner: 60
  },
  maxCoversPer15Mins: 8, // Kitchen pacing cap per 15 mins
  serviceWindows: {
    lunch: { start: '12:00', end: '15:00' },
    dinner: { start: '17:30', end: '22:00' }
  },
  schedule: DEFAULT_WEEKLY_SCHEDULE,
  seatingAreas: DEFAULT_SEATING_AREAS,
  policies: {
    dogFriendlyNotice: 'Well-behaved dogs on leads are welcome in our bar and garden terrace areas.',
    highchairNotice: 'Highchairs and booster seats are available on request during table booking.',
    cancellationCutoffHours: 24,
    depositRequired: false,
    depositAmountPerCover: 0,
    specialDietaryNotice: 'Please inform us of all allergies; our kitchen handles nuts, dairy, and gluten.'
  },
  shiftOverrides: {}
};

/**
 * Generate multi-day realistic seed data across today, tomorrow, and upcoming days
 */
export function generateSeedBookings(): Booking[] {
  const today = getTodayUKFormatted();
  const tomorrow = addDaysUK(today, 1);
  const day3 = addDaysUK(today, 2);
  const day4 = addDaysUK(today, 3);
  const day5 = addDaysUK(today, 4);

  return [
    // Today's Bookings
    {
      id: 'BKG-UK-1001',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      date: today,
      timeSlot: '12:00',
      covers: 2,
      service: 'lunch',
      customer: {
        fullName: 'Alexander Wright',
        email: 'alexander.wright@example.co.uk',
        phone: '+44 7700 900123',
        dietaryRequirements: 'Vegetarian',
        isDogFriendlyRequested: true,
        isHighchairRequested: false
      },
      status: 'seated',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: false,
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    },
    {
      id: 'BKG-UK-1002',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      date: today,
      timeSlot: '12:30',
      covers: 4,
      service: 'lunch',
      customer: {
        fullName: 'Charlotte Davies',
        email: 'charlotte.davies@example.co.uk',
        phone: '+44 7700 900456',
        dietaryRequirements: '1x Gluten-Free, 1x Nut Allergy',
        isDogFriendlyRequested: false,
        isHighchairRequested: true
      },
      status: 'seated',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: true,
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    },
    {
      id: 'BKG-UK-1003',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      date: today,
      timeSlot: '13:15',
      covers: 2,
      service: 'lunch',
      customer: {
        fullName: 'Edward Harrison',
        email: 'e.harrison@example.co.uk',
        phone: '+44 7700 900789',
        isDogFriendlyRequested: false,
        isHighchairRequested: false
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: false,
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    },
    {
      id: 'BKG-UK-1004',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      date: today,
      timeSlot: '18:00',
      covers: 4,
      service: 'dinner',
      customer: {
        fullName: 'Dr. Fiona Campbell',
        email: 'fiona.campbell@example.co.uk',
        phone: '+44 7700 900321',
        dietaryRequirements: 'Pescatarian',
        isDogFriendlyRequested: true,
        isHighchairRequested: false
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: true,
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    },
    {
      id: 'BKG-UK-1005',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      date: today,
      timeSlot: '18:30',
      covers: 6,
      service: 'dinner',
      customer: {
        fullName: 'George & Sophie Miller',
        email: 'george.miller@example.co.uk',
        phone: '+44 7700 900654',
        dietaryRequirements: 'Celebration dinner (Anniversary)',
        isDogFriendlyRequested: false,
        isHighchairRequested: false
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: false,
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    },
    {
      id: 'BKG-UK-1006',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      date: today,
      timeSlot: '19:15',
      covers: 2,
      service: 'dinner',
      customer: {
        fullName: 'Harriet Taylor',
        email: 'harriet.taylor@example.co.uk',
        phone: '+44 7700 900987',
        isDogFriendlyRequested: true,
        isHighchairRequested: false
      },
      status: 'pending',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: false,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    },

    // Tomorrow's Bookings
    {
      id: 'BKG-UK-2001',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date().toISOString(),
      date: tomorrow,
      timeSlot: '12:30',
      covers: 4,
      service: 'lunch',
      customer: {
        fullName: 'Professor James Sterling',
        email: 'j.sterling@example.co.uk',
        phone: '+44 7700 900888',
        dietaryRequirements: 'Halal',
        isDogFriendlyRequested: false,
        isHighchairRequested: false
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: true,
        timestamp: new Date().toISOString()
      }
    },
    {
      id: 'BKG-UK-2002',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date().toISOString(),
      date: tomorrow,
      timeSlot: '19:00',
      covers: 6,
      service: 'dinner',
      customer: {
        fullName: 'Lady Beatrice Howard',
        email: 'b.howard@example.co.uk',
        phone: '+44 7700 900999',
        dietaryRequirements: '2x Coeliac',
        isDogFriendlyRequested: true,
        isHighchairRequested: false
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: false,
        timestamp: new Date().toISOString()
      }
    },
    {
      id: 'BKG-UK-2003',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date().toISOString(),
      date: tomorrow,
      timeSlot: '19:45',
      covers: 2,
      service: 'dinner',
      customer: {
        fullName: 'Marcus Thorne',
        email: 'marcus.t@example.co.uk',
        phone: '+44 7700 900222',
        isDogFriendlyRequested: false,
        isHighchairRequested: false
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: true,
        timestamp: new Date().toISOString()
      }
    },

    // Day 3 Bookings
    {
      id: 'BKG-UK-3001',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date().toISOString(),
      date: day3,
      timeSlot: '13:00',
      covers: 5,
      service: 'lunch',
      customer: {
        fullName: 'The Henderson Family',
        email: 'henderson@example.co.uk',
        phone: '+44 7700 900333',
        isDogFriendlyRequested: false,
        isHighchairRequested: true
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: false,
        timestamp: new Date().toISOString()
      }
    },
    {
      id: 'BKG-UK-3002',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date().toISOString(),
      date: day3,
      timeSlot: '18:30',
      covers: 4,
      service: 'dinner',
      customer: {
        fullName: 'Rupert & Victoria Cole',
        email: 'rv.cole@example.co.uk',
        phone: '+44 7700 900444',
        dietaryRequirements: 'Vegetarian',
        isDogFriendlyRequested: true,
        isHighchairRequested: false
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: true,
        timestamp: new Date().toISOString()
      }
    },

    // Day 4 Bookings
    {
      id: 'BKG-UK-4001',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date().toISOString(),
      date: day4,
      timeSlot: '19:30',
      covers: 6,
      service: 'dinner',
      customer: {
        fullName: 'London Wine Society',
        email: 'winesoc@example.co.uk',
        phone: '+44 7700 900555',
        dietaryRequirements: 'Tasting menu pairing',
        isDogFriendlyRequested: false,
        isHighchairRequested: false
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: false,
        timestamp: new Date().toISOString()
      }
    },

    // Day 5 Bookings
    {
      id: 'BKG-UK-5001',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date().toISOString(),
      date: day5,
      timeSlot: '12:30',
      covers: 6,
      service: 'lunch',
      customer: {
        fullName: 'Sunday Roast Party (Evans)',
        email: 'evans.sunday@example.co.uk',
        phone: '+44 7700 900666',
        isDogFriendlyRequested: true,
        isHighchairRequested: true
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: true,
        timestamp: new Date().toISOString()
      }
    }
  ];
}

class BookingMockService {
  private getStorageBookings(): Booking[] {
    if (typeof window === 'undefined') return generateSeedBookings();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (!raw) {
        const seed = generateSeedBookings();
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw);
    } catch {
      return generateSeedBookings();
    }
  }

  private saveStorageBookings(bookings: Booking[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed to save bookings to localStorage', e);
    }
  }

  public getVenueSettings(): VenueSettings {
    if (typeof window === 'undefined') return DEFAULT_VENUE_SETTINGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_VENUE_SETTINGS));
        return DEFAULT_VENUE_SETTINGS;
      }
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_VENUE_SETTINGS,
        ...parsed,
        address: { ...DEFAULT_VENUE_SETTINGS.address, ...(parsed.address || {}) },
        schedule: { ...DEFAULT_WEEKLY_SCHEDULE, ...(parsed.schedule || {}) },
        policies: { ...DEFAULT_VENUE_SETTINGS.policies, ...(parsed.policies || {}) },
        seatingAreas: parsed.seatingAreas || DEFAULT_SEATING_AREAS,
        shiftOverrides: parsed.shiftOverrides || {}
      };
    } catch {
      return DEFAULT_VENUE_SETTINGS;
    }
  }

  public updateVenueSettings(settings: Partial<VenueSettings>): VenueSettings {
    const current = this.getVenueSettings();
    const updated: VenueSettings = {
      ...current,
      ...settings,
      address: {
        ...current.address,
        ...(settings.address || {})
      },
      schedule: {
        ...(current.schedule || DEFAULT_WEEKLY_SCHEDULE),
        ...(settings.schedule || {})
      },
      policies: {
        ...(current.policies || DEFAULT_VENUE_SETTINGS.policies),
        ...(settings.policies || {})
      },
      seatingAreas: settings.seatingAreas !== undefined ? settings.seatingAreas : (current.seatingAreas || DEFAULT_SEATING_AREAS),
      shiftOverrides: {
        ...(current.shiftOverrides || {}),
        ...(settings.shiftOverrides || {})
      }
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save settings to localStorage', e);
      }
    }
    return updated;
  }

  /**
   * Toggle Lunch or Dinner or All-Day closure for any specific date
   */
  public toggleShiftOverride(
    dateUK: string, 
    shift: 'lunch' | 'dinner' | 'allDay', 
    isClosed: boolean, 
    reason?: string
  ): VenueSettings {
    const current = this.getVenueSettings();
    const existingOverride = current.shiftOverrides?.[dateUK] || {};

    const updatedOverride: ShiftOverride = {
      ...existingOverride,
      ...(shift === 'lunch' ? { lunchClosed: isClosed } : {}),
      ...(shift === 'dinner' ? { dinnerClosed: isClosed } : {}),
      ...(shift === 'allDay' ? { allDayClosed: isClosed, lunchClosed: isClosed, dinnerClosed: isClosed } : {}),
      reason: isClosed ? (reason || 'Service closed by Front of House') : (existingOverride.reason || ''),
      updatedAt: new Date().toISOString()
    };

    const newOverrides = {
      ...(current.shiftOverrides || {}),
      [dateUK]: updatedOverride
    };

    return this.updateVenueSettings({ shiftOverrides: newOverrides });
  }

  public getShiftOverride(dateUK: string): ShiftOverride | null {
    const settings = this.getVenueSettings();
    return settings.shiftOverrides?.[dateUK] || null;
  }

  public getBookings(date?: string): Booking[] {
    const all = this.getStorageBookings();
    if (!date) return all;
    return all.filter((b) => b.date === date);
  }

  public getBookingById(id: string): Booking | null {
    const all = this.getStorageBookings();
    return all.find((b) => b.id === id) || null;
  }

  public createBooking(bookingInput: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: BookingStatus }): Booking {
    const all = this.getStorageBookings();
    const id = `BKG-UK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingInput,
      id,
      createdAt: new Date().toISOString(),
      status: bookingInput.status || 'confirmed'
    };

    const updated = [newBooking, ...all];
    this.saveStorageBookings(updated);
    return newBooking;
  }

  public updateBookingStatus(id: string, status: BookingStatus): Booking | null {
    const all = this.getStorageBookings();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) return null;

    all[index] = {
      ...all[index],
      status
    };

    this.saveStorageBookings(all);
    return all[index];
  }

  public createWalkIn(
    covers: number, 
    service: 'lunch' | 'dinner' | 'drinks', 
    timeSlot: string, 
    notes?: string,
    date?: string
  ): Booking {
    const targetDate = date || getTodayUKFormatted();
    return this.createBooking({
      uid: 'user_foh_walkin',
      venueId: 'venue_uk_01',
      date: targetDate,
      timeSlot,
      covers,
      service,
      customer: {
        fullName: `Walk-In Guest (${covers} covers)`,
        email: 'walkin@foh.local',
        phone: '+44 7000 000000',
        dietaryRequirements: notes
      },
      status: 'seated',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: false,
        timestamp: new Date().toISOString()
      }
    });
  }

  public getDayMetrics(date: string): DayCapacitySummary {
    const bookings = this.getBookings(date).filter((b) => b.status !== 'cancelled');
    const settings = this.getVenueSettings();
    const override = settings.shiftOverrides?.[date];

    const totalBookedCovers = bookings.reduce((sum, b) => sum + b.covers, 0);
    const seatedCovers = bookings.filter((b) => b.status === 'seated').reduce((sum, b) => sum + b.covers, 0);
    const cancelledCovers = this.getBookings(date).filter((b) => b.status === 'cancelled').reduce((sum, b) => sum + b.covers, 0);

    const lunchCovers = bookings.filter((b) => b.service === 'lunch').reduce((sum, b) => sum + b.covers, 0);
    const dinnerCovers = bookings.filter((b) => b.service === 'dinner').reduce((sum, b) => sum + b.covers, 0);

    return {
      date,
      totalBookedCovers,
      seatedCovers,
      cancelledCovers,
      remainingLunchCapacity: Math.max(0, settings.maxCoversPerShift.lunch - lunchCovers),
      remainingDinnerCapacity: Math.max(0, settings.maxCoversPerShift.dinner - dinnerCovers),
      isLunchClosed: !!override?.lunchClosed || !!override?.allDayClosed,
      isDinnerClosed: !!override?.dinnerClosed || !!override?.allDayClosed,
      closureReason: override?.reason
    };
  }

  public getAvailableSlots(date: string, requestedCovers: number, serviceFilter?: 'lunch' | 'dinner'): SlotAvailability[] {
    const settings = this.getVenueSettings();
    if (!settings.isOnlineBookingEnabled) {
      return [];
    }

    const override = settings.shiftOverrides?.[date];
    if (override?.allDayClosed) {
      return [];
    }

    const activeBookings = this.getBookings(date).filter((b) => b.status !== 'cancelled');
    const slots: SlotAvailability[] = [];

    const generateTimes = (startStr: string, endStr: string, service: 'lunch' | 'dinner') => {
      const isShiftClosed = (service === 'lunch' && override?.lunchClosed) || 
                            (service === 'dinner' && override?.dinnerClosed);

      const [startHour, startMin] = startStr.split(':').map(Number);
      const [endHour, endMin] = endStr.split(':').map(Number);

      let current = startHour * 60 + startMin;
      const end = endHour * 60 + endMin;

      while (current < end) {
        const hh = String(Math.floor(current / 60)).padStart(2, '0');
        const mm = String(current % 60).padStart(2, '0');
        const slotTime = `${hh}:${mm}`;

        if (isShiftClosed) {
          slots.push({
            timeSlot: slotTime,
            service,
            currentCovers: 0,
            maxCovers: settings.maxCoversPer15Mins,
            remainingCapacity: 0,
            isAvailable: false,
            reason: override?.reason || `${service.toUpperCase()} service is closed for online bookings`
          });
          current += 15;
          continue;
        }

        const slotCovers = activeBookings
          .filter((b) => b.timeSlot === slotTime)
          .reduce((sum, b) => sum + b.covers, 0);

        const shiftTotalCovers = activeBookings
          .filter((b) => b.service === service)
          .reduce((sum, b) => sum + b.covers, 0);

        const shiftMax = settings.maxCoversPerShift[service];
        const paceCap = settings.maxCoversPer15Mins;

        const fitsPace = (slotCovers + requestedCovers) <= paceCap;
        const fitsShift = (shiftTotalCovers + requestedCovers) <= shiftMax;

        let isAvailable = fitsPace && fitsShift;
        let reason = undefined;

        if (!fitsPace) {
          reason = `Kitchen pacing limit reached (${slotCovers}/${paceCap} covers)`;
        } else if (!fitsShift) {
          reason = `${service.toUpperCase()} shift capacity full (${shiftTotalCovers}/${shiftMax})`;
        }

        slots.push({
          timeSlot: slotTime,
          service,
          currentCovers: slotCovers,
          maxCovers: paceCap,
          remainingCapacity: Math.max(0, paceCap - slotCovers),
          isAvailable,
          reason
        });

        current += 15;
      }
    };

    if (!serviceFilter || serviceFilter === 'lunch') {
      generateTimes(settings.serviceWindows.lunch.start, settings.serviceWindows.lunch.end, 'lunch');
    }
    if (!serviceFilter || serviceFilter === 'dinner') {
      generateTimes(settings.serviceWindows.dinner.start, settings.serviceWindows.dinner.end, 'dinner');
    }

    return slots;
  }

  public resetToSeedData(): void {
    if (typeof window !== 'undefined') {
      const seed = generateSeedBookings();
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(seed));
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_VENUE_SETTINGS));
    }
  }
}

export const bookingMockService = new BookingMockService();
