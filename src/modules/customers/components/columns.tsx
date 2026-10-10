"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  customerCategoryOptions,
  customerGenderOptions,
  getCustomerCategoryLabel,
} from "@/modules/customers/services/customer-mock-data"
import type { Customer } from "@/modules/customers/services/types/customer-types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

interface CustomerColumnActions {
  onUpdateCustomer?: (customer: Customer) => void | Promise<void>
  onDeleteCustomer?: (customerId: string) => void | Promise<void>
}

export function getCustomerColumns({
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerColumnActions = {}): ColumnDef<Customer>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Chọn khách hàng"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tên" />
      ),
      cell: ({ row }) => {
        const customer = row.original

        return (
          <div className="flex min-w-40 items-center gap-2">
            <span className="font-medium">{customer.name}</span>
            {customer.dataWarnings.length ? (
              <span
                className="text-amber-600"
                title={customer.dataWarnings.join("; ")}
              >
                <AlertTriangle className="size-4" />
                <span className="sr-only">
                  {customer.dataWarnings.join("; ")}
                </span>
              </span>
            ) : null}
          </div>
        )
      },
      sortingFn: "alphanumeric",
      filterFn: "includesString",
      enableHiding: false,
    },
    {
      accessorKey: "category",
      header: "Danh mục",
      cell: ({ row }) => {
        const value = row.getValue<Customer["category"]>("category")
        const category = customerCategoryOptions.find(
          (option) => option.value === value
        )
        return (
          <Badge variant="outline">
            {category?.label ?? getCustomerCategoryLabel(value)}
          </Badge>
        )
      },
      filterFn: "equalsString",
      enableSorting: false,
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      cell: ({ row }) => (
        <span className="block max-w-52 truncate">
          {row.getValue("address") || "—"}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <a
          href={`mailto:${row.getValue<string>("email")}`}
          className="text-primary hover:underline"
        >
          {row.getValue("email")}
        </a>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "phone",
      header: "Điện thoại",
      cell: ({ row }) => row.getValue("phone") || "—",
      enableSorting: false,
    },
    {
      accessorKey: "gender",
      header: "Giới tính",
      cell: ({ row }) => {
        const value = row.getValue<Customer["gender"]>("gender")
        const gender = customerGenderOptions.find(
          (option) => option.value === value
        )
        return gender?.label ?? "—"
      },
      filterFn: "equalsString",
      enableSorting: false,
    },
    {
      accessorKey: "notes",
      header: "Ghi chú",
      cell: ({ row }) => {
        const notes = row.getValue<string>("notes")
        return (
          <span className="block max-w-64 truncate" title={notes}>
            {notes || "—"}
          </span>
        )
      },
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onUpdateCustomer={onUpdateCustomer}
          onDeleteCustomer={onDeleteCustomer}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}

export const columns = getCustomerColumns()
