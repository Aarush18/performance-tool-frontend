"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function SuperAdminCreateEmployeePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  })
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "">("")

  const API_BASE = process.env.NEXT_PUBLIC_API_URL

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateEmployee = async () => {
    if (!formData.name || !formData.email) {
      setToastType("error")
      setToastMsg("Name and email are required!")
      setTimeout(() => setToastMsg(""), 3000)
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/super-admin/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Employee creation failed")
      }

      setToastType("success")
      setToastMsg("✅ Employee created successfully!")
      setTimeout(() => setToastMsg(""), 3000)

      // Reset form
      setFormData({
        name: "",
        email: ""
      })
    } catch (err: any) {
      console.error("Create employee failed:", err)
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
          🚀 Super Admin - Create Employee
        </h2>
        <div className="space-x-4">
          <Link href="/super-admin/teams">
            <Button className="bg-sky-600 hover:bg-sky-500 transition">
              Manage Teams
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
          <CardTitle className="text-sky-300 text-2xl">Create New Employee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sky-200">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter employee name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-slate-800 text-white border-sky-500/50 focus:border-sky-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sky-200">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter employee email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-slate-800 text-white border-sky-500/50 focus:border-sky-400"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCreateEmployee}
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-500 transition flex-1"
            >
              {loading ? "Creating..." : "Create Employee"}
            </Button>
            <Link href="/super-admin/teams" className="flex-1">
              <Button variant="outline" className="w-full border-sky-500/50 text-sky-300 hover:bg-sky-500/10">
                Cancel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 