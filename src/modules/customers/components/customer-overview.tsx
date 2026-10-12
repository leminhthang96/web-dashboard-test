"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { CircleAlert, PhoneCall, UserPlus, Users } from "lucide-react"

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
import type { Customer } from "@/modules/customers/services/types/customer-types"

const trendChartConfig = {
  customers: {
    label: "Khách hàng",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const serviceChartConfig = {
  value: {
    label: "Khách hàng",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

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
      customer.phoneNumber.trim()
    ).length
    const newCustomers = customers.filter((customer) => {
      const createdAt = getValidDate(customer.createdAt)
      return createdAt && createdAt >= thirtyDaysAgo && createdAt <= now
    }).length
    const customersNeedingUpdates = customers.filter(
      (customer) => customer.dataWarnings.length > 0
    ).length

    const serviceCounts = new Map<string, number>()
    customers.forEach((customer) => {
      const serviceName = customer.serviceName || "Chưa xác định"
      serviceCounts.set(
        serviceName,
        (serviceCounts.get(serviceName) ?? 0) + 1
      )
    })
    const serviceData = Array.from(serviceCounts.entries())
      .map(([serviceName, value]) => ({ serviceName, value }))
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

    return {
      total: customers.length,
      newCustomers,
      customersWithPhone,
      customersNeedingUpdates,
      phoneRate:
        customers.length > 0
          ? Math.round((customersWithPhone / customers.length) * 100)
          : 0,
      topService: serviceData[0]?.serviceName ?? "Chưa có",
      serviceCount: serviceCounts.size,
      serviceData,
      trendData,
    }
  }, [customers])

  const metrics = [
    {
      label: "Tổng khách hàng",
      value: insights.total.toLocaleString("vi-VN"),
      detail: `${insights.serviceCount} dịch vụ đang có dữ liệu`,
      icon: Users,
    },
    {
      label: "Khách mới 30 ngày",
      value: insights.newCustomers.toLocaleString("vi-VN"),
      detail: `Dịch vụ nổi bật: ${insights.topService}`,
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
      detail: "Thiếu một trong bốn trường thông tin",
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle>Khách hàng theo thời gian</CardTitle>
            <CardDescription>
              Số khách hàng mới trong 6 tháng gần nhất
            </CardDescription>
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
                    fill="var(--color-customers)"
                    fillOpacity={0.15}
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
            <CardTitle>Phân bổ theo dịch vụ</CardTitle>
            <CardDescription>
              Tối đa 6 dịch vụ có nhiều khách hàng nhất
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-5">
            {insights.serviceData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer
                config={serviceChartConfig}
                className="h-[240px] w-full"
              >
                <BarChart
                  data={insights.serviceData}
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
                    dataKey="serviceName"
                    type="category"
                    width={100}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: string) =>
                      value.length > 14 ? `${value.slice(0, 13)}…` : value
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
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
      </div>
    </section>
  )
}
