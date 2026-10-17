import type { DemoAccount, InitialAccountConfig } from '@/domain/auth';
import { isValidEmail, isValidPasswordLength, normalizeEmail } from '@/domain/validation';

const DISPLAY_NAME_MAX_LENGTH = 80;

function toAccount(value: unknown): DemoAccount | null {
  if (typeof value !== 'object' || value === null) return null;
  const { email, password, displayName } = value as Record<string, unknown>;
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  if (typeof displayName !== 'string') return null;

  const name = displayName.trim();
  const validName = name.length >= 1 && name.length <= DISPLAY_NAME_MAX_LENGTH;
  if (!isValidEmail(email) || !isValidPasswordLength(password) || !validName) return null;

  return { email: normalizeEmail(email), password, displayName: name };
}

/**
 * Lee las cuentas de demostración de la configuración externa (VITE_DEMO_USERS).
 * Devuelve null si la configuración falta o es inválida (contracts/auth-gateway.md).
 */
export function loadDemoAccounts(raw: string | undefined): InitialAccountConfig {
  if (raw === undefined) return { kind: 'absent' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { kind: 'invalid' };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return { kind: 'invalid' };

  const accounts: DemoAccount[] = [];
  for (const item of parsed) {
    const account = toAccount(item);
    if (!account) return { kind: 'invalid' };
    accounts.push(account);
  }
  const uniqueEmails = new Set(accounts.map((account) => account.email));
  return uniqueEmails.size === accounts.length ? { kind: 'valid', accounts } : { kind: 'invalid' };
}
