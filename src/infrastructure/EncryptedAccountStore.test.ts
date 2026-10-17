// @vitest-environment node
import { EncryptedAccountStore } from './EncryptedAccountStore';
import { WebCryptoAccountProtection } from './WebCryptoAccountProtection';
describe('FR-018 apertura IndexedDB', () => {
  afterEach(() => vi.useRealTimers());
  it('vence a 5000, cierra success tardío y no escribe', async () => {
    vi.useFakeTimers();
    const request = {} as IDBOpenDBRequest;
    const open = vi.fn(() => request);
    const store = new EncryptedAccountStore(new WebCryptoAccountProtection(), {
      open,
    } as unknown as IDBFactory);
    const result = store.read().catch(() => 'unavailable');
    await vi.advanceTimersByTimeAsync(4999);
    let settled = false;
    void result.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toBe('unavailable');
    const close = vi.fn();
    Object.defineProperty(request, 'result', { value: { close } });
    request.onsuccess?.({} as Event);
    expect(close).toHaveBeenCalledOnce();
  });
  it('rechaza error inmediato y aborta upgrade de intento vencido', async () => {
    vi.useFakeTimers();
    const request = {} as IDBOpenDBRequest;
    const store = new EncryptedAccountStore(new WebCryptoAccountProtection(), {
      open: () => request,
    } as unknown as IDBFactory);
    const result = store.read().catch(() => 'unavailable');
    await vi.advanceTimersByTimeAsync(5000);
    expect(await result).toBe('unavailable');
    const abort = vi.fn();
    Object.defineProperty(request, 'transaction', { value: { abort } });
    request.onupgradeneeded?.({} as IDBVersionChangeEvent);
    expect(abort).toHaveBeenCalledOnce();
  });
  it('fallo al abrir no se convierte en colección vacía', async () => {
    const store = new EncryptedAccountStore(new WebCryptoAccountProtection(), {
      open: () => {
        throw new Error('denied');
      },
    } as unknown as IDBFactory);
    await expect(store.read()).rejects.toThrow();
  });
});

// Doble de IndexedDB para contratos deterministas; navegador real validado aparte en Playwright.
import { IDBFactory as MemoryIDBFactory } from 'fake-indexeddb';
import type { RegisteredAccount } from '@/domain/registration';
async function prepared() {
  const factory = new MemoryIDBFactory();
  const protection = new WebCryptoAccountProtection();
  const store = new EncryptedAccountStore(protection, factory);
  const password = crypto.randomUUID();
  const account: RegisteredAccount = {
    displayName: 'Ana María',
    normalizedEmail: 'ana@example.test',
    passwordVerifier: await protection.derive(password),
  };
  return { factory, store, account };
}
async function alter(factory: IDBFactory, modify: (row: Record<string, unknown>) => void) {
  const db = await new Promise<IDBDatabase>((resolve) => {
    const req = factory.open('kynwallet-demo', 1);
    req.onsuccess = () => resolve(req.result);
  });
  const tx = db.transaction('vault', 'readwrite');
  const object = tx.objectStore('vault');
  const req = object.get('accounts');
  req.onsuccess = () => {
    const row = req.result as Record<string, unknown>;
    modify(row);
    object.put(row, 'accounts');
  };
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(new Error('abort'));
  });
  db.close();
}
describe('FR-007,008,017 almacenamiento transaccional', () => {
  it('lee vacío, conserva después de reapertura y rechaza duplicado', async () => {
    const { store, factory, account } = await prepared();
    expect(await store.read()).toEqual([]);
    expect(await store.add(account)).toBe('success');
    expect(
      await new EncryptedAccountStore(new WebCryptoAccountProtection(), factory).read(),
    ).toEqual([account]);
    expect(await store.add(account)).toBe('duplicate');
  });
  it('concurrencia evita duplicación y conserva altas distintas', async () => {
    const { store, account } = await prepared();
    const results = await Promise.all([store.add(account), store.add(account)]);
    expect(results.sort()).toEqual(['duplicate', 'success']);
    const second = { ...account, normalizedEmail: 'second@example.test' };
    const third = { ...account, normalizedEmail: 'third@example.test' };
    expect(await Promise.all([store.add(second), store.add(third)])).toEqual([
      'success',
      'success',
    ]);
    expect(await store.read()).toHaveLength(3);
  });
  it.each(['schemaVersion', 'revision', 'encryptionKey'])(
    'rechaza fila dañada %s sin reiniciarla',
    async (field) => {
      const { factory, store, account } = await prepared();
      await store.add(account);
      await alter(factory, (row) => {
        if (field === 'encryptionKey') Reflect.deleteProperty(row, field);
        else row[field] = -1;
      });
      await expect(store.read()).rejects.toThrow();
      await expect(
        store.add({ ...account, normalizedEmail: 'other@example.test' }),
      ).rejects.toThrow();
    },
  );
  it('rechaza ciphertext manipulado', async () => {
    const { factory, store, account } = await prepared();
    await store.add(account);
    await alter(factory, (row) => {
      const envelope = row.envelope as { ciphertext: ArrayBuffer };
      const bytes = new Uint8Array(envelope.ciphertext);
      bytes[0] = (bytes[0] ?? 0) ^ 1;
      envelope.ciphertext = bytes.buffer;
    });
    await expect(store.read()).rejects.toThrow();
  });
});

import { IDBDatabase as MemoryIDBDatabase } from 'fake-indexeddb';
it('FR-018 apertura con error inmediato y versionchange cierra conexión', async () => {
  const request = {} as IDBOpenDBRequest;
  const store = new EncryptedAccountStore(new WebCryptoAccountProtection(), {
    open: () => request,
  } as unknown as IDBFactory);
  const result = store.read().catch(() => 'unavailable');
  request.onerror?.({} as Event);
  expect(await result).toBe('unavailable');
  const factory = new MemoryIDBFactory();
  const original = factory.open.bind(factory);
  let db: IDBDatabase | undefined;
  vi.spyOn(factory, 'open').mockImplementation((...args) => {
    const req = original(...args);
    req.addEventListener('success', () => {
      db = req.result;
    });
    return req;
  });
  await new EncryptedAccountStore(new WebCryptoAccountProtection(), factory).read();
  const close = vi.spyOn(db as IDBDatabase, 'close');
  (db as IDBDatabase).onversionchange?.({} as IDBVersionChangeEvent);
  expect(close).toHaveBeenCalled();
});
it.each(['readonly', 'readwrite'] as const)(
  'FR-018 abort de %s es fallo sin éxito',
  async (mode) => {
    const { store, account } = await prepared();
    const original = MemoryIDBDatabase.prototype.transaction;
    const spy = vi.spyOn(MemoryIDBDatabase.prototype, 'transaction').mockImplementation(function (
      this: IDBDatabase,
      ...args: Parameters<IDBDatabase['transaction']>
    ) {
      const tx = original.apply(this, args);
      if (args[1] === mode) queueMicrotask(() => tx.abort());
      return tx;
    });
    try {
      await expect(mode === 'readonly' ? store.read() : store.add(account)).rejects.toThrow();
    } finally {
      spy.mockRestore();
    }
  },
);
