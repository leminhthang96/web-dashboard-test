import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore"

import { auth, db } from "@/lib/firebase/client"
import { getFirestoreCollection } from "@/lib/firebase/firestore-query"

import { roleMockData, userRoleMockData } from "./role-mock-data"
import type { Role } from "./types/user-types"

const ROLES_COLLECTION = "roles"
const USERS_ROLES_COLLECTION = "users_roles"

export async function getRoles(): Promise<Role[]> {
  return getFirestoreCollection<Role>(ROLES_COLLECTION, roleMockData)
}

export async function getRole(roleId: string): Promise<Role | null> {
  const snap = await getDocs(collection(db, ROLES_COLLECTION))
  const found = snap.docs.find((d) => d.id === roleId)
  return found ? (found.data() as Role) : null
}

export async function createRole(role: Role): Promise<Role> {
  await setDoc(doc(db, ROLES_COLLECTION, role.id), {
    ...role,
    createdAt: role.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return role
}

export async function updateRole(role: Role): Promise<Role> {
  await setDoc(
    doc(db, ROLES_COLLECTION, role.id),
    { ...role, updatedAt: new Date().toISOString() },
    { merge: true }
  )
  return role
}

export async function deleteRole(roleId: string): Promise<void> {
  await deleteDoc(doc(db, ROLES_COLLECTION, roleId))
}

export async function seedRolesWithClient(): Promise<Role[]> {
  await auth.authStateReady()

  if (!auth.currentUser) {
    throw new Error("Bạn cần đăng nhập để seed dữ liệu phân quyền.")
  }

  const batch = writeBatch(db)

  roleMockData.forEach((role) => {
    batch.set(doc(db, ROLES_COLLECTION, role.id), role, { merge: true })
  })

  await batch.commit()
  return getRoles()
}

export async function seedRbacWithClient(): Promise<Role[]> {
  await auth.authStateReady()

  if (!auth.currentUser) {
    throw new Error("Bạn cần đăng nhập để seed dữ liệu phân quyền.")
  }

  const batch = writeBatch(db)

  roleMockData.forEach((role) => {
    batch.set(doc(db, ROLES_COLLECTION, role.id), role, { merge: true })
  })

  userRoleMockData.forEach((userRole) => {
    batch.set(
      doc(db, USERS_ROLES_COLLECTION, userRole.id),
      userRole,
      { merge: true }
    )
  })

  await batch.commit()
  return getRoles()
}

/**
 * Generate a stable role id from a role name.
 * e.g. "Super Admin" -> "role-super-admin"
 */
export function generateRoleId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
  return `role-${slug}`
}
