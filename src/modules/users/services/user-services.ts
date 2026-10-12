import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore"

import { auth, db } from "@/lib/firebase/client"

import { userMockData } from "./user-mock-data"
import type {
  CreateUserPayload,
  Gender,
  UpdateUserPayload,
  User,
  UserStatus,
} from "./types/user-types"

const USERS_COLLECTION = "users"
const AUTH_MANAGEMENT_UNAVAILABLE =
  "Quản lý tài khoản Firebase Authentication từ dashboard đã được tắt."

interface ApiResult<T = unknown> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

function readString(data: Record<string, unknown>, key: string): string {
  const value = data[key]
  return typeof value === "string" ? value : ""
}

function normalizeDate(value: unknown): string | null {
  if (typeof value === "string") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  if (value instanceof Date) return value.toISOString()

  if (value && typeof value === "object" && "toDate" in value) {
    const dateLike = value as { toDate?: () => Date }
    if (typeof dateLike.toDate === "function") {
      return dateLike.toDate().toISOString()
    }
  }

  return null
}

function normalizeGender(value: unknown): Gender {
  return value === "male" || value === "female" || value === "other"
    ? value
    : "other"
}

function normalizeStatus(value: unknown): UserStatus {
  return value === "active" || value === "pending" || value === "disabled"
    ? value
    : "active"
}

function normalizeUserProfile(
  uid: string,
  data: Record<string, unknown>
): User {
  const email = readString(data, "email")
  const name = readString(data, "name") || email.split("@")[0] || uid
  const status = normalizeStatus(data.status)

  return {
    uid,
    email,
    name,
    photoURL: readString(data, "photoURL") || null,
    disabled: status === "disabled",
    emailVerified: false,
    creationTime: normalizeDate(data.createdAt),
    lastSignInTime: null,
    providers: [],
    gender: normalizeGender(data.gender),
    phone: readString(data, "phone"),
    status,
    address: readString(data, "address"),
    profileCreatedAt: normalizeDate(data.createdAt),
    profileUpdatedAt: normalizeDate(data.updatedAt),
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    await auth.authStateReady()
    const snapshot = await getDocs(collection(db, USERS_COLLECTION))

    return snapshot.docs.map((profileDoc) =>
      normalizeUserProfile(
        profileDoc.id,
        profileDoc.data() as Record<string, unknown>
      )
    )
  } catch (error) {
    console.warn(
      "[getUsers] Không thể đọc hồ sơ Firestore; đang dùng dữ liệu mẫu.",
      error
    )
    return userMockData
  }
}

export async function createUserViaApi(
  _payload: CreateUserPayload
): Promise<ApiResult<{ uid: string }>> {
  return { success: false, message: AUTH_MANAGEMENT_UNAVAILABLE }
}

export async function updateUserViaApi(
  uid: string,
  payload: UpdateUserPayload
): Promise<ApiResult> {
  await auth.authStateReady()

  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return { success: false, message: AUTH_MANAGEMENT_UNAVAILABLE }
  }

  const profilePayload = {
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.gender ? { gender: payload.gender } : {}),
    ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
    ...(payload.status ? { status: payload.status } : {}),
    updatedAt: new Date().toISOString(),
  }

  try {
    await setDoc(doc(db, USERS_COLLECTION, uid), profilePayload, {
      merge: true,
    })
    return { success: true }
  } catch (error) {
    console.error("Không thể cập nhật hồ sơ người dùng:", error)
    return { success: false, message: "Không thể cập nhật hồ sơ người dùng." }
  }
}

export async function deleteUserViaApi(_uid: string): Promise<ApiResult> {
  return { success: false, message: AUTH_MANAGEMENT_UNAVAILABLE }
}

export function generateUserAvatar(name: string) {
  const names = name.split(" ").filter(Boolean)

  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }

  return name.substring(0, 2).toUpperCase()
}

export async function upsertUserProfileDirect(user: User): Promise<void> {
  await setDoc(
    doc(db, USERS_COLLECTION, user.uid),
    {
      uid: user.uid,
      name: user.name,
      email: user.email,
      gender: user.gender,
      phone: user.phone,
      status: user.status,
      photoURL: user.photoURL ?? null,
      address: user.address ?? "",
      createdAt: user.profileCreatedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  )
}

export async function deleteUserProfileDirect(uid: string): Promise<void> {
  await deleteDoc(doc(db, USERS_COLLECTION, uid))
}

export async function seedUsersWithClient(): Promise<User[]> {
  const batch = writeBatch(db)

  userMockData.forEach((user) => {
    batch.set(
      doc(db, USERS_COLLECTION, user.uid),
      {
        uid: user.uid,
        name: user.name,
        email: user.email,
        gender: user.gender,
        phone: user.phone,
        status: user.status,
        photoURL: user.photoURL ?? null,
        address: user.address ?? "",
        createdAt: user.profileCreatedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  })

  await batch.commit()
  return getUsers()
}
