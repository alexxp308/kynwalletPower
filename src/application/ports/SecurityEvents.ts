export type SecurityEvent = {
  operation: 'register' | 'authenticate' | 'availability';
  result: 'success' | 'rejected' | 'unavailable' | 'conflict';
};
export interface SecurityEvents {
  record(event: SecurityEvent): void;
}
