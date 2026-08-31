/**
 * UK Localization Date & Time Utilities (DD/MM/YYYY and British Time)
 */

export function getTodayUKFormatted(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

export function parseUKDate(dateStr: string): Date {
  // expects DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length !== 3) return new Date();
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

export function formatUKDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function isPastUKDate(dateStr: string): boolean {
  const target = parseUKDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return target.getTime() < today.getTime();
}

export function formatISOToUK(isoString: string): string {
  try {
    const d = new Date(isoString);
    return `${formatUKDate(d)} at ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return isoString;
  }
}

/**
 * Validate UK Phone Numbers (+44 7xxx xxx xxx, 07xxx xxxxxx, +44 1xx..., 01xxx..., 020 etc.)
 */
export function validateUKPhone(phone: string): { isValid: boolean; formatted: string; error?: string } {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // UK Mobile regex (+447 or 07 followed by 9 digits) or Landline (+441, +442, +443, 01, 02, 03)
  const ukMobileRegex = /^(?:(?:\+44|0044)7\d{9}|07\d{9})$/;
  const ukLandlineRegex = /^(?:(?:\+44|0044)[12389]\d{8,9}|0[12389]\d{8,9})$/;

  if (!cleaned) {
    return { isValid: false, formatted: phone, error: 'Phone number is required' };
  }

  if (ukMobileRegex.test(cleaned) || ukLandlineRegex.test(cleaned)) {
    // Normalise to UK international or standard format
    let normalized = cleaned;
    if (normalized.startsWith('0044')) {
      normalized = '+44' + normalized.slice(4);
    } else if (normalized.startsWith('0')) {
      normalized = '+44' + normalized.slice(1);
    }
    return { isValid: true, formatted: normalized };
  }

  return { 
    isValid: false, 
    formatted: phone, 
    error: 'Please enter a valid UK phone number (e.g. 07123 456789 or +44 7123 456789)' 
  };
}
