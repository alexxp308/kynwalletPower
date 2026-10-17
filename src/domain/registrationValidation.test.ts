import { validateRegistration } from './registrationValidation';
const input = () => ({
  displayName: 'Ana María',
  email: 'ana@example.test',
  password: String(crypto.randomUUID()),
  confirmation: '',
  termsAccepted: true,
});
describe('FR-002–006 validación Registro', () => {
  it('rechaza cinco controles vacíos', () => {
    expect(
      Object.keys(
        validateRegistration({
          displayName: ' ',
          email: ' ',
          password: '',
          confirmation: '',
          termsAccepted: false,
        }),
      ),
    ).toHaveLength(5);
  });
  it('acepta nombre/correo normalizados y contraseña exacta', () => {
    const a = input();
    a.confirmation = a.password;
    expect(
      validateRegistration({ ...a, displayName: '  Ana O’Neill  ', email: ' ANA@EXAMPLE.TEST ' }),
    ).toEqual({});
  });
  it.each([1, 7, 129])('rechaza longitud contraseña %i', (n) => {
    const a = input();
    a.password = 'x'.repeat(n);
    a.confirmation = a.password;
    expect(validateRegistration(a).password).toBeTruthy();
  });
  it.each([8, 128])('admite longitud contraseña %i', (n) => {
    const a = input();
    a.password = 'x'.repeat(n);
    a.confirmation = a.password;
    expect(validateRegistration(a)).toEqual({});
  });
  it('exige dos palabras y máximo 80 caracteres', () => {
    const a = input();
    expect(validateRegistration({ ...a, displayName: 'Ana' }).displayName).toBeTruthy();
    expect(validateRegistration({ ...a, displayName: 'x'.repeat(81) }).displayName).toBeTruthy();
  });
  it('comprueba correo, términos y coincidencia', () => {
    const a = input();
    expect(
      validateRegistration({ ...a, email: 'ana@', confirmation: 'otro', termsAccepted: false }),
    ).toMatchObject({
      email: expect.any(String),
      confirmation: expect.any(String),
      termsAccepted: expect.any(String),
    });
  });
});

it('FR-002 rechaza correo mayor de 254 caracteres', () => {
  const a = input();
  expect(validateRegistration({ ...a, email: 'x'.repeat(250) + '@example.test' }).email).toBe(
    'El correo debe tener como máximo 254 caracteres',
  );
});
