import { FirebaseError } from "firebase/app"
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/firebase/client"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

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

async function sendTelegramCustomerNotification(
  customer: z.infer<typeof landingPageCustomerSchema>
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    throw new Error("Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID")
  }

  const submittedAt = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  })
  const message = [
    "🔔 KHÁCH HÀNG MỚI TỪ LANDING PAGE",
    "",
    `👤 Họ và tên: ${customer.fullName}`,
    `📧 Email: ${customer.email}`,
    `📞 Số điện thoại: ${customer.phoneNumber}`,
    `🛠️ Dịch vụ: ${customer.serviceName}`,
    `🕒 Thời gian: ${submittedAt}`,
  ].join("\n")

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10000),
    }
  )
  const result = (await response.json()) as {
    ok?: boolean
    description?: string
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.description ?? "Telegram từ chối gửi tin nhắn")
  }
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
      fullName,
      email,
      phoneNumber,
      serviceName,
      userId: "",
      source: "landing-page",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const customerRef = await addDoc(
      collection(db, "customers"),
      customer
    )

    try {
      await sendTelegramCustomerNotification(parsed.data)
    } catch (telegramError) {
      console.error("Không thể gửi thông báo khách hàng tới Telegram", {
        customerId: customerRef.id,
        error:
          telegramError instanceof Error
            ? telegramError.message
            : "Lỗi không xác định",
      })

      return NextResponse.json(
        {
          success: true,
          message:
            "Đã lưu khách hàng nhưng chưa gửi được thông báo Telegram",
          data: { id: customerRef.id, telegramSent: false },
        },
        { status: 201, headers: CORS_HEADERS }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Đã lưu khách hàng và gửi thông báo Telegram",
        data: { id: customerRef.id, telegramSent: true },
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
