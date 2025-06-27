"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

export default function SuperAdminCreateUserPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ""
  })
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "">("")

  const API_BASE = process.env.NEXT_PUBLIC_API_URL

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.role) {
      setToastType("error")
      setToastMsg("All fields are required!")
      setTimeout(() => setToastMsg(""), 3000)
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/super-admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "User creation failed")
      }

      setToastType("success")
      setToastMsg("✅ User created successfully!")
      setTimeout(() => setToastMsg(""), 3000)

      // Reset form
      setFormData({
        email: "",
        password: "",
        role: ""
      })
    } catch (err: any) {
      console.error("Create user failed:", err)
      setToastType("error")
      setToastMsg(`❌ ${err.message}`)
      setTimeout(() => setToastMsg(""), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6 min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-sky-100 font-mono transition-all duration-500 ease-in-out">
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white font-semibold transition-all duration-500 ${toastType === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
        >
          {toastMsg}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-extrabold tracking-wide drop-shadow-lg animate-pulse">
          🚀 Super Admin - Create User
        </h2>
        <div className="space-x-4">
          <Link href="/super-admin/users">
            <Button className="bg-sky-600 hover:bg-sky-500 transition">
              Manage Users
            </Button>
          </Link>
          <Link href="/super-admin">
            <Button className="bg-cyan-600 hover:bg-cyan-500 transition">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-[#1e293b] shadow-xl border border-sky-500/30 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-sky-300 text-2xl">Create New User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sky-200">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter user email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-slate-800 text-white border-sky-500/50 focus:border-sky-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sky-200">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter user password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="bg-slate-800 text-white border-sky-500/50 focus:border-sky-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sky-200">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger className="bg-slate-800 text-white border-sky-500/50 focus:border-sky-400">
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                {["ceo", "manager", "hr", "admin", "super-admin"].map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCreateUser}
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-500 transition flex-1"
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
            <Link href="/super-admin/users" className="flex-1">
              <Button variant="outline" className="w-full border-sky-500/50 text-sky-300 hover:bg-sky-500/10">
                Cancel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-2xl mx-auto">
        <Card className="bg-[#1e293b] shadow-xl border border-sky-500/30">
          <CardHeader>
            <CardTitle className="text-sky-300">Role Descriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-sky-300">CEO</h4>
                <p className="text-sm text-slate-300">Full access to performance notes and activity logs</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-sky-300">Manager</h4>
                <p className="text-sm text-slate-300">Can manage team notes and view assigned employees</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-sky-300">HR</h4>
                <p className="text-sm text-slate-300">Access to public performance notes</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-sky-300">Admin</h4>
                <p className="text-sm text-slate-300">User and team management capabilities</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-sky-300">Super Admin</h4>
                <p className="text-sm text-slate-300">Complete system control and management</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 