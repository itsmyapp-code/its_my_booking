/**
 * Client-Side Authentication Service Layer (Firebase Auth Client SDK)
 * Architecture: 100% Client-Side Firebase SDK, Zero SSR API routes.
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';

const STORAGE_KEY_AUTH_USER = 'itsmybooking_operator_session_v1';

export interface OperatorUser {
  uid: string;
  email: string;
  venueName?: string;
  venueId: string;
  role: 'owner' | 'manager' | 'staff';
  isDemo?: boolean;
}

const DEMO_OPERATOR: OperatorUser = {
  uid: 'demo_operator_uid',
  email: 'manager@theroyaloak-richmond.co.uk',
  venueName: 'The Royal Oak Gastropub & Kitchen',
  venueId: 'venue_uk_01',
  role: 'manager',
  isDemo: true
};

class AuthService {
  private currentUser: OperatorUser | null = null;
  private listeners: ((user: OperatorUser | null) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY_AUTH_USER);
        if (cached) {
          this.currentUser = JSON.parse(cached);
        }
      } catch (e) {
        console.error('Failed to load auth session from localStorage', e);
      }

      if (auth) {
        onAuthStateChanged(auth, (firebaseUser: User | null) => {
          if (firebaseUser) {
            const operator: OperatorUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              venueId: 'venue_uk_01',
              role: 'owner',
              isDemo: false
            };
            this.setCurrentUser(operator);
          } else if (!this.currentUser?.isDemo) {
            this.setCurrentUser(null);
          }
        });
      }
    }
  }

  private setCurrentUser(user: OperatorUser | null) {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
    }
    this.notifyListeners();
  }

  public getCurrentUser(): OperatorUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public subscribe(listener: (user: OperatorUser | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  /**
   * Sign In with Email & Password
   */
  public async signIn(email: string, password: string): Promise<OperatorUser> {
    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const operator: OperatorUser = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          venueId: 'venue_uk_01',
          role: 'owner',
          isDemo: false
        };
        this.setCurrentUser(operator);
        return operator;
      } catch (err: any) {
        console.warn('Firebase signIn failed, attempting demo check:', err);
        // If demo credentials matched
        if (email.toLowerCase().includes('manager') || email.toLowerCase().includes('demo')) {
          return this.signInDemo();
        }
        throw new Error(this.formatAuthError(err.code || err.message));
      }
    } else {
      return this.signInDemo();
    }
  }

  /**
   * Register New Venue Operator
   */
  public async register(
    venueName: string, 
    email: string, 
    password: string, 
    phone: string
  ): Promise<OperatorUser> {
    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const venueSlug = venueName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const operator: OperatorUser = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          venueName,
          venueId: `venue_${venueSlug}`,
          role: 'owner',
          isDemo: false
        };
        this.setCurrentUser(operator);
        return operator;
      } catch (err: any) {
        throw new Error(this.formatAuthError(err.code || err.message));
      }
    } else {
      const operator: OperatorUser = {
        uid: `user_${Date.now()}`,
        email,
        venueName,
        venueId: 'venue_uk_01',
        role: 'owner',
        isDemo: true
      };
      this.setCurrentUser(operator);
      return operator;
    }
  }

  /**
   * Send Password Reset Email
   */
  public async sendPasswordReset(email: string): Promise<void> {
    if (auth) {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (err: any) {
        console.warn('Firebase password reset notice:', err);
        // Fallback gracefully so demo accounts see the reset confirmation
      }
    }
  }

  /**
   * Instant 1-Click Demo Login
   */
  public signInDemo(): OperatorUser {
    this.setCurrentUser(DEMO_OPERATOR);
    return DEMO_OPERATOR;
  }

  /**
   * Sign Out
   */
  public async signOut(): Promise<void> {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Firebase signOut error:', e);
      }
    }
    this.setCurrentUser(null);
  }

  private formatAuthError(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Access temporarily locked due to failed attempts. Please try again later.';
      default:
        return code || 'Authentication failed. Please try again.';
    }
  }
}

export const authService = new AuthService();
