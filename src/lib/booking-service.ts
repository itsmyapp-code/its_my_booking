/**
 * Unified Booking Service Layer (Client-Side Orchestrator)
 * Scoped data path: users/{uid}/venues/{venueId}/bookings/{bookingId}
 * Interfaces with Firebase Client SDK Firestore (with offline persistent cache).
 */

import { 
  Booking, 
  BookingStatus, 
  VenueSettings, 
  SlotAvailability, 
  DayCapacitySummary, 
  ShiftOverride 
} from '@/types/booking';
import { bookingMockService, DEFAULT_VENUE_SETTINGS } from '@/services/bookingMockService';
import { isFirebaseConfigured, db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';

export class BookingService {
  private uid = 'auth_owner_01';
  private venueId = 'venue_uk_01';

  private getVenueSettingsDocRef() {
    if (!db) return null;
    return doc(db, `users/${this.uid}/venues/${this.venueId}/settings/profile`);
  }

  private getBookingsCollectionRef() {
    if (!db) return null;
    return collection(db, `users/${this.uid}/venues/${this.venueId}/bookings`);
  }

  public async getVenueSettings(): Promise<VenueSettings> {
    const local = bookingMockService.getVenueSettings();
    if (!db) return local;

    try {
      const docRef = this.getVenueSettingsDocRef();
      if (docRef) {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const cloudData = snap.data() as VenueSettings;
          bookingMockService.updateVenueSettings(cloudData);
          return cloudData;
        } else {
          // Initialize cloud settings doc with defaults
          await setDoc(docRef, local);
        }
      }
    } catch (e) {
      console.warn('Firestore settings fetch fallback to local:', e);
    }
    return local;
  }

  public async updateVenueSettings(settings: Partial<VenueSettings>): Promise<VenueSettings> {
    const updated = bookingMockService.updateVenueSettings(settings);
    if (db) {
      try {
        const docRef = this.getVenueSettingsDocRef();
        if (docRef) {
          await setDoc(docRef, updated, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore settings write offline sync:', e);
      }
    }
    return updated;
  }

  public async toggleShiftOverride(
    dateUK: string, 
    shift: 'lunch' | 'dinner' | 'allDay', 
    isClosed: boolean, 
    reason?: string
  ): Promise<VenueSettings> {
    const updated = bookingMockService.toggleShiftOverride(dateUK, shift, isClosed, reason);
    if (db) {
      try {
        const docRef = this.getVenueSettingsDocRef();
        if (docRef) {
          await setDoc(docRef, { shiftOverrides: updated.shiftOverrides }, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore shift override sync:', e);
      }
    }
    return updated;
  }

  public getShiftOverride(dateUK: string): ShiftOverride | null {
    return bookingMockService.getShiftOverride(dateUK);
  }

  public async getBookings(date?: string): Promise<Booking[]> {
    const local = bookingMockService.getBookings(date);
    if (!db) return local;

    try {
      const colRef = this.getBookingsCollectionRef();
      if (colRef) {
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const cloudBookings = snapshot.docs.map((d) => d.data() as Booking);
          // Sync any cloud bookings to local storage
          for (const b of cloudBookings) {
            if (!local.find((l) => l.id === b.id)) {
              bookingMockService.createBooking(b);
            }
          }
          if (date) {
            return cloudBookings.filter((b) => b.date === date);
          }
          return cloudBookings;
        }
      }
    } catch (e) {
      console.warn('Firestore bookings fetch fallback to local:', e);
    }

    return local;
  }

  public async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: BookingStatus }): Promise<Booking> {
    const created = bookingMockService.createBooking(bookingData);
    if (db) {
      try {
        const docRef = doc(db, `users/${bookingData.uid || this.uid}/venues/${bookingData.venueId || this.venueId}/bookings/${created.id}`);
        await setDoc(docRef, created);
      } catch (err) {
        console.warn('Firestore offline booking sync pending:', err);
      }
    }
    return created;
  }

  public async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const updated = bookingMockService.updateBookingStatus(id, status);
    if (db && updated) {
      try {
        const docRef = doc(db, `users/${updated.uid || this.uid}/venues/${updated.venueId || this.venueId}/bookings/${id}`);
        await setDoc(docRef, { status }, { merge: true });
      } catch (e) {
        console.warn('Firestore status update sync:', e);
      }
    }
    return updated;
  }

  public async createWalkIn(
    covers: number, 
    service: 'lunch' | 'dinner' | 'drinks', 
    timeSlot: string, 
    notes?: string,
    date?: string
  ): Promise<Booking> {
    const walkIn = bookingMockService.createWalkIn(covers, service, timeSlot, notes, date);
    if (db) {
      try {
        const docRef = doc(db, `users/${this.uid}/venues/${this.venueId}/bookings/${walkIn.id}`);
        await setDoc(docRef, walkIn);
      } catch (e) {
        console.warn('Firestore walk-in sync:', e);
      }
    }
    return walkIn;
  }

  public getAvailableSlots(date: string, covers: number, serviceFilter?: 'lunch' | 'dinner'): SlotAvailability[] {
    return bookingMockService.getAvailableSlots(date, covers, serviceFilter);
  }

  public getDayMetrics(date: string): DayCapacitySummary {
    return bookingMockService.getDayMetrics(date);
  }

  public resetDemoData(): void {
    bookingMockService.resetToSeedData();
  }
}

export const bookingService = new BookingService();
