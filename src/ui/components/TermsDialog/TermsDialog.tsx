import { useRef } from 'react';
import { Button } from '@/ui/components/Button/Button';
import styles from './TermsDialog.module.css';
export function TermsDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button variant="link" ref={trigger} onClick={() => dialog.current?.showModal()}>
        términos y condiciones
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="terms-title"
        className={styles.dialog}
        onClose={() => trigger.current?.focus()}
      >
        <h2 id="terms-title">Términos y condiciones</h2>
        <p>
          <strong>Contenido de demostración, sin validez legal</strong>
        </p>
        <p>
          Esta aplicación es un ejercicio educativo. Utiliza únicamente datos ficticios. Las cuentas
          se conservan en este navegador y no permiten realizar operaciones financieras.
        </p>
        <p>
          Al borrar los datos del sitio se perderán las cuentas de demostración. No se envía correo
          ni se crea una cuenta bancaria real.
        </p>
        <Button onClick={() => dialog.current?.close()}>Cerrar</Button>
      </dialog>
    </>
  );
}
