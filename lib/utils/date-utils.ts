// # START OF Date Utilities - Safe date formatting utilities
// Purpose: Provide safe date formatting functions that handle Date objects, strings, arrays, and invalid dates
// Dependencies: date-fns format, date-fns/locale
// Returns: Formatted date strings with proper error handling

import { format, isValid, parseISO, type Locale } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Converts a date value (Date, string, or number) to a Date object
 * Returns null if the date is invalid
 */
export function toDate(value: Date | string | number | null | undefined): Date | null {
  if (!value) return null;
  
  // If already a Date object, check if valid
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  
  // If string, try to parse
  if (typeof value === "string") {
    // Try ISO format first
    try {
      const isoDate = parseISO(value);
      if (isValid(isoDate)) return isoDate;
    } catch {
      // Fallback to new Date
    }
    
    const date = new Date(value);
    return isValid(date) ? date : null;
  }
  
  // If number (timestamp), create Date
  if (typeof value === "number") {
    const date = new Date(value);
    return isValid(date) ? date : null;
  }
  
  return null;
}

/**
 * Safely formats a date value (Date, string, or number) using date-fns format
 * Returns a fallback string if the date is invalid
 */
export function safeFormatDate(
  date: Date | string | number | null | undefined,
  formatString: string = "dd MMMM yyyy",
  options?: { locale?: Locale }
): string {
  const dateObj = toDate(date);
  
  if (!dateObj) {
    return "Tanggal tidak valid";
  }
  
  try {
    return format(dateObj, formatString, {
      locale: options?.locale || id,
      ...options,
    });
  } catch (error) {
    // Fallback to locale date string if format fails
    try {
      return dateObj.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Tanggal tidak valid";
    }
  }
}

/**
 * Interface for expiry date with percentage
 */
export interface ExpiryDateWithPercentage {
  date: Date | string;
  percentage: number;
}

/**
 * Formats an expiry date which can be a single Date, array of Dates, or array with percentage
 * Returns formatted string or object with primary and additional dates
 */
export function formatExpiryDate(
  expiryDate: 
    | Date 
    | Date[] 
    | string 
    | string[] 
    | ExpiryDateWithPercentage[]
    | null 
    | undefined,
  formatString: string = "dd MMMM yyyy",
  options?: { locale?: Locale; showMultiple?: boolean }
): string | { primary: string; additional?: string[] } {
  // Handle null/undefined
  if (!expiryDate) {
    return "Tanggal tidak valid";
  }
  
  // Check if it's an array with percentage objects
  if (Array.isArray(expiryDate) && expiryDate.length > 0 && typeof expiryDate[0] === 'object' && 'percentage' in expiryDate[0]) {
    // This is ExpiryDateWithPercentage[]
    const datesWithPercentage = expiryDate as ExpiryDateWithPercentage[];
    
    // Sort by date (earliest first)
    const sorted = datesWithPercentage
      .map(item => ({
        date: toDate(item.date),
        percentage: item.percentage,
      }))
      .filter(item => item.date !== null)
      .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());
    
    if (sorted.length === 0) {
      return "Tanggal tidak valid";
    }
    
    // Format with percentage: "40% 9-9-2028"
    const primaryDate = safeFormatDate(sorted[0].date, formatString, options);
    const primaryWithPercentage = `${Math.round(sorted[0].percentage)}% ${primaryDate}`;
    
    if (sorted.length > 1 && options?.showMultiple) {
      const additionalDates = sorted.slice(1).map(item => {
        const formatted = safeFormatDate(item.date, formatString, options);
        return `${Math.round(item.percentage)}% ${formatted}`;
      });
      return {
        primary: primaryWithPercentage,
        additional: additionalDates,
      };
    }
    
    if (sorted.length > 1) {
      return `${primaryWithPercentage} (+${sorted.length - 1} lainnya)`;
    }
    
    return primaryWithPercentage;
  }
  
  // Handle regular Date or Date[] (backward compatibility)
  // Convert to array if single value
  const dates = Array.isArray(expiryDate) ? expiryDate : [expiryDate];
  
  // Convert all to Date objects and filter invalid ones
  const validDates = dates
    .map(date => toDate(date))
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime()); // Sort by earliest first
  
  if (validDates.length === 0) {
    return "Tanggal tidak valid";
  }
  
  // Format the first (earliest) date
  const primaryDate = safeFormatDate(validDates[0], formatString, options);
  
  // If there are multiple dates and showMultiple is true, return additional dates
  if (validDates.length > 1 && options?.showMultiple) {
    const additionalDates = validDates.slice(1).map(date => 
      safeFormatDate(date, formatString, options)
    );
    return {
      primary: primaryDate,
      additional: additionalDates,
    };
  }
  
  // If multiple dates but showMultiple is false, just show count
  if (validDates.length > 1) {
    return `${primaryDate} (+${validDates.length - 1} lainnya)`;
  }
  
  return primaryDate;
}

/**
 * Formats expiry dates with percentage for display
 * Returns array of formatted strings like "40% 9-9-2028"
 */
export function formatExpiryDatesWithPercentage(
  expiryDate: 
    | Date 
    | Date[] 
    | string 
    | string[] 
    | ExpiryDateWithPercentage[]
    | null 
    | undefined,
  formatString: string = "dd-MM-yyyy",
  options?: { locale?: Locale }
): string[] {
  if (!expiryDate) {
    return ["Tanggal tidak valid"];
  }
  
  // Check if it's an array with percentage objects
  if (Array.isArray(expiryDate) && expiryDate.length > 0 && typeof expiryDate[0] === 'object' && 'percentage' in expiryDate[0]) {
    const datesWithPercentage = expiryDate as ExpiryDateWithPercentage[];
    
    // Sort by date (earliest first)
    const sorted = datesWithPercentage
      .map(item => ({
        date: toDate(item.date),
        percentage: item.percentage,
      }))
      .filter(item => item.date !== null)
      .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());
    
    return sorted.map(item => {
      const formatted = safeFormatDate(item.date, formatString, options);
      return `${Math.round(item.percentage)}% ${formatted}`;
    });
  }
  
  // Handle regular Date or Date[] - calculate percentages if multiple dates
  const dates = Array.isArray(expiryDate) ? expiryDate : [expiryDate];
  const validDates = dates
    .map(date => toDate(date))
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (validDates.length === 0) {
    return ["Tanggal tidak valid"];
  }
  
  // If single date, return without percentage
  if (validDates.length === 1) {
    return [safeFormatDate(validDates[0], formatString, options)];
  }
  
  // Multiple dates without percentage info - return with equal distribution assumption
  // (This is fallback, ideally should come with percentage)
  const equalPercentage = Math.round(100 / validDates.length);
  return validDates.map((date, index) => {
    const formatted = safeFormatDate(date, formatString, options);
    // Last item gets remaining percentage
    const percentage = index === validDates.length - 1 
      ? 100 - (equalPercentage * (validDates.length - 1))
      : equalPercentage;
    return `${percentage}% ${formatted}`;
  });
}

/**
 * Formats a date with time
 */
export function safeFormatDateTime(
  date: Date | string | number | null | undefined,
  formatString: string = "dd MMMM yyyy HH:mm",
  options?: { locale?: Locale }
): string {
  return safeFormatDate(date, formatString, options);
}

/**
 * Extracts Date objects from expiryDate regardless of format
 * Handles: Date, Date[], or Array<{ date: Date | string; percentage: number }>
 * Returns array of valid Date objects
 */
export function extractExpiryDates(
  expiryDate: 
    | Date 
    | Date[] 
    | string 
    | string[] 
    | ExpiryDateWithPercentage[]
    | null 
    | undefined
): Date[] {
  if (!expiryDate) {
    return [];
  }
  
  // Check if it's an array with percentage objects
  if (Array.isArray(expiryDate) && expiryDate.length > 0 && typeof expiryDate[0] === 'object' && 'percentage' in expiryDate[0]) {
    // This is ExpiryDateWithPercentage[]
    const datesWithPercentage = expiryDate as ExpiryDateWithPercentage[];
    return datesWithPercentage
      .map(item => toDate(item.date))
      .filter((date): date is Date => date !== null);
  }
  
  // Handle regular Date or Date[]
  const dates = Array.isArray(expiryDate) ? expiryDate : [expiryDate];
  return dates
    .map(date => toDate(date))
    .filter((date): date is Date => date !== null);
}

// # END OF Date Utilities

