import { z } from "zod"

export const customerGenders = ["male", "female"] as const

export const customerCategorySchema = z
  .string()
  .trim()
  .min(1, "Danh mục là bắt buộc")
export const customerGenderSchema = z.enum(customerGenders)

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Tên khách hàng là bắt buộc"),
  category: customerCategorySchema,
  address: z.string().trim(),
  email: z.email("Email không hợp lệ"),
  phone: z.string().trim(),
  gender: customerGenderSchema.nullable(),
  notes: z
    .string()
    .trim()
    .max(5000, "Ghi chú không được vượt quá 5.000 ký tự"),
})

// Read models are deliberately more tolerant than form input so admin users
// can see and repair records created by external sources.
export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  address: z.string(),
  email: z.string(),
  phone: z.string(),
  gender: customerGenderSchema.nullable(),
  notes: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  dataWarnings: z.array(z.string()),
})

export type CustomerCategory = z.infer<typeof customerCategorySchema>
export type CustomerGender = z.infer<typeof customerGenderSchema>
export type CustomerFormData = z.infer<typeof customerFormSchema>
export type Customer = z.infer<typeof customerSchema>
