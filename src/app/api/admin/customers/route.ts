import { NextRequest, NextResponse } from "next/server"

import { getAdminApiErrorResponse } from "@/lib/auth/admin-api"
import { getAdminDb } from "@/lib/firebase/admin"
import { customerFormSchema } from "@/modules/customers/services/types/customer-types"
import {
  getCustomerApiError,
  normalizeCustomerDocument,
} from "./customer-api-utils"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  const authError = await getAdminApiErrorResponse(CORS_HEADERS)
  if (authError) return authError

  try {
    const snapshot = await getAdminDb().collection("customers").get()
    const customers = snapshot.docs
      .map((document) =>
        normalizeCustomerDocument(document.id, document.data())
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

    return NextResponse.json(
      {
        success: true,
        message: "Lấy danh sách khách hàng thành công",
        data: { customers },
      },
      { status: 200, headers: CORS_HEADERS }
    )
  } catch (error) {
    console.error("[Admin Customers GET API Error]", error)
    const apiError = getCustomerApiError(
      error,
      "Không thể tải danh sách khách hàng"
    )
    return NextResponse.json(
      { success: false, message: apiError.message },
      { status: apiError.status, headers: CORS_HEADERS }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await getAdminApiErrorResponse(CORS_HEADERS)
  if (authError) return authError

  try {
    const parsed = customerFormSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu khách hàng không hợp lệ",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const customerRef = getAdminDb().collection("customers").doc()
    const now = new Date().toISOString()
    const customerData = {
      ...parsed.data,
      id: customerRef.id,
      userId: "",
      createdAt: now,
      updatedAt: now,
    }

    await customerRef.set(customerData)

    return NextResponse.json(
      {
        success: true,
        message: "Thêm khách hàng thành công",
        data: {
          customer: normalizeCustomerDocument(customerRef.id, customerData),
        },
      },
      { status: 201, headers: CORS_HEADERS }
    )
  } catch (error) {
    console.error("[Admin Customers POST API Error]", error)
    const apiError = getCustomerApiError(error, "Không thể thêm khách hàng")
    return NextResponse.json(
      { success: false, message: apiError.message },
      { status: apiError.status, headers: CORS_HEADERS }
    )
  }
}
