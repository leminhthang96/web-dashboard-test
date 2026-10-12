import { FirebaseError } from "firebase/app"
import { getApps, initializeApp } from "firebase/app"
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore/lite"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const FIREBASE_APP_NAME = "landing-page-customer-api"

const landingPageCustomerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Họ và tên là bắt buộc")
    .max(120, "Họ và tên không được vượt quá 120 ký tự"),
  email: z
    .string()
    .trim()
    .max(254, "Email không được vượt quá 254 ký tự")
    .pipe(z.email("Email không hợp lệ")),
  phoneNumber: z
    .string()
    .trim()
    .min(6, "Số điện thoại phải có ít nhất 6 ký tự")
    .max(30, "Số điện thoại không được vượt quá 30 ký tự")
    .regex(/^[+()\d\s.-]+$/, "Số điện thoại không hợp lệ"),
  serviceName: z
    .string()
    .trim()
    .min(1, "Tên dịch vụ là bắt buộc")
    .max(120, "Tên dịch vụ không được vượt quá 120 ký tự"),
})

function getPublicFirestore() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

  if (!apiKey || !projectId) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_FIREBASE_API_KEY hoặc NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    )
  }

  const existingApp = getApps().find((app) => app.name === FIREBASE_APP_NAME)
  const app =
    existingApp ??
    initializeApp({ apiKey, projectId, authDomain }, FIREBASE_APP_NAME)

  return getFirestore(app)
}

async function readRequestBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? ""

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData()
    return Object.fromEntries(formData.entries())
  }

  return request.json()
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await readRequestBody(request)
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Body phải là JSON hoặc dữ liệu form hợp lệ",
      },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const parsed = landingPageCustomerSchema.safeParse(body)

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

  try {
    const { fullName, email, phoneNumber, serviceName } = parsed.data
    const customer = {
      name: fullName,
      fullName,
      email,
      phone: phoneNumber,
      phoneNumber,
      category: serviceName,
      serviceName,
      address: "",
      gender: null,
      notes: "",
      userId: "",
      source: "landing-page",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const customerRef = await addDoc(
      collection(getPublicFirestore(), "customers"),
      customer
    )

    return NextResponse.json(
      {
        success: true,
        message: "Đã tiếp nhận thông tin khách hàng",
        data: { id: customerRef.id },
      },
      { status: 201, headers: CORS_HEADERS }
    )
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "permission-denied") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Firestore Rules chưa cho phép tạo khách hàng từ landing page",
        },
        { status: 403, headers: CORS_HEADERS }
      )
    }

    console.error("Không thể lưu khách hàng từ landing page", error)

    return NextResponse.json(
      {
        success: false,
        message: "Không thể lưu thông tin khách hàng vào Firestore",
      },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
