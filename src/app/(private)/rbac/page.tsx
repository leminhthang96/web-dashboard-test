"use client"

import { useState } from "react"
import { CheckCircle2, Database, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { roleMockData, userRoleMockData } from "@/modules/users/services/role-mock-data"
import { seedRbacWithClient } from "@/modules/users/services/role-services"

export default function RbacSeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)

  const handleSeed = async () => {
    try {
      setIsSeeding(true)
      setSeeded(false)
      await seedRbacWithClient()
      setSeeded(true)
      toast.success("Đã seed dữ liệu RBAC vào Firestore")
    } catch (error) {
      console.error("Seed RBAC failed:", error)
      const message =
        error instanceof Error
          ? error.message
          : "Không thể seed dữ liệu RBAC."
      toast.error(message)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="space-y-6 px-4 md:px-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Seed dữ liệu RBAC</h1>
        <p className="text-muted-foreground">
          Trang bootstrap này không yêu cầu role. Bạn chỉ cần đăng nhập trước
          khi seed dữ liệu.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <CardTitle>Roles</CardTitle>
            </div>
            <CardDescription>
              {roleMockData.length} role sẽ được ghi vào collection
              <code className="ml-1">roles</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {roleMockData.map((role) => (
                <li key={role.id} className="flex justify-between gap-4">
                  <span>{role.name}</span>
                  <code className="text-muted-foreground">{role.id}</code>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="size-5 text-primary" />
              <CardTitle>Users Roles</CardTitle>
            </div>
            <CardDescription>
              {userRoleMockData.length} mapping mẫu và một mapping
              Administrators cho tài khoản đang đăng nhập sẽ được ghi vào
              <code className="ml-1">users_roles</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Dữ liệu được ghi theo document ID cố định nên có thể bấm seed lại
              mà không tạo bản ghi trùng.
            </p>

            <Button
              type="button"
              size="lg"
              className="w-full cursor-pointer"
              disabled={isSeeding}
              onClick={handleSeed}
            >
              {isSeeding ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Database />
              )}
              {isSeeding ? "Đang seed dữ liệu..." : "Seed dữ liệu RBAC"}
            </Button>

            {seeded && (
              <div className="flex items-start gap-2 rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="mt-0.5 size-4" />
                <p>
                  Seed thành công. Hãy đăng xuất rồi đăng nhập lại để session
                  nhận role mới.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
