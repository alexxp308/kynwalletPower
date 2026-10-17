import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createAuthenticate } from '@/application/authenticate';
import { BrowserAccountGateway } from '@/infrastructure/BrowserAccountGateway';
import { EncryptedAccountStore } from '@/infrastructure/EncryptedAccountStore';
import { WebCryptoAccountProtection } from '@/infrastructure/WebCryptoAccountProtection';
import { createRegisterAccount } from '@/application/registerAccount';
import { createEnsureAccountAvailability } from '@/application/ensureAccountAvailability';
import { loadDemoAccounts } from '@/infrastructure/loadDemoAccounts';
import '@/ui/styles/tokens.css';
import '@/ui/styles/global.css';
import { App } from './App';

// Raíz de composición: único lugar que conoce las implementaciones concretas (Constitución 2.5).
const accounts = loadDemoAccounts(import.meta.env.VITE_DEMO_USERS);
const protection = new WebCryptoAccountProtection();
const store = new EncryptedAccountStore(protection);
const events = {
  record: (event: { operation: string; result: string }) => {
    window.dispatchEvent(new CustomEvent('kynwallet:security', { detail: event }));
  },
};
const gateway = new BrowserAccountGateway(accounts, store, protection, events);
const authenticate = createAuthenticate(gateway);
const register = createRegisterAccount(gateway, events);
const ensureAvailable = createEnsureAccountAvailability(gateway, events);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App authenticate={authenticate} register={register} ensureAvailable={ensureAvailable} />
    </StrictMode>,
  );
}
