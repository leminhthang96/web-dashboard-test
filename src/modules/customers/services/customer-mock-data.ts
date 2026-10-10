export const customerCategoryOptions = [
  { value: "education", label: "Giáo dục" },
  { value: "sales", label: "Kinh doanh" },
  { value: "marketing", label: "Marketing" },
  { value: "worker", label: "Công nhân" },
  { value: "other", label: "Khác" },
] as const

export const customerGenderOptions = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
] as const

export function getCustomerCategoryLabel(value: string): string {
  const knownCategory = customerCategoryOptions.find(
    (option) => option.value === value
  )

  if (knownCategory) return knownCategory.label

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase() + part.slice(1))
    .join(" ")
}
