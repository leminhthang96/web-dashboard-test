"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const sorted = column.getIsSorted()

  function handleSort() {
    if (sorted === false) {
      column.toggleSorting(false)
      return
    }

    if (sorted === "asc") {
      column.toggleSorting(true)
      return
    }

    column.clearSorting()
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={handleSort}
        aria-label={`Sắp xếp cột ${title}`}
      >
        <span>{title}</span>
        {sorted === "desc" ? (
          <ArrowDown className="ml-2 size-4" />
        ) : sorted === "asc" ? (
          <ArrowUp className="ml-2 size-4" />
        ) : (
          <ChevronsUpDown className="ml-2 size-4" />
        )}
      </Button>
    </div>
  )
}
