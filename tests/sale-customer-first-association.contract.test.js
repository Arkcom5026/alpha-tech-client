import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Sale customer first-association contract', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const sessionPath = path.join(
    root,
    'src/features/sales/create/customer/services/saleCustomerFirstAssociationSession.js'
  );
  const hydrationPath = path.join(
    root,
    'src/features/sales/create/customer/hooks/useSaleCustomerHydration.js'
  );
  const payloadPath = path.join(
    root,
    'src/features/sales/create/completion/services/saleCompletionPayload.js'
  );

  const session = fs.readFileSync(sessionPath, 'utf8');
  const hydration = fs.readFileSync(hydrationPath, 'utf8');
  const payload = fs.readFileSync(payloadPath, 'utf8');

  if (!session.includes('sessionStorage')) throw new Error('first-association evidence must remain session-scoped');
  if (!session.includes('customerId')) throw new Error('evidence must be bound to the selected customer');
  if (!hydration.includes('firstAssociationToken')) throw new Error('customer creation evidence must survive deposit hydration');
  if (!payload.includes('customerFirstAssociationToken')) throw new Error('Sale completion must submit first-association evidence');
  if (!payload.includes('readSaleCustomerFirstAssociation(customerId)')) {
    throw new Error('Sale completion must read evidence only for the selected customer');
  }
});
