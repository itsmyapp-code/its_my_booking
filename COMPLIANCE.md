# UK GDPR & Architectural Compliance Standard (`COMPLIANCE.md`)
**Platform Domain:** `developer.itsmyapp.co.uk`  
**Application:** `itsmybooking` (`itsmyapp/itsmybooking`)  
**Version:** 1.0.0 (ScaleBanana Prototype Standard)

---

## 1. UK GDPR & Data Privacy Mandate

### 1.1 Zero Persistent Tracking Cookies & Telemetry
- **No Third-Party Analytics:** The application runtime contains zero Google Analytics, Meta Pixel, Hotjar, or third-party tracking scripts.
- **Cookie-Free Edge Serving:** Assets and client scripts are distributed via Edge CDN without tracking headers.

### 1.2 Automated 30-Day Data Retention & Purge Policy
- **Purpose Limitation:** Customer PII (Full Name, UK Phone Number, Email, Dietary and Special Request notes) is gathered solely for managing table reservations and kitchen allergen pacing.
- **Retention Lifecycle:** All completed, cancelled, or no-show bookings are marked for automatic deletion 30 days post-reservation date.
- **Explicit Agreement:** Before reservation submission, guests must explicitly confirm the mandatory 30-day retention consent checkbox.

### 1.3 Unbundled Marketing Consent
- **Granular Consent:** Marketing & seasonal menu updates are decoupled from the reservation transaction.
- **Unchecked by Default:** Marketing opt-in checkboxes MUST remain unchecked by default.
- **Single-Tap Opt-Out:** Clear unsubscribe mechanism compliant with UK PECR guidelines.

---

## 2. UK Localization Standards
- **Language & Spelling:** British English (`cancelled`, `orchestration`, `dietary requirements`, `licence`).
- **Currency:** Pound Sterling (`GBP £`).
- **Date Formatting:** `DD/MM/YYYY` strictly enforced across UI, calendar pickers, and storage payloads.
- **Phone Validation:** UK Mobile (`+44 7xxx xxx xxx` / `07xxx xxxxxx`) and Landline (`01/02/03`) standard formatting.

---

## 3. WCAG 2.1 Level AA/AAA Accessibility
- **Contrast Ratios:** Minimum 7:1 contrast ratio across all primary dark UI surfaces (`#09090b`, `#171717`, `#ffffff`, `#34d399`).
- **Touch Targets:** Minimum $\ge 44\text{px}$ touch and click targets across all mobile and tablet viewport surfaces.
- **Keyboard Navigation:** Distinct, visible focus rings (`focus-visible: outline 2px solid #34d399`).
- **Screen Reader Support:** Form inputs include semantic labels and ARIA attributes.

---

## 4. Architecture & Data Persistence Layer
- **Client-Side Firebase SDK:** Scoped under authenticated UID paths:
  `users/{uid}/venues/{venueId}/bookings/{bookingId}`
- **Zero Custom SSR API Routes:** All data mutations execute directly client-side via Firebase Client SDK with offline IndexedDB/local cache persistence.
- **Fallback Resilience:** `bookingMockService` ensures immediate out-of-the-box local storage preview capability without requiring environment variables.
