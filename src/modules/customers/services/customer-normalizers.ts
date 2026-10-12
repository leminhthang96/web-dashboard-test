import type { Customer } from "./types/customer-types"

type FirestoreDateLike = {
  toDate?: () => Date
  seconds?: number
  nanoseconds?: number
}

function readString(
  data: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return ""
}

function normalizeCategory(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "other"

  const normalized = value.trim().toLocaleLowerCase()
  const aliases: Record<string, string> = {
    "giáo dục": "education",
    education: "education",
    "kinh doanh": "sales",
    sales: "sales",
    marketing: "marketing",
    "công nhân": "worker",
    worker: "worker",
    khác: "other",
    other: "other",
  }

  return aliases[normalized] ?? normalized
}

function normalizeGender(value: unknown): Customer["gender"] {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLocaleLowerCase()
  if (["male", "nam", "m"].includes(normalized)) return "male"
  if (["female", "nữ", "nu", "f"].includes(normalized)) return "female"
  return null
}

function normalizeDate(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
  }

  if (typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
  }

  if (value instanceof Date) return value.toISOString()

  if (value && typeof value === "object") {
    const dateLike = value as FirestoreDateLike

    if (typeof dateLike.toDate === "function") {
      return dateLike.toDate().toISOString()
    }

    if (typeof dateLike.seconds === "number") {
      return new Date(
        dateLike.seconds * 1000 +
          Math.round((dateLike.nanoseconds ?? 0) / 1000000)
      ).toISOString()
    }
  }

  return fallback
}

export function normalizeCustomerDocument(
  documentId: string,
  rawData: Record<string, unknown>
): Customer {
  const warnings: string[] = []
  const now = new Date().toISOString()
  const rawName = readString(rawData, "name", "fullName")
  const rawEmail = readString(rawData, "email")
  const rawCategory = rawData.category ?? rawData.serviceName
  const rawGender = rawData.gender
  const userId = readString(rawData, "userId")

  if (!rawName) warnings.push("Thiếu tên khách hàng")
  if (!rawEmail) warnings.push("Thiếu email")
  if (!userId) warnings.push("Chưa gán userId")
  if (typeof rawCategory !== "string" || !rawCategory.trim()) {
    warnings.push("Thiếu danh mục; đã chuyển thành other")
  }
  if (rawGender && !normalizeGender(rawGender)) {
    warnings.push("Giới tính không hợp lệ; đã để trống")
  }

  const createdAt = normalizeDate(rawData.createdAt, now)

  return {
    id: documentId,
    name: rawName || `Khách hàng ${documentId.slice(0, 8)}`,
    category: normalizeCategory(rawCategory),
    address: readString(rawData, "address"),
    email: rawEmail,
    phone: readString(rawData, "phone", "phoneNumber"),
    gender: normalizeGender(rawGender),
    notes: readString(rawData, "notes"),
    userId,
    createdAt,
    updatedAt: normalizeDate(rawData.updatedAt, createdAt),
    dataWarnings: warnings,
  }
}
