const normalizeBranchSlug = (value) => String(value || '').trim().toLowerCase();

const isBranchSuperAdmin = (role) => normalizeBranchSlug(role) === 'superadmin';

const resolveBranchSlug = (branch) => normalizeBranchSlug(
  branch?.slug || branch?.shopSlug || branch?.partnerSlug || '',
);

const filterBranchesForShop = ({ branches = [], shopSlug = '', isSuperAdmin = false }) => {
  const source = Array.isArray(branches) ? branches : [];
  if (isSuperAdmin) return source;

  const targetSlug = normalizeBranchSlug(shopSlug);
  return source.filter((branch) => resolveBranchSlug(branch) === targetSlug);
};

const projectBranchEditDefaults = (branch) => ({
  name: branch?.name || '',
  phone: branch?.phone || branch?.telephone || '',
  address: branch?.address || '',
});

export {
  filterBranchesForShop,
  isBranchSuperAdmin,
  projectBranchEditDefaults,
  resolveBranchSlug,
};
