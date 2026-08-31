export type BookingStatus = 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'no-show';

export interface BookingCustomer {
  fullName: string;
  email: string;
  phone: string; // UK format (+44 / 07xxx)
  dietaryRequirements?: string;
  isDogFriendlyRequested?: boolean;
  isHighchairRequested?: boolean;
}

export interface ComplianceConsent {
  dataProcessingAgreed: boolean;
  marketingOptIn: boolean;
  timestamp: string; // ISO-8601
}

export interface Booking {
  id: string;
  uid: string;
  venueId: string;
  createdAt: string; // ISO-8601
  date: string; // DD/MM/YYYY
  timeSlot: string; // HH:MM (15-min intervals)
  covers: number; // 1-12
  service: 'lunch' | 'dinner' | 'drinks';
  customer: BookingCustomer;
  status: BookingStatus;
  complianceConsent: ComplianceConsent;
}

export interface VenueSettings {
  venueId: string;
  venueName?: string;
  phone?: string;
  address?: string;
  isOnlineBookingEnabled: boolean; // Master Kill Switch
  maxCoversPerShift: {
    lunch: number;
    dinner: number;
  };
  maxCoversPer15Mins: number; // Kitchen Pacing Cap
  serviceWindows: {
    lunch: { start: string; end: string };
    dinner: { start: string; end: string };
  };
}

export interface SlotAvailability {
  timeSlot: string; // "12:00", "12:15", ...
  service: 'lunch' | 'dinner' | 'drinks';
  currentCovers: number;
  maxCovers: number;
  isAvailable: boolean;
  remainingCapacity: number;
  reason?: string;
}

export interface DayCapacitySummary {
  date: string; // DD/MM/YYYY
  totalBookedCovers: number;
  seatedCovers: number;
  cancelledCovers: number;
  remainingLunchCapacity: number;
  remainingDinnerCapacity: number;
}
