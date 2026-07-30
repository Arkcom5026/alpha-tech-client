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

const walkFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(absolutePath) : [absolutePath];
  });
};

describe('StockItem legacy API facade retirement contract', () => {
  it('removes the retired broad StockItem API facade', () => {
    expect(fs.existsSync(retiredFacadePath)).toBe(false);
  });

  it('prevents source consumers from importing the retired facade path', () => {
    const sourceFiles = walkFiles(sourceRoot).filter((filePath) => /\.(js|jsx|ts|tsx)$/.test(filePath));
    const violations = sourceFiles
      .map((filePath) => ({
        filePath,
        content: fs.readFileSync(filePath, 'utf8'),
      }))
      .filter(({ content }) =>
        /(?:from\s+['"][^'"]*stockItem\/api\/stockItemApi['"]|import\s*\(\s*['"][^'"]*stockItem\/api\/stockItemApi['"]\s*\))/.test(content)
      )
      .map(({ filePath }) => path.relative(projectRoot, filePath));

    expect(violations).toEqual([]);
  });

  it('keeps runtime consumers on owned StockItem slice boundaries', () => {
    const storePath = path.join(sourceRoot, 'features', 'stockItem', 'store', 'stockItemStore.js');
    const storeSource = fs.readFileSync(storePath, 'utf8');

    expect(storeSource).toContain("from '../receive/store/createStockItemReceiveSlice'");
    expect(storeSource).toContain('createStockItemReceiveSlice');
    expect(storeSource).toContain("from '../search'");
    expect(storeSource).toContain("from '../availability'");
    expect(storeSource).toContain("from '../sold'");
    expect(storeSource).not.toContain('../api/stockItemApi');
  });
});
