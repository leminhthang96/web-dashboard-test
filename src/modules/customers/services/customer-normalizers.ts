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
  const fullName = readString(rawData, "fullName", "name")
  const email = readString(rawData, "email")
  const phoneNumber = readString(rawData, "phoneNumber", "phone")
  const serviceName = readString(rawData, "serviceName", "category")
  const userId = readString(rawData, "userId")

  if (!fullName) warnings.push("Thiếu họ và tên")
  if (!email) warnings.push("Thiếu email")
  if (!phoneNumber) warnings.push("Thiếu số điện thoại")
  if (!serviceName) warnings.push("Thiếu tên dịch vụ")

  const createdAt = normalizeDate(rawData.createdAt, now)

  return {
    id: documentId,
    fullName: fullName || `Khách hàng ${documentId.slice(0, 8)}`,
    email,
    phoneNumber,
    serviceName: serviceName || "Chưa xác định",
    userId,
    createdAt,
    updatedAt: normalizeDate(rawData.updatedAt, createdAt),
    dataWarnings: warnings,
  }
}
