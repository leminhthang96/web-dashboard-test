"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  customerCategoryOptions,
  customerGenderOptions,
  getCustomerCategoryLabel,
} from "@/modules/customers/services/customer-mock-data"
import {
  customerFormSchema,
  type CustomerFormData,
} from "@/modules/customers/services/types/customer-types"

export const emptyCustomerForm: CustomerFormData = {
  name: "",
  category: "education",
  address: "",
  email: "",
  phone: "",
  gender: null,
  notes: "",
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
  const hasCustomCategory = !customerCategoryOptions.some(
    (category) => category.value === formData.category
  )

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
          <Label htmlFor="customer-name">Tên khách hàng *</Label>
          <Input
            id="customer-name"
            autoFocus
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Nguyễn Văn A"
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Danh mục *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              updateField(
                "category",
                value as CustomerFormData["category"]
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hasCustomCategory ? (
                <SelectItem value={formData.category}>
                  {getCustomerCategoryLabel(formData.category)}
                </SelectItem>
              ) : null}
              {customerCategoryOptions.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category ? (
            <p className="text-sm text-destructive">{errors.category}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email *</Label>
          <Input
            id="customer-email"
            type="email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="customer@example.com"
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-phone">Số điện thoại</Label>
          <Input
            id="customer-phone"
            value={formData.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="0901234567"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-address">Địa chỉ</Label>
          <Input
            id="customer-address"
            value={formData.address}
            onChange={(event) => updateField("address", event.target.value)}
            placeholder="Hà Nội"
          />
        </div>

        <div className="space-y-2">
          <Label>Giới tính</Label>
          <Select
            value={formData.gender ?? "unspecified"}
            onValueChange={(value) =>
              updateField(
                "gender",
                value === "unspecified"
                  ? null
                  : (value as CustomerFormData["gender"])
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unspecified">Chưa xác định</SelectItem>
              {customerGenderOptions.map((gender) => (
                <SelectItem key={gender.value} value={gender.value}>
                  {gender.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-notes">Ghi chú</Label>
        <Textarea
          id="customer-notes"
          value={formData.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Nhập ghi chú về khách hàng..."
          rows={5}
          className={cn(errors.notes && "border-destructive")}
        />
        <div className="flex items-center justify-between">
          {errors.notes ? (
            <p className="text-sm text-destructive">{errors.notes}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {formData.notes.length}/5000
          </span>
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
