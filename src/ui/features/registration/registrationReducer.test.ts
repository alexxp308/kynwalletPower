import { registrationReducer, initialRegistration } from './registrationReducer';
it('FR-006 blur y edición eliminan el error corregido sin perder otros campos', () => {
  let s = registrationReducer(initialRegistration, { type: 'blur', field: 'displayName' });
  expect(s.errors.displayName).toBeTruthy();
  s = registrationReducer(s, { type: 'change', field: 'displayName', value: 'Ana María' });
  expect(s.errors.displayName).toBeUndefined();
  s = registrationReducer(s, { type: 'blur', field: 'displayName' });
  expect(s.values.displayName).toBe('Ana María');
});
