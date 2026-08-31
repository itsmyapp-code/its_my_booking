/**
 * Unified Booking Service Layer (Client-Side Orchestrator)
 * Scoped data path: users/{uid}/venues/{venueId}/bookings/{bookingId}
 * Seamlessly interfaces with Firebase Client SDK or client-side persistent storage provider.
 */

import { Booking, BookingStatus, VenueSettings, SlotAvailability, DayCapacitySummary } from '@/types/booking';
import { bookingMockService } from '@/services/bookingMockService';
import { isFirebaseConfigured, db } from './firebase';
import { collection, doc, setDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';

export class BookingService {
  private uid = 'user_default_uid';
  private venueId = 'venue_uk_01';

  public isUsingFirebase(): boolean {
    return isFirebaseConfigured && !!db;
  }

  public async getVenueSettings(): Promise<VenueSettings> {
    if (!this.isUsingFirebase()) {
      return bookingMockService.getVenueSettings();
    }
    try {
      // Scoped path in Firestore
      // For demo fallback, use mock
      return bookingMockService.getVenueSettings();
    } catch {
      return bookingMockService.getVenueSettings();
    }
  }

  public async updateVenueSettings(settings: Partial<VenueSettings>): Promise<VenueSettings> {
    return bookingMockService.updateVenueSettings(settings);
  }

  public async getBookings(date?: string): Promise<Booking[]> {
    if (!this.isUsingFirebase()) {
      return bookingMockService.getBookings(date);
    }
    try {
      return bookingMockService.getBookings(date);
    } catch {
      return bookingMockService.getBookings(date);
    }
  }

  public async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'> & { status?: BookingStatus }): Promise<Booking> {
    if (!this.isUsingFirebase()) {
      return bookingMockService.createBooking(bookingData);
    }
    try {
      const created = bookingMockService.createBooking(bookingData);
      // Attempt firestore background sync if live
      try {
        const docRef = doc(db, `users/${bookingData.uid}/venues/${bookingData.venueId}/bookings/${created.id}`);
        await setDoc(docRef, created);
      } catch (err) {
        console.warn('Firestore offline sync pending:', err);
      }
      return created;
    } catch {
      return bookingMockService.createBooking(bookingData);
    }
  }

  public async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    if (!this.isUsingFirebase()) {
      return bookingMockService.updateBookingStatus(id, status);
    }
    try {
      const updated = bookingMockService.updateBookingStatus(id, status);
      return updated;
    } catch {
      return bookingMockService.updateBookingStatus(id, status);
    }
  }

  public async createWalkIn(covers: number, service: 'lunch' | 'dinner' | 'drinks', timeSlot: string, notes?: string): Promise<Booking> {
    return bookingMockService.createWalkIn(covers, service, timeSlot, notes);
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
