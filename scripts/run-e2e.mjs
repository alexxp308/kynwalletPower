import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
/** @type {NodeJS.ProcessEnv} */
const env = { ...process.env };
for (const key of Object.keys(env)) if (key.startsWith('VITE_')) Reflect.deleteProperty(env, key);
const seed = {
  email: `seed-${randomUUID()}@example.test`,
  password: randomUUID(),
  displayName: 'Cuenta Inicial',
};
env.E2E_SEED = JSON.stringify(seed);
/** @param {string[]} args @param {NodeJS.ProcessEnv} childEnv */
function run(args, childEnv) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env: childEnv, stdio: 'inherit' });
    const stop = () => {
      child.kill('SIGTERM');
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    child.on('error', reject);
    child.on('exit', (code) => {
      process.removeListener('SIGINT', stop);
      process.removeListener('SIGTERM', stop);
      if (code === 0) resolve(undefined);
      else reject(new Error('El proceso de pruebas terminó con error'));
    });
  });
}
try {
  for (const variant of ['empty', 'seeded']) {
    const buildEnv = { ...env };
    if (variant === 'seeded') buildEnv.VITE_DEMO_USERS = JSON.stringify([seed]);
    await run(
      [
        'node_modules/vite/bin/vite.js',
        'build',
        '--mode',
        `e2e-${variant}`,
        '--outDir',
        `.tmp/e2e/${variant}/dist`,
      ],
      buildEnv,
    );
  }
  await run(['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], env);
} catch {
  process.exitCode = 1;
} finally {
  await rm('.tmp/e2e', { recursive: true, force: true });
}
