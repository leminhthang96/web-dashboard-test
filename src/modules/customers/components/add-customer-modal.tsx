"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { CustomerFormData } from "@/modules/customers/services/types/customer-types"
import { CustomerForm } from "./customer-form"

interface AddCustomerModalProps {
  onAddCustomer?: (customer: CustomerFormData) => void | Promise<void>
  trigger?: React.ReactNode
}

export function AddCustomerModal({
  onAddCustomer,
  trigger,
}: AddCustomerModalProps) {
  const [open, setOpen] = React.useState(false)

  async function handleAddCustomer(data: CustomerFormData) {
    await onAddCustomer?.(data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" size="sm">
            <Plus className="size-4" />
            Thêm khách hàng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm khách hàng</DialogTitle>
          <DialogDescription>
            Các trường tên, danh mục và email là bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          key={open ? "add-customer-open" : "add-customer-closed"}
          submitLabel="Thêm khách hàng"
          submittingLabel="Đang lưu..."
          onSubmit={handleAddCustomer}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
