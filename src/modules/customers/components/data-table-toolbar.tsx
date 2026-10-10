"use client"

import type { Table } from "@tanstack/react-table"
import { FileDown, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  customerCategoryOptions,
  getCustomerCategoryLabel,
} from "@/modules/customers/services/customer-mock-data"
import type {
  Customer,
  CustomerFormData,
} from "@/modules/customers/services/types/customer-types"
import { AddCustomerModal } from "./add-customer-modal"
import { DataTableViewOptions } from "./data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddCustomer?: (customer: CustomerFormData) => void | Promise<void>
}

export function DataTableToolbar<TData>({
  table,
  onAddCustomer,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const categoryFilter = table.getColumn("category")?.getFilterValue() as
    | string
    | undefined
  const categoryLabels = new Map<string, string>(
    customerCategoryOptions.map((option) => [option.value, option.label])
  )

  table.getCoreRowModel().rows.forEach((row) => {
    const category = (row.original as Customer).category
    if (!categoryLabels.has(category)) {
      categoryLabels.set(category, getCustomerCategoryLabel(category))
    }
  })

  const availableCategories = Array.from(categoryLabels, ([value, label]) => ({
    value,
    label,
  })).sort((left, right) => left.label.localeCompare(right.label, "vi"))

  function handleExportCsv() {
    const customers = table
      .getPrePaginationRowModel()
      .rows.map((row) => row.original as Customer)
    const escapeCsv = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`
    const header = [
      "Tên",
      "Danh mục",
      "Địa chỉ",
      "Email",
      "Điện thoại",
      "Giới tính",
      "Ghi chú",
    ]
    const rows = customers.map((customer) => [
      customer.name,
      categoryLabels.get(customer.category) ?? customer.category,
      customer.address,
      customer.email,
      customer.phone,
      customer.gender === "male"
        ? "Nam"
        : customer.gender === "female"
          ? "Nữ"
          : "",
      customer.notes,
    ])
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n")
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = downloadUrl
    link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Input
          placeholder="Tìm theo tên khách hàng..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="min-w-0 flex-1 sm:max-w-72"
        />

        <Select
          value={categoryFilter ?? "all"}
          onValueChange={(value) =>
            table
              .getColumn("category")
              ?.setFilterValue(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-40 shrink-0 sm:w-44">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => table.resetColumnFilters()}
          disabled={!isFiltered}
          aria-label="Đặt lại bộ lọc"
          title="Đặt lại bộ lọc"
        >
          <RefreshCcw className="size-4" />
        </Button>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={table.getPrePaginationRowModel().rows.length === 0}
        >
          <FileDown className="size-4" />
          Xuất file
        </Button>
        <DataTableViewOptions table={table} />
        <AddCustomerModal onAddCustomer={onAddCustomer} />
      </div>
    </div>
  )
}
