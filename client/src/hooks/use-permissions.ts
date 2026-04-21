import { useAuth } from "./use-auth";
import type { Permission, Role } from "@shared/permissions";

interface AuthUserWithPermissions {
  role?: string | null;
  permissions?: string[];
}

export function usePermissions() {
  const { user } = useAuth();
  const u = user as AuthUserWithPermissions | null | undefined;

  const role = ((u?.role ?? "owner") as Role) === "manager"
    ? "manager"
    : u?.role === "staff"
      ? "staff"
      : ("owner" as Role);

  const permSet = new Set<string>(u?.permissions ?? []);

  const can = (perm: Permission | string): boolean => permSet.has(perm);
  const canAny = (...perms: (Permission | string)[]): boolean =>
    perms.some((p) => permSet.has(p));
  const canAll = (...perms: (Permission | string)[]): boolean =>
    perms.every((p) => permSet.has(p));

  return {
    role,
    permissions: permSet,
    isOwner: role === "owner",
    isManager: role === "manager",
    isStaff: role === "staff",
    can,
    canAny,
    canAll,
  };
}
