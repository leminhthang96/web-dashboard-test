import { NextRequest, NextResponse } from "next/server"

import { getAdminApiErrorResponse } from "@/lib/auth/admin-api"
import { getAdminDb } from "@/lib/firebase/admin"
import { customerFormSchema } from "@/modules/customers/services/types/customer-types"
import {
  getCustomerApiError,
  normalizeCustomerDocument,
} from "../customer-api-utils"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const authError = await getAdminApiErrorResponse(CORS_HEADERS)
  if (authError) return authError

  try {
    const { customerId } = await params
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

    const customerRef = getAdminDb().collection("customers").doc(customerId)
    const existingDocument = await customerRef.get()

    if (!existingDocument.exists) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khách hàng" },
        { status: 404, headers: CORS_HEADERS }
      )
    }

    await customerRef.set(
      {
        ...parsed.data,
        id: customerId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    const updatedDocument = await customerRef.get()
    const customer = normalizeCustomerDocument(
      customerId,
      updatedDocument.data() ?? {}
    )

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật khách hàng thành công",
        data: { customer },
      },
      { status: 200, headers: CORS_HEADERS }
    )
  } catch (error) {
    console.error("[Admin Customers PATCH API Error]", error)
    const apiError = getCustomerApiError(
      error,
      "Không thể cập nhật khách hàng"
    )
    return NextResponse.json(
      { success: false, message: apiError.message },
      { status: apiError.status, headers: CORS_HEADERS }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const authError = await getAdminApiErrorResponse(CORS_HEADERS)
  if (authError) return authError

  try {
    const { customerId } = await params
    const customerRef = getAdminDb().collection("customers").doc(customerId)
    const existingDocument = await customerRef.get()

    if (!existingDocument.exists) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khách hàng" },
        { status: 404, headers: CORS_HEADERS }
      )
    }

    await customerRef.delete()

    return NextResponse.json(
      { success: true, message: "Xóa khách hàng thành công" },
      { status: 200, headers: CORS_HEADERS }
    )
  } catch (error) {
    console.error("[Admin Customers DELETE API Error]", error)
    const apiError = getCustomerApiError(error, "Không thể xóa khách hàng")
    return NextResponse.json(
      { success: false, message: apiError.message },
      { status: apiError.status, headers: CORS_HEADERS }
    )
  }
}
