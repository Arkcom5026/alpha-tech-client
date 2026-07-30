import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, 'src');
const retiredFacadePath = path.join(
  sourceRoot,
  'features',
  'stockItem',
  'api',
  'stockItemApi.js'
);
const retiredStorePath = path.join(
  sourceRoot,
  'features',
  'stockItem',
  'store',
  'stockItemStore.js'
);

const walkFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(absolutePath) : [absolutePath];
  });
};

describe('StockItem legacy API facade retirement contract', () => {
  it('removes the retired broad StockItem API facade and compatibility store', () => {
    expect(fs.existsSync(retiredFacadePath)).toBe(false);
    expect(fs.existsSync(retiredStorePath)).toBe(false);
  });

  it('prevents source consumers from importing retired StockItem facade paths', () => {
    const sourceFiles = walkFiles(sourceRoot).filter((filePath) => /\.(js|jsx|ts|tsx)$/.test(filePath));
    const violations = sourceFiles
      .map((filePath) => ({
        filePath,
        content: fs.readFileSync(filePath, 'utf8'),
      }))
      .filter(({ content }) =>
        /(?:from\s+['"][^'"]*stockItem\/(?:api\/stockItemApi|store\/stockItemStore)['"]|import\s*\(\s*['"][^'"]*stockItem\/(?:api\/stockItemApi|store\/stockItemStore)['"]\s*\))/.test(content)
      )
      .map(({ filePath }) => path.relative(projectRoot, filePath));

    expect(violations).toEqual([]);
  });

  it('keeps runtime consumers on owned StockItem boundaries', () => {
    const receiveStorePath = path.join(
      sourceRoot,
      'features',
      'stockItem',
      'receive',
      'store',
      'useStockItemReceiveStore.js'
    );
    const receiveStoreSource = fs.readFileSync(receiveStorePath, 'utf8');

    expect(receiveStoreSource).toContain("from './createStockItemReceiveSlice'");
    expect(receiveStoreSource).toContain('createStockItemReceiveSlice');
    expect(receiveStoreSource).not.toContain('../api/stockItemApi');
    expect(receiveStoreSource).not.toContain('../../store/stockItemStore');
  });
});