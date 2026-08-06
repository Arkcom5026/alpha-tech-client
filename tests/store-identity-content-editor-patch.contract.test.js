import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'scripts/apply-store-identity-content-editor.js'), 'utf8');

const includes = (value, label) => assert.ok(script.includes(value), `${label} missing: ${value}`);

includes('partial store identity content editor detected', 'partial-state safety gate');
includes('anchor expected once', 'single-anchor safety gate');
includes('contentConfiguration: defaultContentConfiguration', 'draft content foundation');
includes('contentConfiguration: draft.contentConfiguration', 'draft payload persistence');
includes('identity: {', 'identity contract');
includes('hero: {', 'hero contract');
includes('tagline', 'store tagline field');
includes('shortDescription', 'store description field');
includes('hero?.title', 'hero title editor');
includes('hero?.description', 'hero description editor');
includes('hero?.ctaLabel', 'hero CTA editor');
includes('live hero preview', 'preview binding');

assert.doesNotMatch(script, /type="color"/, 'merchant theme controls must stay forbidden');
assert.doesNotMatch(script, /themePreset[^\n]*onChange/, 'merchant theme selection must stay forbidden');
assert.doesNotMatch(script, /fs\.writeFileSync[\s\S]*fs\.writeFileSync/, 'patch must write the editor exactly once');

console.log('store identity content editor patch contract: PASS');
