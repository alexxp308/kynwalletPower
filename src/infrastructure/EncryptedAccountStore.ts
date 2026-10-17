import type { RegisteredAccount } from '@/domain/registration';
import { WebCryptoAccountProtection, type Envelope } from './WebCryptoAccountProtection';
type VaultRow = {
  schemaVersion: 1;
  revision: number;
  encryptionKey: CryptoKey;
  envelope: Envelope;
};
export interface AccountStore {
  read(): Promise<RegisteredAccount[]>;
  add(account: RegisteredAccount): Promise<'success' | 'duplicate'>;
}
/** Cifrado fuera de transacciones; commit CAS corto para evitar pérdidas entre pestañas. */
export class EncryptedAccountStore implements AccountStore {
  constructor(
    private readonly protection: WebCryptoAccountProtection,
    private readonly factory: IDBFactory = globalThis.indexedDB,
  ) {}
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.factory.open('kynwallet-demo', 1);
      let expired = false;
      const timer = setTimeout(() => {
        expired = true;
        reject(new Error('Storage unavailable'));
      }, 5000);
      request.onupgradeneeded = () => {
        if (expired) {
          request.transaction?.abort();
          return;
        }
        if (!request.result.objectStoreNames.contains('vault'))
          request.result.createObjectStore('vault');
      };
      request.onerror = () => {
        clearTimeout(timer);
        reject(new Error('Storage unavailable'));
      };
      request.onsuccess = () => {
        clearTimeout(timer);
        const db = request.result;
        if (expired) {
          db.close();
          return;
        }
        db.onversionchange = () => db.close();
        resolve(db);
      };
    });
  }
  private async row(): Promise<VaultRow | undefined> {
    const db = await this.open();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction('vault', 'readonly');
        const request = tx.objectStore('vault').get('accounts');
        tx.oncomplete = () => resolve(request.result as VaultRow | undefined);
        tx.onabort = tx.onerror = () => reject(new Error('Storage unavailable'));
      });
    } finally {
      db.close();
    }
  }
  private async decode(row: VaultRow | undefined) {
    if (row === undefined) return [];
    if (
      row.schemaVersion !== 1 ||
      !Number.isSafeInteger(row.revision) ||
      row.revision < 0 ||
      !row.envelope
    )
      throw new Error('Invalid vault');
    return this.protection.decrypt(row.encryptionKey, row.envelope);
  }
  async read() {
    return this.decode(await this.row());
  }
  private async compareAndSwap(previous: VaultRow | undefined, next: VaultRow) {
    const db = await this.open();
    try {
      return await new Promise<boolean>((resolve, reject) => {
        const tx = db.transaction('vault', 'readwrite');
        const store = tx.objectStore('vault');
        const request = store.get('accounts');
        let changed = false;
        request.onsuccess = () => {
          const current = request.result as VaultRow | undefined;
          if (
            (previous === undefined && current === undefined) ||
            (previous !== undefined &&
              current?.schemaVersion === 1 &&
              current.revision === previous.revision &&
              current.encryptionKey !== undefined)
          ) {
            store.put(next, 'accounts');
            changed = true;
          }
        };
        tx.oncomplete = () => resolve(changed);
        tx.onabort = tx.onerror = () => reject(new Error('Storage unavailable'));
      });
    } finally {
      db.close();
    }
  }
  async add(account: RegisteredAccount): Promise<'success' | 'duplicate'> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const previous = await this.row();
      const accounts = await this.decode(previous);
      if (accounts.some((a) => a.normalizedEmail === account.normalizedEmail)) return 'duplicate';
      const key = previous?.encryptionKey ?? (await this.protection.createKey());
      const envelope = await this.protection.encrypt(key, [...accounts, account]);
      const next: VaultRow = {
        schemaVersion: 1,
        revision: (previous?.revision ?? -1) + 1,
        encryptionKey: key,
        envelope,
      };
      if (await this.compareAndSwap(previous, next)) return 'success';
    }
    throw new Error('Concurrent storage unavailable');
  }
}
