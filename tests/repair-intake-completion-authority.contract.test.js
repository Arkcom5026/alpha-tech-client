const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const panel = fs.readFileSync(
  path.join(repoRoot, 'src/features/repair/components/IntakeEvidencePanel.jsx'),
  'utf8'
);
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  panel.includes('const completion = evidence?.completion;'),
  'Evidence panel must consume server completion projection'
);
assert(
  panel.includes('completion.complete'),
  'Evidence panel must distinguish complete and incomplete intake'
);
assert(
  panel.includes('completion.missingRequirements'),
  'Evidence panel must show missing completion requirements'
);
assert(
  panel.includes('พร้อมเข้าสู่ขั้นวินิจฉัย'),
  'Evidence panel must explain when diagnosis is allowed'
);
assert(
  !panel.includes('photos.length && consent'),
  'Client must not recompute completion authority locally'
);

console.log('Repair intake completion authority client contract: PASS');
