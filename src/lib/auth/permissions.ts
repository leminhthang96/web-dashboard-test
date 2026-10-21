export const ADMIN_ROLE_ID = "role-admin"
export const ADMIN_EMAIL = "admin@claudecode.ai"
export const DOCUMENT_MANAGER_ROLE_ID = "role-document-manager"
export const DIRECTORS_ROLE_ID = "role-directors"
export const ACCOUNTING_ROLE_ID = "role-accounting"
export const STAFFS_ROLE_ID = "role-staffs"
export const CUSTOMERS_ROLE_ID = "role-customers"

type AdminAccessUser = {
  email?: string | null
  roles?: string[]
  isAdmin?: boolean
}

type RouteAccessRule = {
  path: string
  roles: readonly string[]
}

export function isAdminIdentifier(value?: string | null): boolean {
  return value?.trim().toLowerCase() === ADMIN_EMAIL
}

export function hasAdminAccess(user?: AdminAccessUser | null): boolean {
  return Boolean(
    user?.isAdmin ||
    isAdminIdentifier(user?.email) ||
    user?.roles?.includes(ADMIN_ROLE_ID)
  )
}

/**
 * Document Managers can create / update / delete documents.
 * Admins implicitly have this capability.
 */
export function hasDocumentManagerAccess(
  user?: AdminAccessUser | null
): boolean {
  return Boolean(
    hasAdminAccess(user) || user?.roles?.includes(DOCUMENT_MANAGER_ROLE_ID)
  )
}

/**
 * Các route không có trong danh sách này chỉ dành cho quản trị viên.
 * Quản trị viên luôn có quyền truy cập toàn bộ ứng dụng.
 */
export const ROUTE_ACCESS_RULES: readonly RouteAccessRule[] = [
  { path: "/dashboard", roles: [DIRECTORS_ROLE_ID] },
  { path: "/dashboard-2", roles: [DIRECTORS_ROLE_ID] },
  {
    path: "/dashboard-3",
    roles: [DIRECTORS_ROLE_ID, ACCOUNTING_ROLE_ID],
  },
  {
    path: "/documents",
    roles: [
      DIRECTORS_ROLE_ID,
      ACCOUNTING_ROLE_ID,
      STAFFS_ROLE_ID,
      DOCUMENT_MANAGER_ROLE_ID,
    ],
  },
  { path: "/chat", roles: [CUSTOMERS_ROLE_ID] },
]

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

export function canAccessRoute(
  user: AdminAccessUser | null | undefined,
  pathname: string
): boolean {
  if (hasAdminAccess(user)) return true

  const rule = ROUTE_ACCESS_RULES.find(({ path }) =>
    matchesRoute(pathname, path)
  )

  return Boolean(
    rule && user?.roles?.some((roleId) => rule.roles.includes(roleId))
  )
}

export function getDefaultRoute(
  user: AdminAccessUser | null | undefined
): string {
  if (hasAdminAccess(user) || user?.roles?.includes(DIRECTORS_ROLE_ID)) {
    return "/dashboard"
  }

  if (user?.roles?.includes(ACCOUNTING_ROLE_ID)) return "/dashboard-3"
  if (user?.roles?.includes(STAFFS_ROLE_ID)) return "/documents"
  if (user?.roles?.includes(CUSTOMERS_ROLE_ID)) return "/chat"

  return "/errors/forbidden"
}
