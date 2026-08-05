import path from 'node:path';

export const merchantAuthStatePath = path.resolve(
  process.cwd(),
  'playwright',
  '.auth',
  'test-shop.json'
);
