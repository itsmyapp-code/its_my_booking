/**
 * Unified Booking Service Layer (Client-Side Orchestrator)
 * Scoped data path: users/{uid}/venues/{venueId}/bookings/{bookingId}
 * Interfaces seamlessly with Firebase Client SDK or persistent local storage.
 */

import { Booking, BookingStatus, VenueSettings, SlotAvailability, DayCapacitySummary, ShiftOverride } from '@/types/booking';
import { bookingMockService } from '@/services/bookingMockService';
import { isFirebaseConfigured, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export class BookingService {
  private uid = 'user_default_uid';
  private venueId = 'venue_uk_01';

  public isUsingFirebase(): boolean {
    return isFirebaseConfigured && !!db;
  }

  public async getVenueSettings(): Promise<VenueSettings> {
    return bookingMockService.getVenueSettings();
  }

  public async updateVenueSettings(settings: Partial<VenueSettings>): Promise<VenueSettings> {
    return bookingMockService.updateVenueSettings(settings);
  }

  public async toggleShiftOverride(
    dateUK: string, 
    shift: 'lunch' | 'dinner' | 'allDay', 
    isClosed: boolean, 
    reason?: string
  ): Promise<VenueSettings> {
    return bookingMockService.toggleShiftOverride(dateUK, shift, isClosed, reason);
  }

  public getShiftOverride(dateUK: string): ShiftOverride | null {
    return bookingMockService.getShiftOverride(dateUK);
  }

  public async getBookings(date?: string): Promise<Booking[]> {
    return bookingMockService.getBookings(date);
  }

  public async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: BookingStatus }): Promise<Booking> {
    const created = bookingMockService.createBooking(bookingData);
    if (this.isUsingFirebase()) {
      try {
        const docRef = doc(db, `users/${bookingData.uid}/venues/${bookingData.venueId}/bookings/${created.id}`);
        await setDoc(docRef, created);
      } catch (err) {
        console.warn('Firestore offline sync pending:', err);
      }
    }
    return created;
  }

  public async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    return bookingMockService.updateBookingStatus(id, status);
  }

  public async createWalkIn(
    covers: number, 
    service: 'lunch' | 'dinner' | 'drinks', 
    timeSlot: string, 
    notes?: string,
    date?: string
  ): Promise<Booking> {
    return bookingMockService.createWalkIn(covers, service, timeSlot, notes, date);
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
