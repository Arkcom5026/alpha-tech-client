import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Purchase Order editor mutation authority', () => {
  it('serializes submit and freezes editor state behind a synchronous snapshot', () => {
    const editor = read('src/features/purchaseOrder/hooks/usePurchaseOrderEditor.js');

    expect(editor).toContain('const submitRef = useRef(false)');
    expect(editor).toContain('if (isSubmitting || submitRef.current) return');
    expect(editor).toContain('const submitSnapshot = {');
    expect(editor).toContain('products: products.map((item) => ({ ...item }))');
    expect(editor).toContain('submitRef.current = true');
    expect(editor).toContain('submitRef.current = false');
    expect(editor).toContain('if (submitRef.current) return;');
    expect(editor).toContain('if (submitRef.current) return null;');
  });
});
