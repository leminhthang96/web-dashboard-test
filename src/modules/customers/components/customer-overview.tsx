"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  CircleAlert,
  PhoneCall,
  UserPlus,
  Users,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getCustomerCategoryLabel } from "@/modules/customers/services/customer-mock-data"
import type { Customer } from "@/modules/customers/services/types/customer-types"

const trendChartConfig = {
  customers: {
    label: "Khách hàng",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const categoryChartConfig = {
  value: {
    label: "Khách hàng",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const genderChartConfig = {
  male: {
    label: "Nam",
    color: "var(--chart-1)",
  },
  female: {
    label: "Nữ",
    color: "var(--chart-2)",
  },
  unknown: {
    label: "Chưa xác định",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const genderColors = {
  male: "var(--color-male)",
  female: "var(--color-female)",
  unknown: "var(--color-unknown)",
} as const

interface CustomerOverviewProps {
  customers: Customer[]
}

function getValidDate(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      Chưa có dữ liệu để hiển thị.
    </div>
  )
}

export function CustomerOverview({ customers }: CustomerOverviewProps) {
  const insights = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const customersWithPhone = customers.filter((customer) =>
      customer.phone.trim()
    ).length
    const newCustomers = customers.filter((customer) => {
      const createdAt = getValidDate(customer.createdAt)
      return createdAt && createdAt >= thirtyDaysAgo && createdAt <= now
    }).length
    const customersNeedingUpdates = customers.filter(
      (customer) =>
        customer.dataWarnings.some(
          (warning) => warning !== "Chưa gán userId"
        ) ||
        !customer.address.trim() ||
        !customer.phone.trim() ||
        !customer.gender
    ).length

    const categoryCounts = new Map<string, number>()
    customers.forEach((customer) => {
      const category = customer.category || "other"
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    })
    const categoryData = Array.from(categoryCounts.entries())
      .map(([category, value]) => ({
        category,
        label: getCustomerCategoryLabel(category),
        value,
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6)

    const monthStarts = Array.from({ length: 6 }, (_, index) => {
      return new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    })
    const trendData = monthStarts.map((monthStart) => ({
      key: getMonthKey(monthStart),
      month: monthStart.toLocaleDateString("vi-VN", {
        month: "short",
        year: "2-digit",
      }),
      customers: 0,
    }))
    const trendByMonth = new Map(
      trendData.map((item) => [item.key, item] as const)
    )
    customers.forEach((customer) => {
      const createdAt = getValidDate(customer.createdAt)
      if (!createdAt) return
      const item = trendByMonth.get(getMonthKey(createdAt))
      if (item) item.customers += 1
    })

    const genderData = [
      {
        gender: "male" as const,
        label: "Nam",
        value: customers.filter((customer) => customer.gender === "male")
          .length,
      },
      {
        gender: "female" as const,
        label: "Nữ",
        value: customers.filter((customer) => customer.gender === "female")
          .length,
      },
      {
        gender: "unknown" as const,
        label: "Chưa xác định",
        value: customers.filter((customer) => !customer.gender).length,
      },
    ].filter((item) => item.value > 0)

    return {
      total: customers.length,
      newCustomers,
      customersWithPhone,
      customersNeedingUpdates,
      phoneRate:
        customers.length > 0
          ? Math.round((customersWithPhone / customers.length) * 100)
          : 0,
      topCategory: categoryData[0]?.label ?? "Chưa có",
      categoryCount: categoryCounts.size,
      categoryData,
      trendData,
      genderData,
    }
  }, [customers])

  const metrics = [
    {
      label: "Tổng khách hàng",
      value: insights.total.toLocaleString("vi-VN"),
      detail: `${insights.categoryCount} danh mục đang có dữ liệu`,
      icon: Users,
    },
    {
      label: "Khách mới 30 ngày",
      value: insights.newCustomers.toLocaleString("vi-VN"),
      detail: `Danh mục nổi bật: ${insights.topCategory}`,
      icon: UserPlus,
    },
    {
      label: "Có số điện thoại",
      value: `${insights.phoneRate}%`,
      detail: `${insights.customersWithPhone}/${insights.total} khách hàng`,
      icon: PhoneCall,
    },
    {
      label: "Cần bổ sung dữ liệu",
      value: insights.customersNeedingUpdates.toLocaleString("vi-VN"),
      detail: "Thiếu liên hệ hoặc thông tin hồ sơ",
      icon: CircleAlert,
    },
  ]

  return (
    <section className="space-y-4" aria-label="Tổng quan khách hàng">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Card
              key={metric.label}
              className="gap-4 bg-gradient-to-br from-primary/5 to-card py-5 shadow-xs"
            >
              <CardHeader className="grid grid-cols-[1fr_auto] gap-3 px-5">
                <div className="space-y-2">
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">
                    {metric.value}
                  </CardTitle>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="px-5 text-xs text-muted-foreground">
                {metric.detail}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle>Khách hàng theo thời gian</CardTitle>
            <CardDescription>Số khách hàng mới trong 6 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-5">
            {insights.total === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer
                config={trendChartConfig}
                className="h-[240px] w-full"
              >
                <AreaChart
                  data={insights.trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="customerTrendFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-customers)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-customers)"
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="customers"
                    type="monotone"
                    fill="url(#customerTrendFill)"
                    stroke="var(--color-customers)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle>Phân bổ theo danh mục</CardTitle>
            <CardDescription>Tối đa 6 danh mục có nhiều khách nhất</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-5">
            {insights.categoryData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer
                config={categoryChartConfig}
                className="h-[240px] w-full"
              >
                <BarChart
                  data={insights.categoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 16, left: 4, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={82}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: string) =>
                      value.length > 12 ? `${value.slice(0, 11)}…` : value
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.label ?? "Danh mục"
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="gap-4 py-5 lg:col-span-2 xl:col-span-1">
          <CardHeader className="px-5">
            <CardTitle>Cơ cấu giới tính</CardTitle>
            <CardDescription>Tỷ trọng giới tính trong danh sách</CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            {insights.genderData.length === 0 ? (
              <EmptyChart />
            ) : (
              <>
                <ChartContainer
                  config={genderChartConfig}
                  className="mx-auto h-[180px] w-full max-w-[260px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent hideLabel nameKey="gender" />
                      }
                    />
                    <Pie
                      data={insights.genderData}
                      dataKey="value"
                      nameKey="gender"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {insights.genderData.map((item) => (
                        <Cell
                          key={item.gender}
                          fill={genderColors[item.gender]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  {insights.genderData.map((item) => (
                    <div
                      key={item.gender}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor: genderColors[item.gender],
                          }}
                        />
                        {item.label}
                      </div>
                      <span className="font-medium tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
