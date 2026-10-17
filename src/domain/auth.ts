export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResult =
  | { kind: 'success'; displayName: string }
  | { kind: 'invalid-credentials' }
  | { kind: 'unavailable' };

export type DemoAccount = {
  email: string;
  password: string;
  displayName: string;
};

export type InitialAccountConfig =
  { kind: 'absent' } | { kind: 'valid'; accounts: DemoAccount[] } | { kind: 'invalid' };
