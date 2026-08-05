import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assertIncludes = (source, value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};
const assertExcludes = (source, value, message) => {
  if (source.includes(value)) throw new Error(message || `Expected source to exclude: ${value}`);
};

const header = read('src/features/pos/components/header/HeaderPos.jsx');
const shell = read('src/features/pos/layouts/PosAdaptiveShell.jsx');

assertIncludes(header, "const DEFAULT_MOBILE_NAV_IDS = ['purchases', 'sales', 'services', 'stock', 'finance']", 'Mobile primary navigation must default to frequently used modules');
assertIncludes(header, 'MOBILE_NAV_PREFERENCE_PREFIX', 'Mobile menu visibility must have persistent preference authority');
assertIncludes(header, 'mobilePreferenceOwner', 'Mobile menu preferences must be scoped per user');
assertIncludes(header, 'toggleMobileNavItem', 'Users must be able to show or hide primary modules');
assertIncludes(header, 'resetMobileNavItems', 'Users must be able to restore default mobile modules');
assertIncludes(header, 'onMobileModuleSelect?.(item)', 'Primary module selection must request the module sidebar');
assertIncludes(header, 'aria-label="เมนูหลัก POS"', 'Mobile primary navigation must remain accessible');
assertIncludes(header, 'จัดการเมนูหลัก', 'Mobile primary navigation must expose customization');

assertIncludes(shell, 'pendingMobileModulePath', 'Mobile shell must preserve module navigation intent');
assertIncludes(shell, 'handleMobileModuleSelect', 'Mobile shell must own module-sidebar orchestration');
assertIncludes(shell, 'currentPath === targetPath', 'Selecting the current module must open its sidebar immediately');
assertIncludes(shell, 'currentPath.startsWith(`${targetPath}/`)', 'Selecting a module from one of its child routes must open its sidebar');
assertIncludes(shell, 'setMobileOpen(true)', 'Module selection must open the sidebar');
assertIncludes(shell, 'closeMobileSidebar', 'Overlay, close button, and Escape must share one close authority');
assertExcludes(shell, "import { Menu, X }", 'Redundant mobile hamburger authority must not return');
assertExcludes(shell, 'aria-label="เปิดเมนูย่อยของโมดูลปัจจุบัน"', 'Standalone hamburger trigger must not return');

console.log('POS mobile module navigation contract: PASS');
