

export const P1_POSITION = {
    BRANCH_OWNER: 'ผู้ดูแลระบบ',
    BRANCH_MANAGER: 'ผู้จัดการสาขา',
    STAFF_PURCHASING: 'จัดซื้อ',
    STAFF_SALES: 'แคชเชียร์',
    STAFF_WAREHOUSE: 'คลัง',
    VIEWER: 'ดูอย่างเดียว',
  };
  
  export const P1_CAP = {
    MANAGE_EMPLOYEES: 'manageEmployees',
    MANAGE_PRODUCTS: 'manageProducts',
    EDIT_PRICING: 'editPricing',
    PURCHASING: 'purchasing',
    RECEIVE_STOCK: 'receiveStock',
    POS_SALE: 'posSale',
    STOCK_AUDIT: 'stockAudit',
    VIEW_REPORTS: 'viewReports',
  };
  
  /* ------------------------------------------------------------------
   * src/features/auth/rbac/rbacClient.js
   * ------------------------------------------------------------------
   * FE RBAC helper (P1 Minimal Disruption)
   * - Derive capabilities from existing schema fields only:
   *   User.role, EmployeeProfile.position.name, Branch.RBACEnabled
   * - No API calls, no side effects.
   * - Designed to be used by authStore selectors and UI guards.
   */
  
  // NOTE:
  // - Keep this file pure and dependency-free.
  // - If you later migrate to permission tables (P3-style), you can swap the internals
  //   while keeping the external shape (roleContext + capabilities) stable.
  
  export const normalizeUserRole = (role) => {
    const r = String(role || '').trim().toUpperCase();
    if (r === 'SUPER_ADMIN') return 'SUPERADMIN'; // tolerance
    return r;
  };
  
  export const isPosUserRole = (role) => {
    const r = normalizeUserRole(role);
    return r === 'EMPLOYEE' || r === 'ADMIN' || r === 'SUPERADMIN';
  };
  
  export const isSuperAdmin = (role) => normalizeUserRole(role) === 'SUPERADMIN';
  export const isAdminRole = (role) => {
    const r = normalizeUserRole(role);
    return r === 'ADMIN' || r === 'SUPERADMIN';
  };
  
  /**
   * Standard Role Context
   * @typedef {{
   *  role: string,
   *  branchId: (string|number|null),
   *  positionName: (string|null),
   *  rbacEnabled: boolean,
   *  capabilities: Record<string, boolean>
   * }} RoleContext
   */
  
  /**
   * Capability utilities
   */
  export const hasCap = (capabilities, capKey) => !!(capabilities && capabilities[capKey]);
  
  /**
   * Build capabilities for P1 using:
   * - SUPERADMIN: allow all
   * - RBAC disabled (Branch.RBACEnabled=false): allow operational caps broadly for POS users
   * - RBAC enabled: map by Position.name (Thai labels) with safe defaults
   */
  export const buildP1Capabilities = ({ role, positionName, rbacEnabled }) => {
    const userRole = normalizeUserRole(role);
    const pos = isPosUserRole(userRole);
  
    // Default deny-all
    const caps = {
      [P1_CAP.MANAGE_EMPLOYEES]: false,
      [P1_CAP.MANAGE_PRODUCTS]: false,
      [P1_CAP.EDIT_PRICING]: false,
      [P1_CAP.PURCHASING]: false,
      [P1_CAP.RECEIVE_STOCK]: false,
      [P1_CAP.POS_SALE]: false,
      [P1_CAP.STOCK_AUDIT]: false,
      [P1_CAP.VIEW_REPORTS]: false,
    };
  
    // Non-POS roles
    if (!pos) return caps;
  
    // SUPERADMIN (platform/support): allow all
    if (isSuperAdmin(userRole)) {
      Object.keys(caps).forEach((k) => {
        caps[k] = true;
      });
      return caps;
    }
  
    // Branch RBAC disabled (kill switch): keep operations usable
    // Minimal disruption policy:
    // - Allow everything except manageEmployees by default (can be adjusted)
    if (rbacEnabled === false) {
      Object.keys(caps).forEach((k) => {
        caps[k] = true;
      });
      // Keep employees management restricted by default
      // - ADMIN can manage employees; EMPLOYEE cannot (unless you decide otherwise)
      caps[P1_CAP.MANAGE_EMPLOYEES] = isAdminRole(userRole);
      return caps;
    }
  
    // RBAC enabled: map by positionName (Thai labels)
    const p = String(positionName || '').trim();
  
    // ADMIN role boost (coarse)
    // - ADMIN can always view reports + manage products (safe baseline)
    if (userRole === 'ADMIN') {
      caps[P1_CAP.VIEW_REPORTS] = true;
      caps[P1_CAP.MANAGE_PRODUCTS] = true;
      caps[P1_CAP.EDIT_PRICING] = true;
      caps[P1_CAP.PURCHASING] = true;
      caps[P1_CAP.RECEIVE_STOCK] = true;
      caps[P1_CAP.POS_SALE] = true;
      caps[P1_CAP.STOCK_AUDIT] = true;
      caps[P1_CAP.MANAGE_EMPLOYEES] = true;
      return caps;
    }
  
    // Position-based
    switch (p) {
      case P1_POSITION.BRANCH_OWNER:
      case P1_POSITION.BRANCH_MANAGER: {
        caps[P1_CAP.MANAGE_EMPLOYEES] = p === P1_POSITION.BRANCH_OWNER; // manager ไม่ยุ่ง RBAC/พนักงาน (ปรับได้)
        caps[P1_CAP.MANAGE_PRODUCTS] = true;
        caps[P1_CAP.EDIT_PRICING] = true;
        caps[P1_CAP.PURCHASING] = true;
        caps[P1_CAP.RECEIVE_STOCK] = true;
        caps[P1_CAP.POS_SALE] = true;
        caps[P1_CAP.STOCK_AUDIT] = true;
        caps[P1_CAP.VIEW_REPORTS] = true;
        return caps;
      }
  
      case P1_POSITION.STAFF_PURCHASING: {
        caps[P1_CAP.PURCHASING] = true;
        caps[P1_CAP.RECEIVE_STOCK] = true;
        caps[P1_CAP.VIEW_REPORTS] = true; // รายงานเบื้องต้น
        return caps;
      }
  
      case P1_POSITION.STAFF_SALES: {
        caps[P1_CAP.POS_SALE] = true;
        caps[P1_CAP.VIEW_REPORTS] = true; // รายงานยอดขาย/สรุป
        return caps;
      }
  
      case P1_POSITION.STAFF_WAREHOUSE: {
        caps[P1_CAP.RECEIVE_STOCK] = true;
        caps[P1_CAP.STOCK_AUDIT] = true;
        caps[P1_CAP.VIEW_REPORTS] = true; // รายงานสต๊อก/ตรวจนับ
        return caps;
      }
  
      case P1_POSITION.VIEWER: {
        caps[P1_CAP.VIEW_REPORTS] = true;
        return caps;
      }
  
      default: {
        // Safe default for unknown position:
        // - Allow basic POS sale (optional). You can set this to false if you want stricter behavior.
        caps[P1_CAP.POS_SALE] = true;
        return caps;
      }
    }
  };
  
  /**
   * Build a RoleContext object.
   * This is intended to be called by authStore selectors.
   */
  export const buildRoleContext = ({
    role,
    branchId = null,
    positionName = null,
    rbacEnabled = true,
  } = {}) => {
    const normalizedRole = normalizeUserRole(role);
    const enabled = rbacEnabled !== false;
  
    const ctx = {
      role: normalizedRole,
      branchId: branchId ?? null,
      positionName: positionName ?? null,
      rbacEnabled: enabled,
      capabilities: {},
    };
  
    ctx.capabilities = buildP1Capabilities({
      role: ctx.role,
      positionName: ctx.positionName,
      rbacEnabled: enabled,
    });
  
    return ctx;
  };
  
  /**
   * Helper for guarding UI blocks.
   * Usage: if (can(roleContext, P1_CAP.MANAGE_PRODUCTS)) { ... }
   */
  export const can = (roleContext, capKey) => hasCap(roleContext?.capabilities, capKey);
  
  