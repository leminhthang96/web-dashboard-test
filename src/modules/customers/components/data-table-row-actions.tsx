"use client"

import * as React from "react"
import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  customerSchema,
  type Customer,
  type CustomerFormData,
} from "@/modules/customers/services/types/customer-types"
import { CustomerForm } from "./customer-form"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onUpdateCustomer?: (customer: Customer) => void | Promise<void>
  onDeleteCustomer?: (customerId: string) => void | Promise<void>
}

export function DataTableRowActions<TData>({
  row,
  onUpdateCustomer,
  onDeleteCustomer,
}: DataTableRowActionsProps<TData>) {
  const parsed = customerSchema.safeParse(row.original)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  if (!parsed.success) return null

  const customer = parsed.data
  const formValues: CustomerFormData = {
    name: customer.name,
    category: customer.category,
    address: customer.address,
    email: customer.email,
    phone: customer.phone,
    gender: customer.gender,
    notes: customer.notes,
  }

  async function handleUpdate(data: CustomerFormData) {
    await onUpdateCustomer?.({ ...customer, ...data })
    setEditOpen(false)
  }

  async function handleDelete() {
    try {
      setIsDeleting(true)
      setDeleteError(null)
      await onDeleteCustomer?.(customer.id)
      setDeleteOpen(false)
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Không thể xóa khách hàng. Vui lòng thử lại."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" className="size-8 p-0">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Mở menu thao tác</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setDeleteError(null)
              setDeleteOpen(true)
            }}
          >
            <Trash2 className="size-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sửa khách hàng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và lưu thay đổi vào Firebase.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            key={`${customer.id}-${editOpen ? "open" : "closed"}`}
            initialValues={formValues}
            submitLabel="Lưu thay đổi"
            submittingLabel="Đang lưu..."
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khách hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa khách hàng “{customer.name}”? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p className="text-sm text-destructive">{deleteError}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
            >
              {isDeleting ? "Đang xóa..." : "Xóa khách hàng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
