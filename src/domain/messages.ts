/** Textos visibles para el usuario. Fuente única (Constitución, Principio IV). */
export const MESSAGES = {
  EMAIL_REQUIRED: 'Ingresa tu correo electrónico',
  EMAIL_INVALID: 'Ingresa un correo electrónico válido',
  PASSWORD_REQUIRED: 'Ingresa tu contraseña',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORD_TOO_LONG: 'La contraseña no puede superar 128 caracteres',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  UNAVAILABLE: 'Servicio de acceso no disponible. Intenta más tarde.',
  FEATURE_UNAVAILABLE: 'Función no disponible en esta demostración',
} as const;

export const REGISTRATION_MESSAGES = {
  NAME_REQUIRED: 'Ingresa tu nombre completo',
  NAME_LONG: 'El nombre debe tener como máximo 80 caracteres',
  NAME_WORDS: 'Ingresa al menos tu nombre y un apellido',
  EMAIL_REQUIRED: MESSAGES.EMAIL_REQUIRED,
  EMAIL_INVALID: MESSAGES.EMAIL_INVALID,
  EMAIL_LONG: 'El correo debe tener como máximo 254 caracteres',
  PASSWORD_REQUIRED: MESSAGES.PASSWORD_REQUIRED,
  PASSWORD_SHORT: MESSAGES.PASSWORD_TOO_SHORT,
  PASSWORD_LONG: 'La contraseña debe tener como máximo 128 caracteres',
  CONFIRM_REQUIRED: 'Confirma tu contraseña',
  CONFIRM_MISMATCH: 'Las contraseñas no coinciden',
  TERMS_REQUIRED: 'Debes aceptar los términos y condiciones',
  DUPLICATE: 'Este correo ya está registrado',
  UNAVAILABLE: 'No se pudo completar el registro. Intenta de nuevo.',
  SUCCESS: 'Cuenta creada correctamente. Ya puedes iniciar sesión',
} as const;
