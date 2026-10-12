import { z } from "zod"

export const customerFormSchema = z.object({
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
    .min(1, "Số điện thoại là bắt buộc")
    .max(30, "Số điện thoại không được vượt quá 30 ký tự")
    .regex(/^[+()\d\s.-]+$/, "Số điện thoại không hợp lệ"),
  serviceName: z
    .string()
    .trim()
    .min(1, "Tên dịch vụ là bắt buộc")
    .max(120, "Tên dịch vụ không được vượt quá 120 ký tự"),
})

// Model đọc có thêm metadata để quản lý document, nhưng bốn trường nghiệp vụ
// luôn giữ đúng tên đang được sử dụng trong collection customers.
export const customerSchema = customerFormSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  dataWarnings: z.array(z.string()),
})

export type CustomerFormData = z.infer<typeof customerFormSchema>
export type Customer = z.infer<typeof customerSchema>
