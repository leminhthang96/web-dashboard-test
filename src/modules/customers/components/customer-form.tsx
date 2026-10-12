"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  customerFormSchema,
  type CustomerFormData,
} from "@/modules/customers/services/types/customer-types"

export const emptyCustomerForm: CustomerFormData = {
  fullName: "",
  email: "",
  phoneNumber: "",
  serviceName: "",
}

interface CustomerFormProps {
  initialValues?: CustomerFormData
  submitLabel: string
  submittingLabel: string
  onSubmit: (data: CustomerFormData) => void | Promise<void>
  onCancel: () => void
}

export function CustomerForm({
  initialValues = emptyCustomerForm,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [formData, setFormData] = React.useState<CustomerFormData>({
    ...initialValues,
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function updateField<K extends keyof CustomerFormData>(
    field: K,
    value: CustomerFormData[K]
  ) {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = customerFormSchema.safeParse(formData)

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === "string" && !fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    try {
      setIsSubmitting(true)
      setErrors({})
      await onSubmit(parsed.data)
    } catch (error) {
      setErrors({
        root:
          error instanceof Error
            ? error.message
            : "Không thể lưu khách hàng. Vui lòng thử lại.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.root ? (
        <p className="text-sm text-destructive">{errors.root}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-full-name">Họ và tên *</Label>
          <Input
            id="customer-full-name"
            autoFocus
            value={formData.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Ngô Thanh Tùng"
            className={cn(errors.fullName && "border-destructive")}
          />
          {errors.fullName ? (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-email">Email *</Label>
          <Input
            id="customer-email"
            type="email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="tungnt@softech.vn"
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-phone-number">Số điện thoại *</Label>
          <Input
            id="customer-phone-number"
            value={formData.phoneNumber}
            onChange={(event) =>
              updateField("phoneNumber", event.target.value)
            }
            placeholder="1234567890"
            className={cn(errors.phoneNumber && "border-destructive")}
          />
          {errors.phoneNumber ? (
            <p className="text-sm text-destructive">
              {errors.phoneNumber}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-service-name">Dịch vụ *</Label>
          <Input
            id="customer-service-name"
            value={formData.serviceName}
            onChange={(event) =>
              updateField("serviceName", event.target.value)
            }
            placeholder="Text"
            className={cn(errors.serviceName && "border-destructive")}
          />
          {errors.serviceName ? (
            <p className="text-sm text-destructive">
              {errors.serviceName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}
