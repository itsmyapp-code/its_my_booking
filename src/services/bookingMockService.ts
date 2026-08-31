import { Booking, BookingStatus, VenueSettings, SlotAvailability, DayCapacitySummary } from '@/types/booking';
import { getTodayUKFormatted, parseUKDate, formatUKDate } from '@/lib/date-utils';

const STORAGE_KEY_BOOKINGS = 'itsmybooking_bookings_data_v1';
const STORAGE_KEY_SETTINGS = 'itsmybooking_venue_settings_v1';

export const DEFAULT_VENUE_SETTINGS: VenueSettings = {
  venueId: 'venue_uk_01',
  venueName: 'The Royal Oak Gastropub & Kitchen',
  phone: '+44 20 7946 0991',
  address: '14 High Street, Richmond, London TW9 1ED',
  isOnlineBookingEnabled: true,
  maxCoversPerShift: {
    lunch: 40,
    dinner: 60
  },
  maxCoversPer15Mins: 8, // Kitchen pacing cap per 15 mins
  serviceWindows: {
    lunch: { start: '12:00', end: '15:00' },
    dinner: { start: '17:30', end: '22:00' }
  }
};

/**
 * Generate initial realistic seed data for immediate preview
 */
export function generateSeedBookings(): Booking[] {
  const today = getTodayUKFormatted();
  
  return [
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
    {
      id: 'BKG-UK-1007',
      uid: 'user_mock_01',
      venueId: 'venue_uk_01',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      date: today,
      timeSlot: '20:00',
      covers: 4,
      service: 'dinner',
      customer: {
        fullName: 'Oliver Bennett',
        email: 'oliver.b@example.co.uk',
        phone: '+44 7700 900234',
        dietaryRequirements: 'Dairy intolerant',
        isDogFriendlyRequested: false,
        isHighchairRequested: false
      },
      status: 'confirmed',
      complianceConsent: {
        dataProcessingAgreed: true,
        marketingOptIn: true,
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
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
      return JSON.parse(raw);
    } catch {
      return DEFAULT_VENUE_SETTINGS;
    }
  }

  public updateVenueSettings(settings: Partial<VenueSettings>): VenueSettings {
    const current = this.getVenueSettings();
    const updated = { ...current, ...settings };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save settings to localStorage', e);
      }
    }
    return updated;
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

  public createWalkIn(covers: number, service: 'lunch' | 'dinner' | 'drinks', timeSlot: string, notes?: string): Booking {
    const today = getTodayUKFormatted();
    return this.createBooking({
      uid: 'user_foh_walkin',
      venueId: 'venue_uk_01',
      date: today,
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
      remainingDinnerCapacity: Math.max(0, settings.maxCoversPerShift.dinner - dinnerCovers)
    };
  }

  public getAvailableSlots(date: string, requestedCovers: number, serviceFilter?: 'lunch' | 'dinner'): SlotAvailability[] {
    const settings = this.getVenueSettings();
    if (!settings.isOnlineBookingEnabled) {
      return [];
    }

    const activeBookings = this.getBookings(date).filter((b) => b.status !== 'cancelled');
    const slots: SlotAvailability[] = [];

    // Helper to generate 15-min intervals
    const generateTimes = (startStr: string, endStr: string, service: 'lunch' | 'dinner') => {
      const [startHour, startMin] = startStr.split(':').map(Number);
      const [endHour, endMin] = endStr.split(':').map(Number);

      let current = startHour * 60 + startMin;
      const end = endHour * 60 + endMin;

      while (current < end) {
        const hh = String(Math.floor(current / 60)).padStart(2, '0');
        const mm = String(current % 60).padStart(2, '0');
        const slotTime = `${hh}:${mm}`;

        // Calculate covers already booked in this specific 15-min slot
        const slotCovers = activeBookings
          .filter((b) => b.timeSlot === slotTime)
          .reduce((sum, b) => sum + b.covers, 0);

        // Calculate covers in the whole shift
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
