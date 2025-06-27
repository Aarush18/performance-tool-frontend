"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface User {
  id: number
  email: string
}

interface Employee extends User {
  manager_id: number | null
}

export default function ManageTeams() {
  const [managers, setManagers] = useState<User[]>([])
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [selectedManagerId, setSelectedManagerId] = useState<string>("")
  const [teamMembers, setTeamMembers] = useState<Employee[]>([])
  const [unassignedEmployees, setUnassignedEmployees] = useState<Employee[]>([])
  const [toastMsg, setToastMsg] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "">("")
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    console.log("Token from localStorage:", storedToken)
    if (storedToken) setToken(storedToken)
  }, [])
  
  useEffect(() => {
    if (token) {
      console.log("Triggering fetch with token:", token)
      fetchManagers()
      fetchAllEmployees()
    }
  }, [token])
  

  useEffect(() => {
    if (token) {
      fetchManagers()
      fetchAllEmployees()
    }
  }, [token])

  useEffect(() => {
    refreshTeamViews()
  }, [selectedManagerId, allEmployees])

  const refreshTeamViews = () => {
    const managerIdNum = Number(selectedManagerId)
    if (managerIdNum) {
      setTeamMembers(allEmployees.filter(emp => emp.manager_id === managerIdNum))
      setUnassignedEmployees(allEmployees.filter(emp => emp.manager_id === null)) // ✅ fixed
    } else {
      setTeamMembers([])
      setUnassignedEmployees(allEmployees.filter(emp => emp.manager_id === null))
    }
  }

  const fetchManagers = async () => {
    try {
      console.log("Fetching managers...")
      const res = await fetch(`${API_BASE}/api/admin/managers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      console.log("Managers data:", data)
      if (Array.isArray(data)) setManagers(data)
    } catch (err) {
      console.error("Failed to fetch managers:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/employees-with-status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (Array.isArray(data)) setAllEmployees(data)
    } catch (err) {
      console.error("Failed to fetch employees:", err)
    }
  }

  const fetchUnassignedEmployees = async () => {
    try {
      console.log("Fetching unassigned employees...")
      const res = await fetch(`${API_BASE}/api/admin/employees/unassigned`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      console.log("Unassigned employees data:", data)
      if (Array.isArray(data)) setUnassignedEmployees(data)
    } catch (err) {
      console.error("Failed to fetch unassigned employees:", err)
    }
  }

  const fetchTeamMembers = async (managerId: string) => {
    try {
      console.log(`Fetching team for manager ID: ${managerId}`)
      const res = await fetch(`${API_BASE}/api/admin/managers/${managerId}/team`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      console.log("Team members data:", data)
      if (Array.isArray(data)) setTeamMembers(data)
    } catch (err) {
      console.error("Failed to fetch team members:", err)
    }
  }

  const showToast = (msg: string, type: "success" | "error") => {
    setToastMsg(msg)
    setToastType(type)
    setTimeout(() => setToastMsg(""), 3000)
  }

  const handleAddEmployee = async (employeeId: number) => {
    if (!selectedManagerId) {
      showToast("Please select a manager first.", "error")
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/managers/${selectedManagerId}/team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to add employee")
      }

      showToast("✅ Employee added successfully!", "success")
      await fetchAllEmployees()
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error")
    }
  }

  const handleRemoveEmployee = async (employeeId: number) => {
    if (!selectedManagerId) return

    try {
      const res = await fetch(`${API_BASE}/api/admin/managers/${selectedManagerId}/team/${employeeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to remove employee")
      }

      showToast("✅ Employee removed successfully!", "success")
      await fetchAllEmployees()
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error")
    }
  }

  return (
    <div className="p-8 space-y-6 min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-slate-200 font-mono">
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white font-semibold transition-all duration-500 ${
            toastType === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toastType === "success" ? "✅" : "❌"} {toastMsg}
        </div>
      )}

      <h2 className="text-4xl font-extrabold tracking-wide drop-shadow-lg">Manage Teams</h2>

      <Card className="bg-[#1e293b] shadow-xl border border-sky-500/30">
        <CardHeader>
          <CardTitle className="text-sky-300">Select a Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
            <SelectTrigger className="bg-slate-800 text-white">
              <SelectValue placeholder="Select a manager to view their team" />
            </SelectTrigger>
            <SelectContent>
              {managers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id.toString()}>
                  {manager.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Separator className="bg-sky-800" />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Manager's Team */}
        <Card className="bg-[#1e293b] shadow-xl border border-sky-500/30">
          <CardHeader>
            <CardTitle className="text-sky-300">Manager's Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div key={member.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg">
                  <span className="font-medium text-white">{member.email}</span>
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveEmployee(member.id)}>
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sky-400">No team members yet, or no manager selected.</p>
            )}
          </CardContent>
        </Card>

        {/* Unassigned Employees */}
        <Card className="bg-[#1e293b] shadow-xl border border-sky-500/30">
          <CardHeader>
            <CardTitle className="text-sky-300">Available Employees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unassignedEmployees.length > 0 ? (
              unassignedEmployees.map((employee) => (
                <div key={employee.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg">
                  <span className="font-medium text-white">{employee.email}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAddEmployee(employee.id)}
                    className="bg-sky-600 hover:bg-sky-500"
                  >
                    Add to Team
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sky-400">No unassigned employees available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
