"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Họ và tên" />
      ),
      cell: ({ row }) => {
        const customer = row.original

        return (
          <div className="flex min-w-48 items-center gap-2">
            <span className="font-medium">{customer.fullName}</span>
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
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <a
          href={`mailto:${row.getValue<string>("email")}`}
          className="text-primary hover:underline"
        >
          {row.getValue("email") || "—"}
        </a>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
      cell: ({ row }) => row.getValue("phoneNumber") || "—",
      enableSorting: false,
    },
    {
      accessorKey: "serviceName",
      header: "Dịch vụ",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("serviceName") || "Chưa xác định"}
        </Badge>
      ),
      filterFn: "equalsString",
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
