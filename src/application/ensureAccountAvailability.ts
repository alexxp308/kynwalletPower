import type { AvailabilityResult } from '@/domain/registration';
import type { SecurityEvents } from './ports/SecurityEvents';
import type { AccountAvailabilityGateway } from './ports/AccountAvailabilityGateway';
export type EnsureAccountAvailability = () => Promise<AvailabilityResult>;
export function createEnsureAccountAvailability(
  gateway: AccountAvailabilityGateway,
  events?: SecurityEvents,
): EnsureAccountAvailability {
  return async () => {
    try {
      return await gateway.ensureAvailable();
    } catch {
      events?.record({ operation: 'availability', result: 'unavailable' });
      return { kind: 'unavailable' };
    }
  };
}
