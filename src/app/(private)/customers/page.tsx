"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshCcw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DynamicCustomerOverview } from "@/components/dynamic-imports"
import { getCustomerColumns } from "@/modules/customers/components/columns"
import { DataTable } from "@/modules/customers/components/data-table"
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "@/modules/customers/services/customer-services"
import type {
  Customer,
  CustomerFormData,
} from "@/modules/customers/services/types/customer-types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refreshCustomers = useCallback(async () => {
    try {
      setLoadError(null)
      const customerList = await getCustomers()
      setCustomers(customerList)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách khách hàng."
      setLoadError(message)
      throw error
    }
  }, [])

  useEffect(() => {
    refreshCustomers()
      .catch((error) => {
        console.error("Failed to load customers:", error)
      })
      .finally(() => setLoading(false))
  }, [refreshCustomers])

  useEffect(() => {
    const refreshExternalCustomers = () => {
      void refreshCustomers().catch((error) => {
        console.error("Failed to refresh customers:", error)
      })
    }
    const intervalId = window.setInterval(refreshExternalCustomers, 30000)

    window.addEventListener("focus", refreshExternalCustomers)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", refreshExternalCustomers)
    }
  }, [refreshCustomers])

  const handleAddCustomer = useCallback(async (data: CustomerFormData) => {
    const createdCustomer = await createCustomer(data)
    setCustomers((current) => [createdCustomer, ...current])
    toast.success("Đã thêm khách hàng")
  }, [])

  const handleUpdateCustomer = useCallback(async (customer: Customer) => {
    const updatedCustomer = await updateCustomer(customer)
    setCustomers((current) =>
      current.map((item) =>
        item.id === updatedCustomer.id ? updatedCustomer : item
      )
    )
    toast.success("Đã cập nhật khách hàng")
  }, [])

  const handleDeleteCustomer = useCallback(async (customerId: string) => {
    await deleteCustomer(customerId)
    setCustomers((current) =>
      current.filter((customer) => customer.id !== customerId)
    )
    toast.success("Đã xóa khách hàng")
  }, [])

  const customerColumns = useMemo(
    () =>
      getCustomerColumns({
        onUpdateCustomer: handleUpdateCustomer,
        onDeleteCustomer: handleDeleteCustomer,
      }),
    [handleDeleteCustomer, handleUpdateCustomer]
  )

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">
          Đang tải danh sách khách hàng...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 md:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Khách hàng</h1>
        <p className="text-muted-foreground">
          Danh sách khách hàng được đọc bằng tài khoản đang đăng nhập và tuân
          theo quyền truy cập trong Firestore Rules.
        </p>
      </div>

      {loadError ? (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-destructive">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void refreshCustomers().catch(() => undefined)
              }}
            >
              <RefreshCcw className="size-4" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          <DynamicCustomerOverview customers={customers} />
          <DataTable
            data={customers}
            columns={customerColumns}
            onAddCustomer={handleAddCustomer}
          />
        </div>
      )}
    </div>
  )
}
