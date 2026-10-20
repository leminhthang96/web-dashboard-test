import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import {
  ACCOUNTING_ROLE_ID,
  ADMIN_ROLE_ID,
  CUSTOMERS_ROLE_ID,
  DIRECTORS_ROLE_ID,
  DOCUMENT_MANAGER_ROLE_ID,
  STAFFS_ROLE_ID,
} from "@/lib/auth/permissions"
import { getUserAuthorization } from "@/lib/auth/user-access"

import { authConfig } from "./auth.config"

const FIRESTORE_ROLE_IDS = [
  ADMIN_ROLE_ID,
  DIRECTORS_ROLE_ID,
  ACCOUNTING_ROLE_ID,
  STAFFS_ROLE_ID,
  CUSTOMERS_ROLE_ID,
  DOCUMENT_MANAGER_ROLE_ID,
] as const

const VALID_FIRESTORE_ROLE_IDS = new Set<string>(FIRESTORE_ROLE_IDS)

async function getFirestoreRoleIds(
  uid: string,
  idToken: string
): Promise<string[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!projectId) {
    console.error(
      "Không thể tải role: NEXT_PUBLIC_FIREBASE_PROJECT_ID chưa được cấu hình."
    )
    return []
  }

  try {
    const queryUrl =
      `https://firestore.googleapis.com/v1/projects/${projectId}` +
      "/databases/(default)/documents:runQuery"
    const queryResponse = await fetch(queryUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "users_roles" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "uid" },
              op: "EQUAL",
              value: { stringValue: uid },
            },
          },
        },
      }),
      cache: "no-store",
    })

    if (queryResponse.ok) {
      const rows = (await queryResponse.json()) as Array<{
        document?: {
          fields?: {
            roleId?: { stringValue?: string }
          }
        }
      }>
      const queriedRoles = Array.from(
        new Set(
          rows
            .map((row) => row.document?.fields?.roleId?.stringValue)
            .filter(
              (roleId): roleId is string =>
                typeof roleId === "string" &&
                VALID_FIRESTORE_ROLE_IDS.has(roleId)
            )
        )
      )

      if (queriedRoles.length > 0) {
        return queriedRoles
      }
    }

    // Tương thích với các bản ghi được tạo theo document ID chuẩn.
    const roleChecks = await Promise.all(
      FIRESTORE_ROLE_IDS.map(async (roleId) => {
        const assignmentId = `ur-${uid}-${roleId}`
        const documentUrl =
          `https://firestore.googleapis.com/v1/projects/${projectId}` +
          "/databases/(default)/documents/users_roles/" +
          encodeURIComponent(assignmentId)
        const response = await fetch(documentUrl, {
          headers: { Authorization: `Bearer ${idToken}` },
          cache: "no-store",
        })

        return {
          roleId,
          status: response.status,
        }
      })
    )

    const assignedRoles = roleChecks
      .filter(({ status }) => status === 200)
      .map(({ roleId }) => roleId)

    if (assignedRoles.length === 0) {
      console.error("Không tìm thấy role Firestore cho tài khoản đăng nhập.", {
        queryStatus: queryResponse.status,
        statuses: roleChecks.map(({ roleId, status }) => ({ roleId, status })),
      })
    }

    return assignedRoles
  } catch (error) {
    console.warn("Không thể tải role Firestore khi đăng nhập:", error)
    return []
  }
}

async function verifyFirebaseIdToken(idToken: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not configured")
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to verify Firebase ID token")
  }

  const data = (await response.json()) as {
    users?: Array<{
      localId: string
      displayName?: string
      email?: string
      photoUrl?: string
      customAttributes?: string
    }>
  }

  const user = data.users?.[0]
  if (!user) {
    throw new Error("No user found in Firebase token")
  }

  return {
    uid: user.localId,
    name: user.displayName || user.email?.split("@")[0] || "User",
    email: user.email,
    picture: user.photoUrl || "",
    customAttributes: user.customAttributes,
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken || typeof credentials.idToken !== "string") {
          return null
        }

        try {
          const firebaseUser = await verifyFirebaseIdToken(
            credentials.idToken
          )
          const assignedRoles = await getFirestoreRoleIds(
            firebaseUser.uid,
            credentials.idToken
          )
          const authorization = await getUserAuthorization(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.name,
            firebaseUser.customAttributes,
            assignedRoles
          )

          return {
            id: firebaseUser.uid,
            name: firebaseUser.name,
            email: firebaseUser.email,
            image: firebaseUser.picture,
            roles: authorization.roles,
            isAdmin: authorization.isAdmin,
          }
        } catch (error) {
          console.error("Error authorizing with Firebase ID Token:", error)
          return null
        }
      },
    }),
  ],
})
