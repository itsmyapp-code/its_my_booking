/**
 * Unified Booking Service Layer (Client-Side Orchestrator)
 * Scoped data path: users/{uid}/venues/{venueId}/bookings/{bookingId}
 * Instant local cache responsiveness with background Firestore sync.
 */

import { 
  Booking, 
  BookingStatus, 
  VenueSettings, 
  SlotAvailability, 
  DayCapacitySummary, 
  ShiftOverride 
} from '@/types/booking';
import { bookingMockService } from '@/services/bookingMockService';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc 
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
    if (db) {
      // Background sync from firestore
      this.getVenueSettingsDocRef() && getDoc(this.getVenueSettingsDocRef()!)
        .then((snap) => {
          if (snap.exists()) {
            bookingMockService.updateVenueSettings(snap.data() as VenueSettings);
          }
        })
        .catch(() => {});
    }
    return local;
  }

  public async updateVenueSettings(settings: Partial<VenueSettings>): Promise<VenueSettings> {
    const updated = bookingMockService.updateVenueSettings(settings);
    if (db) {
      try {
        const docRef = this.getVenueSettingsDocRef();
        if (docRef) {
          setDoc(docRef, updated, { merge: true }).catch(() => {});
        }
      } catch (e) {
        console.warn('Firestore settings write:', e);
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
          setDoc(docRef, { shiftOverrides: updated.shiftOverrides }, { merge: true }).catch(() => {});
        }
      } catch (e) {
        console.warn('Firestore shift override write:', e);
      }
    }
    return updated;
  }

  public getShiftOverride(dateUK: string): ShiftOverride | null {
    return bookingMockService.getShiftOverride(dateUK);
  }

  public async getBookings(date?: string): Promise<Booking[]> {
    // Return instant local data immediately
    const local = bookingMockService.getBookings(date);
    return local;
  }

  public async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: BookingStatus }): Promise<Booking> {
    const created = bookingMockService.createBooking(bookingData);
    if (db) {
      try {
        const docRef = doc(db, `users/${bookingData.uid || this.uid}/venues/${bookingData.venueId || this.venueId}/bookings/${created.id}`);
        setDoc(docRef, created).catch(() => {});
      } catch (err) {
        console.warn('Firestore booking write:', err);
      }
    }
    return created;
  }

  public async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const updated = bookingMockService.updateBookingStatus(id, status);
    if (db && updated) {
      try {
        const docRef = doc(db, `users/${updated.uid || this.uid}/venues/${updated.venueId || this.venueId}/bookings/${id}`);
        setDoc(docRef, { status }, { merge: true }).catch(() => {});
      } catch (e) {
        console.warn('Firestore status write:', e);
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
        setDoc(docRef, walkIn).catch(() => {});
      } catch (e) {
        console.warn('Firestore walkin write:', e);
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
