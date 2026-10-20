import {
  ADMIN_ROLE_ID,
  isAdminIdentifier,
} from "@/lib/auth/permissions"

type UserAuthorization = {
  roles: string[]
  isAdmin: boolean
}

export async function getUserAuthorization(
  _uid: string,
  email?: string | null,
  username?: string | null,
  customAttributes?: string | null,
  assignedRoles: string[] = []
): Promise<UserAuthorization> {
  if (isAdminIdentifier(email) || isAdminIdentifier(username)) {
    return { roles: [ADMIN_ROLE_ID], isAdmin: true }
  }

  try {
    const claims = customAttributes
      ? (JSON.parse(customAttributes) as Record<string, unknown>)
      : {}
    const claimRoles = Array.isArray(claims.roles)
      ? claims.roles.filter((role): role is string => typeof role === "string")
      : []
    const roles = [...new Set([...claimRoles, ...assignedRoles])].map((role) =>
      role === "admin" ? ADMIN_ROLE_ID : role
    )
    const isAdmin = claims.admin === true || roles.includes(ADMIN_ROLE_ID)

    return { roles, isAdmin }
  } catch {
    return { roles: [], isAdmin: false }
  }
}
