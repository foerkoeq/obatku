/**
 * Utility Functions
 * Common utility functions used throughout the application
 */

import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// ID Generation
export function generateId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Date Formatting
export function formatDate(date: Date | string | null | undefined, format: string = 'YYYY-MM-DD'): string {
  if (!date) return 'Invalid Date';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return format
      .replace('YYYY', year.toString())
      .replace('MM', month.toString().padStart(2, '0'))
      .replace('DD', day.toString().padStart(2, '0'))
      .replace('HH', hours.toString().padStart(2, '0'))
      .replace('mm', minutes.toString().padStart(2, '0'))
      .replace('ss', seconds.toString().padStart(2, '0'))
      .replace('MMMM', monthNames[month - 1])
      .replace('MMM', monthAbbr[month - 1]);
  } catch {
    return 'Invalid Date';
  }
}

// Currency Formatting
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const integerPart = Math.floor(absAmount);
  const decimalPart = absAmount - integerPart;
  
  const formattedInteger = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formattedDecimal = decimalPart > 0 ? `,${Math.round(decimalPart * 100).toString().padStart(2, '0')}` : '';
  
  const result = `Rp ${formattedInteger}${formattedDecimal}`;
  return isNegative ? `-${result}` : result;
}

// Phone Number Formatting
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[\s\-+()]/g, '');
  
  if (cleaned.startsWith('62')) {
    const without62 = cleaned.substring(2);
    if (without62.length === 10) return `${without62.substring(0, 4)}-${without62.substring(4, 8)}-${without62.substring(8)}`;
    if (without62.length === 9) return `${without62.substring(0, 4)}-${without62.substring(4, 7)}-${without62.substring(7)}`;
  }
  
  if (cleaned.startsWith('0')) {
    if (cleaned.length === 11) return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
    if (cleaned.length === 10) return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  }
  
  if (cleaned.startsWith('02')) {
    if (cleaned.length === 8) return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    if (cleaned.length === 9) return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
  }
  
  return phone;
}

// NIP Formatting
export function formatNIP(nip: string | null | undefined): string {
  if (!nip || nip.length < 18) return nip || '';
  
  return nip.replace(/(\d{2})(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4 $5');
}

// Text Slugification
export function slugify(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Text Truncation
export function truncateText(text: string | null | undefined, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text || '';
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

// Random String Generation
export function generateRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

// String Hashing
export async function hashString(text: string | null | undefined): Promise<string> {
  const input = text || '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(input, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Hash Comparison
export async function compareHash(text: string | null | undefined, hash: string | null | undefined): Promise<boolean> {
  if (!text || !hash) return false;
  
  try {
    const [salt, storedHash] = hash.split(':');
    const computedHash = crypto.pbkdf2Sync(text, salt, 1000, 64, 'sha512').toString('hex');
    return storedHash === computedHash;
  } catch {
    return false;
  }
}

// Debounce Function
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle Function
export function throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Deep Clone
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

// Object Merging
export function mergeObjects<T extends Record<string, any>>(...objects: (T | null | undefined)[]): T {
  const result = {} as T;
  
  for (const obj of objects) {
    if (obj) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            result[key] = mergeObjects(result[key] || {} as T[Extract<keyof T, string>], obj[key]);
          } else {
            result[key] = obj[key];
          }
        }
      }
    }
  }
  
  return result;
}

// Object Flattening
export function flattenObject(obj: Record<string, any>, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any, index: number) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(result, flattenObject(item, `${newKey}.${index}`));
          } else {
            result[`${newKey}.${index}`] = item;
          }
        });
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  
  return result;
}

// Array Grouping
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  if (!array) return {};
  
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// Array Sorting
export function sortBy<T>(array: T[], property?: keyof T | null, compareFn?: (a: T, b: T) => number): T[] {
  if (!array) return [];
  
  if (compareFn) {
    return [...array].sort(compareFn);
  }
  
  if (property) {
    return [...array].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    });
  }
  
  return [...array];
}

// Array Filtering
export function filterBy<T>(array: T[], property?: keyof T | null, filterFn?: (item: T) => boolean): T[] {
  if (!array) return [];
  
  if (filterFn) {
    return array.filter(filterFn);
  }
  
  if (property) {
    return array.filter(item => item[property]);
  }
  
  return array;
}

// Array Pagination
export function paginateArray<T>(array: T[], page: number, pageSize: number) {
  if (!array) {
    return {
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
        pageSize,
        hasNext: false,
        hasPrev: false
      }
    };
  }
  
  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

// Percentage Calculation
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

// Decimal Rounding
export function roundToDecimal(num: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(num * multiplier) / multiplier;
}

// Indonesian Phone Validation
export function validateIndonesianPhone(phone: string): boolean {
  if (!phone) return false;
  
  const cleaned = phone.replace(/[\s\-+()]/g, '');
  
  // Mobile numbers: 08xx, 628xx
  if (cleaned.match(/^(08|628)\d{8,9}$/)) return true;
  
  // Landline: 02xx
  if (cleaned.match(/^02\d{6,7}$/)) return true;
  
  return false;
}

// Indonesian NIP Validation
export function validateIndonesianNIP(nip: string): boolean {
  if (!nip || nip.length !== 18) return false;
  return /^\d{18}$/.test(nip);
}

// OTP Generation
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return otp;
}

// Password Generation
export function generatePassword(
  length: number = 12,
  includeLowercase: boolean = true,
  includeUppercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true
): string {
  let chars = '';
  if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) chars += '0123456789';
  if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (chars === '') chars = 'abcdefghijklmnopqrstuvwxyz';
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}

// Text Encryption
export function encryptText(text: string, key: string): string {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// Text Decryption
export function decryptText(encryptedText: string, key: string): string {
  try {
    const algorithm = 'aes-256-cbc';
    const [, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipher(algorithm, key);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch {
    return '';
  }
}

// Text Compression
export async function compressText(text: string): Promise<string> {
  try {
    const buffer = Buffer.from(text, 'utf8');
    const compressed = await gzip(buffer);
    return compressed.toString('base64');
  } catch {
    return text;
  }
}

// Text Decompression
export async function decompressText(compressedText: string): Promise<string> {
  try {
    const buffer = Buffer.from(compressedText, 'base64');
    const decompressed = await gunzip(buffer);
    return decompressed.toString('utf8');
  } catch {
    return compressedText;
  }
}

// Checksum Generation
export function generateChecksum(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

// Checksum Validation
export function validateChecksum(data: string, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}
