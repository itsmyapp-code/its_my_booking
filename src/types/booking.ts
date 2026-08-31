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

export interface UKAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postalCode: string; // UK Postcode format
  country: string;
}

export interface DayOpeningHours {
  isOpen: boolean;
  lunch: {
    enabled: boolean;
    start: string;
    end: string;
  };
  dinner: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface WeeklySchedule {
  monday: DayOpeningHours;
  tuesday: DayOpeningHours;
  wednesday: DayOpeningHours;
  thursday: DayOpeningHours;
  friday: DayOpeningHours;
  saturday: DayOpeningHours;
  sunday: DayOpeningHours;
}

export interface VenuePolicies {
  dogFriendlyNotice?: string;
  highchairNotice?: string;
  cancellationCutoffHours?: number;
  depositRequired?: boolean;
  depositAmountPerCover?: number;
  specialDietaryNotice?: string;
}

export interface ShiftOverride {
  lunchClosed?: boolean;
  dinnerClosed?: boolean;
  allDayClosed?: boolean;
  reason?: string;
  updatedAt?: string;
}

export interface TableConfig {
  id: string;
  tableNumber: string;
  maxCovers: number;
  minCovers?: number;
  isActive: boolean;
}

export interface SeatingArea {
  id: string;
  name: string;
  description?: string;
  isDogFriendly: boolean;
  isOnlineBookingEnabled: boolean;
  tables: TableConfig[];
}

export interface VenueSettings {
  venueId: string;
  venueName: string;
  tagline?: string;
  logoUrl?: string;
  phone: string; // UK format
  email: string;
  website?: string;
  address: UKAddress;
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
  schedule?: WeeklySchedule;
  policies?: VenuePolicies;
  seatingAreas?: SeatingArea[];
  shiftOverrides?: {
    [dateUK: string]: ShiftOverride; // Key: "DD/MM/YYYY"
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
  isLunchClosed?: boolean;
  isDinnerClosed?: boolean;
  closureReason?: string;
}
