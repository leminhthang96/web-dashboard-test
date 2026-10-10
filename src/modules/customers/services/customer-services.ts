import {
  customerFormSchema,
  customerSchema,
  type Customer,
  type CustomerFormData,
} from "./types/customer-types"

interface ApiResult<T = unknown> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

async function readApiResult<T>(response: Response): Promise<ApiResult<T>> {
  try {
    return (await response.json()) as ApiResult<T>
  } catch {
    return {
      success: false,
      message: "Máy chủ trả về dữ liệu không hợp lệ.",
    }
  }
}

function getApiErrorMessage<T>(
  response: Response,
  result: ApiResult<T>,
  fallback: string
): string {
  if (result.message) return result.message
  if (response.status === 401) return "Bạn cần đăng nhập để tiếp tục."
  if (response.status === 403) return "Bạn không có quyền quản trị khách hàng."
  return fallback
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch("/api/admin/customers", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })
  const result = await readApiResult<{ customers: Customer[] }>(response)

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      getApiErrorMessage(
        response,
        result,
        "Không thể tải danh sách khách hàng."
      )
    )
  }

  return customerSchema.array().parse(result.data.customers)
}

export async function createCustomer(
  formData: CustomerFormData
): Promise<Customer> {
  const payload = customerFormSchema.parse(formData)
  const response = await fetch("/api/admin/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const result = await readApiResult<{ customer: Customer }>(response)

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      getApiErrorMessage(response, result, "Không thể thêm khách hàng.")
    )
  }

  return customerSchema.parse(result.data.customer)
}

export async function updateCustomer(customer: Customer): Promise<Customer> {
  const payload = customerFormSchema.parse(customer)
  const response = await fetch(`/api/admin/customers/${customer.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const result = await readApiResult<{ customer: Customer }>(response)

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      getApiErrorMessage(response, result, "Không thể cập nhật khách hàng.")
    )
  }

  return customerSchema.parse(result.data.customer)
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const response = await fetch(`/api/admin/customers/${customerId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  const result = await readApiResult(response)

  if (!response.ok || !result.success) {
    throw new Error(
      getApiErrorMessage(response, result, "Không thể xóa khách hàng.")
    )
  }
}
