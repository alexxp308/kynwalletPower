import type { AvailabilityResult } from '@/domain/registration';
export interface AccountAvailabilityGateway {
  ensureAvailable(): Promise<AvailabilityResult>;
}
