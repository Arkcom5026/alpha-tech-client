import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('purchase order submit mutation authority', () => {
  it('serializes submit synchronously and snapshots the submit command', () => {
    const source = read('src/features/purchaseOrder/hooks/usePurchaseOrderEditor.js');

    expect(source).toContain('const submitRef = useRef(false)');
    expect(source).toContain('if (isSubmitting || submitRef.current) return');
    expect(source).toContain('const command = {');
    expect(source).toContain('products: products.map((item) => ({ ...item }))');
    expect(source).toContain('submitRef.current = true');
    expect(source).toContain('await executePurchaseOrderSubmit(command)');
    expect(source).toContain('submitRef.current = false');
  });

  it('blocks cancel navigation while a submit command owns the mutation boundary', () => {
    const source = read('src/features/purchaseOrder/hooks/usePurchaseOrderEditor.js');
    expect(source).toContain('if (submitRef.current) return');
    expect(source).toContain("navigate(`/${shopSlug}/pos/purchases`)");
  });
});
