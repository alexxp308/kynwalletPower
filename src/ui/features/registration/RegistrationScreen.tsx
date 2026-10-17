import type { ReactNode } from 'react';
import { BrandPanel } from '@/ui/layout/BrandPanel/BrandPanel';
import styles from './RegistrationScreen.module.css';
export function RegistrationScreen({ children }: { children: ReactNode }) {
  return (
    <div className={styles.screen}>
      <div className={styles.brand} data-testid="registration-brand">
        <BrandPanel variant="registration" />
      </div>
      <main className={styles.panel}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
