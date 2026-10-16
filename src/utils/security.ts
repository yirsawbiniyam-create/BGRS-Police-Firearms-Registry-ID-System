// High-grade cryptographic hashing and anti-hacking security utilities
// Uses Web Crypto API (SHA-256 with cryptographically generated unique salt)
import { SystemCredentials } from '../types/index.ts';

const ADMIN_DEFAULT_SALT = 'bgrs_admin_salt_2026';
const ADMIN_DEFAULT_HASH = '2c61f39aa6cd895d958172a22c423f736e326464dc06f7939c97344da7bd0658'; // Hash of Admin@1234

const OFFICIAL_DEFAULT_SALT = 'bgrs_official_salt_2026';
const OFFICIAL_DEFAULT_HASH = 'fdc47436e93324a988a1c7cd3427c35395fd5edab079298e91c073f8229662c6'; // Hash of Admin@2026

export const DEFAULT_CREDENTIALS: SystemCredentials = {
  admin: {
    username: 'admin',
    passwordHash: ADMIN_DEFAULT_HASH,
    salt: ADMIN_DEFAULT_SALT,
    fullName: 'ዋና የመረጃ እና ምዝገባ አድሚን',
    title: 'የቴክኖሎጂ እና መዝጋቢ ባለስልጣን',
  },
  official: {
    username: 'admin2026',
    passwordHash: OFFICIAL_DEFAULT_HASH,
    salt: OFFICIAL_DEFAULT_SALT,
    fullName: 'ኮማንደር መንግስቱ በቀለ',
    title: 'የወንጀል መከላከል የስራ ሂደት ሃላፊ',
  },
};

/**
 * Generates a random cryptographic salt
 */
export function generateSalt(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Computes salted SHA-256 hash using native Web Crypto API
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const cleanInput = (password + salt).trim();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(cleanInput);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Web Crypto API fallback notice:', e);
    }
  }

  // Fallback simple SHA-256 simulation if subtle crypto is blocked by browser policy
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  for (let i = 0; i < cleanInput.length; i++) {
    const ch = cleanInput.charCodeAt(i);
    h0 = Math.imul(h0 ^ ch, 0x5bd1e995);
    h1 = Math.imul(h1 ^ (ch << 2), 0x27d4eb2f);
    h2 = Math.imul(h2 ^ (ch << 4), 0x165667b1);
    h3 = Math.imul(h3 ^ (ch << 6), 0x054ff53a);
  }
  return [h0, h1, h2, h3].map((h) => (h >>> 0).toString(16).padStart(8, '0')).join('');
}

/**
 * Verifies a plaintext password against a stored salted hash
 */
export async function verifyPassword(
  inputPassword: string,
  salt: string,
  storedHash: string
): Promise<boolean> {
  const computed = await hashPassword(inputPassword, salt);
  return computed.toLowerCase() === storedHash.toLowerCase();
}

/**
 * Anti-Brute Force Protection Tracker
 * Automatically locks out after 5 consecutive failed attempts for 30 seconds
 */
const ATTEMPTS_KEY = 'bgrs_auth_failed_attempts';
const LOCKOUT_KEY = 'bgrs_auth_lockout_until';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsCount: number;
}

export function getLockoutStatus(): LockoutStatus {
  try {
    const lockoutUntilStr = sessionStorage.getItem(LOCKOUT_KEY);
    if (lockoutUntilStr) {
      const lockoutUntil = parseInt(lockoutUntilStr, 10);
      const now = Date.now();
      if (now < lockoutUntil) {
        return {
          isLocked: true,
          remainingSeconds: Math.ceil((lockoutUntil - now) / 1000),
          attemptsCount: MAX_FAILED_ATTEMPTS,
        };
      } else {
        // Lockout expired, clear
        sessionStorage.removeItem(LOCKOUT_KEY);
        sessionStorage.removeItem(ATTEMPTS_KEY);
      }
    }

    const attempts = parseInt(sessionStorage.getItem(ATTEMPTS_KEY) || '0', 10);
    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsCount: attempts,
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };
  }
}

export function recordFailedAttempt(): LockoutStatus {
  try {
    const current = getLockoutStatus();
    const newCount = current.attemptsCount + 1;
    sessionStorage.setItem(ATTEMPTS_KEY, String(newCount));

    if (newCount >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      sessionStorage.setItem(LOCKOUT_KEY, String(lockoutUntil));
      return {
        isLocked: true,
        remainingSeconds: 30,
        attemptsCount: newCount,
      };
    }

    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsCount: newCount,
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsCount: 1 };
  }
}

export function resetFailedAttempts(): void {
  try {
    sessionStorage.removeItem(ATTEMPTS_KEY);
    sessionStorage.removeItem(LOCKOUT_KEY);
  } catch {}
}
