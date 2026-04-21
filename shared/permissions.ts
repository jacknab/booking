// =============================================================================
// PERMISSION CATALOG
// -----------------------------------------------------------------------------
// Single source of truth for every gated capability in the app.
// Used by both the server (route guards, data scoping) and the client
// (hiding nav items, disabling actions).
// =============================================================================

export const PERMISSIONS = {
  // Appointments / calendar
  APPOINTMENTS_VIEW_ALL: "appointments.viewAll",
  APPOINTMENTS_VIEW_OWN: "appointments.viewOwn",
  APPOINTMENTS_EDIT: "appointments.edit",
  APPOINTMENTS_DELETE: "appointments.delete",

  // Customers
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_VIEW_CONTACT: "customers.viewContact",
  CUSTOMERS_EDIT: "customers.edit",
  CUSTOMERS_EXPORT: "customers.export",

  // Catalog
  SERVICES_MANAGE: "services.manage",
  PRODUCTS_MANAGE: "products.manage",
  PRICING_VIEW: "pricing.view",
  PRICING_EDIT: "pricing.edit",

  // Team
  STAFF_MANAGE: "staff.manage",
  STAFF_PERMISSIONS_MANAGE: "staff.permissionsManage",

  // Reports & money
  REPORTS_VIEW: "reports.view",
  REPORTS_FINANCIAL: "reports.financial",
  COMMISSIONS_VIEW_ALL: "commissions.viewAll",
  COMMISSIONS_VIEW_OWN: "commissions.viewOwn",

  // POS
  POS_USE: "pos.use",
  CASH_DRAWER_VIEW: "cashDrawer.view",
  CASH_DRAWER_CLOSE: "cashDrawer.close",

  // Store / business config
  STORE_SETTINGS: "store.settings",
  STORE_DELETE: "store.delete",
  INTEGRATIONS_MANAGE: "integrations.manage",
  BILLING_MANAGE: "billing.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type Role = "owner" | "manager" | "staff";

// -----------------------------------------------------------------------------
// Role defaults
// -----------------------------------------------------------------------------

const ALL_PERMS: Permission[] = Object.values(PERMISSIONS);

const OWNER_PERMS: Permission[] = ALL_PERMS;

const MANAGER_PERMS: Permission[] = ALL_PERMS.filter(
  (p) =>
    p !== PERMISSIONS.BILLING_MANAGE &&
    p !== PERMISSIONS.STORE_DELETE &&
    p !== PERMISSIONS.INTEGRATIONS_MANAGE &&
    p !== PERMISSIONS.STAFF_PERMISSIONS_MANAGE,
);

const STAFF_PERMS: Permission[] = [
  PERMISSIONS.APPOINTMENTS_VIEW_OWN,
  PERMISSIONS.APPOINTMENTS_EDIT,
  PERMISSIONS.CUSTOMERS_VIEW,
  PERMISSIONS.POS_USE,
  PERMISSIONS.COMMISSIONS_VIEW_OWN,
];

export const ROLE_DEFAULTS: Record<Role, ReadonlySet<Permission>> = {
  owner: new Set(OWNER_PERMS),
  manager: new Set(MANAGER_PERMS),
  staff: new Set(STAFF_PERMS),
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Normalize legacy / unknown role values to a supported Role. */
export function normalizeRole(role: string | null | undefined): Role {
  if (role === "manager") return "manager";
  if (role === "staff") return "staff";
  // "admin" (legacy) and anything unrecognized → owner
  return "owner";
}

/**
 * Compute the effective permission set for a user.
 * Per-user overrides win over role defaults: { "billing.manage": false } removes it,
 * { "reports.financial": true } grants it.
 */
export function computePermissions(
  role: string | null | undefined,
  overrides?: Record<string, boolean> | null,
): Set<Permission> {
  const normalizedRole = normalizeRole(role);
  const set = new Set<Permission>(ROLE_DEFAULTS[normalizedRole]);

  if (overrides) {
    for (const [perm, granted] of Object.entries(overrides)) {
      if (granted) set.add(perm as Permission);
      else set.delete(perm as Permission);
    }
  }

  return set;
}

/** Check whether a permission set includes a permission. */
export function hasPermission(
  perms: Set<Permission> | ReadonlySet<Permission>,
  perm: Permission,
): boolean {
  return perms.has(perm);
}
