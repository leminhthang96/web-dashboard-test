import { BarChart3, FileCheck2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Dashboard3Page() {
  return (
    <div className="space-y-6 px-4 md:px-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard 3</h1>
        <p className="text-muted-foreground">
          Tổng quan dành cho Ban giám đốc và bộ phận Kế toán.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Báo cáo tổng hợp
            </CardTitle>
            <CardDescription>
              Khu vực tổng hợp số liệu quản trị và kế toán.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Chưa có dữ liệu báo cáo.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="size-5" />
              Tài liệu ISO
            </CardTitle>
            <CardDescription>
              Theo dõi và truy cập tài liệu ISO của tổ chức.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Sử dụng menu ISO Documents để xem danh sách tài liệu.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
