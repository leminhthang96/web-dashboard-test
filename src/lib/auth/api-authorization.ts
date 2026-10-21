import "server-only"

import { auth } from "@/auth"
import { canAccessRoute } from "@/lib/auth/permissions"
import { NextResponse } from "next/server"

type CorsHeaders = Record<string, string>

/**
 * API routes are excluded from proxy.ts, so sensitive handlers must enforce
 * the same RBAC policy themselves.
 */
export async function getApiRouteErrorResponse(
  protectedPagePath: string,
  headers: CorsHeaders
): Promise<NextResponse | null> {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Bạn cần đăng nhập để thực hiện thao tác này" },
      { status: 401, headers }
    )
  }

  if (!canAccessRoute(session.user, protectedPagePath)) {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này" },
      { status: 403, headers }
    )
  }

  return null
}
