import path from 'node:path';

export const saleMerchantAuthStatePath = path.resolve(
  process.cwd(),
  'playwright',
  '.auth',
  'sale-completion.json'
);
