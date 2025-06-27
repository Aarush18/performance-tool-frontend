"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface User {
  id: number
  email: string
  role: string
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ email: "", role: "" })

  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState("")

  const [toastMsg, setToastMsg] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "" >("")

  const API_BASE = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/super-admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (Array.isArray(data)) setUsers(data)
      else setUsers([])
    } catch (err) {
      console.error("Failed to fetch users:", err)
      setError("Failed to load users.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserRole) {
      alert("All fields are required.")
      return
    }

    if (users.find((u) => u.email.trim().toLowerCase() === newUserEmail.trim().toLowerCase())) {
      alert("A user with this email already exists.")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/super-admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "User creation failed")
      }

      setToastType("success")
      setToastMsg("✅ User created successfully!")
      setTimeout(() => setToastMsg(""), 3000)

      setNewUserEmail("")
      setNewUserPassword("")
      setNewUserRole("")
      fetchUsers()
    } catch (err: any) {
      console.error("Create user failed:", err)
      setToastType("error")
      setToastMsg("❌ Error creating user!")
      setTimeout(() => setToastMsg(""), 3000)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/super-admin/delete-user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  
      if (!res.ok) {
        throw new Error("Failed to delete user")
      }
  
      setToastMsg("✅ User deleted successfully")
      setToastType("success")
      setTimeout(() => setToastMsg(""), 3000)
  
      fetchUsers()
    } catch (err) {
      console.error("Delete failed:", err)
      setToastMsg("❌ Error deleting user")
      setToastType("error")
      setTimeout(() => setToastMsg(""), 3000)
    }
  }

  const startEdit = (user: User) => {
    setEditingUserId(user.id)
    setEditForm({ email: user.email, role: user.role })
  }

  const handleEditChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value })
  }

  const handleEditSave = async () => {
    if (!editingUserId || !editForm.email || !editForm.role) {
      alert("Both email and role are required.")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/super-admin/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: editForm.email,
          role: editForm.role.toLowerCase(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Update failed")
      }

      setEditingUserId(null)
      fetchUsers()
    } catch (err: any) {
      console.error("Edit save failed:", err)
      alert(err.message)
    }
  }

  const handleRoleAssign = async () => {
    if (!selectedUserId || !selectedRole) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/super-admin/users/${selectedUserId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole.toLowerCase() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to assign role")
      }

      setSelectedUserId("")
      setSelectedRole("")
      fetchUsers()
    } catch (err) {
      console.error("Role update failed", err)
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
          🚀 Super Admin - User Management
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

      <Card className="bg-[#1e293b] shadow-xl border border-sky-500/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-sky-300">Create New User</h3>
            <Link href="/super-admin/create-user">
              <Button className="bg-sky-600 hover:bg-sky-500 transition">
                Create New User
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input className="bg-slate-800 text-white" placeholder="Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
            <Input className="bg-slate-800 text-white" placeholder="Password" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
            <Select value={newUserRole} onValueChange={setNewUserRole}>
              <SelectTrigger className="bg-slate-800 text-white">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {["ceo", "manager", "hr", "employee", "admin", "super-admin"].map((r) => (
                  <SelectItem key={r} value={r}>{r.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateUser} className="bg-sky-600 hover:bg-sky-500 transition">Create User</Button>
        </CardContent>
      </Card>

      <Card className="bg-[#1e293b] shadow-xl border border-sky-500/30">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-2xl font-semibold text-sky-300">Assign Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="bg-slate-800 text-white">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>{user.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-slate-800 text-white">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {["ceo", "manager", "hr", "employee", "admin", "super-admin"].map((r) => (
                  <SelectItem key={r} value={r}>{r.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleRoleAssign} className="bg-sky-600 hover:bg-sky-500 transition">Assign Role</Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-sky-800" />

      <h3 className="text-2xl font-semibold text-sky-300">User List</h3>
      {loading ? (
        <p className="text-sky-400">Loading...</p>
      ) : (
        users.map((user) => (
          <div key={user.id} className="border border-sky-800 bg-slate-900 text-white p-4 rounded-md flex justify-between items-center shadow hover:shadow-lg transition duration-300">
            {editingUserId === user.id ? (
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <Input value={editForm.email} onChange={(e) => handleEditChange("email", e.target.value)} className="bg-slate-800 text-white" />
                <Select value={editForm.role} onValueChange={(val) => handleEditChange("role", val)}>
                  <SelectTrigger className="bg-slate-800 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {["ceo", "manager", "hr", "employee", "admin", "super-admin"].map((r) => (
                      <SelectItem key={r} value={r}>{r.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleEditSave} size="sm" className="bg-emerald-600 hover:bg-emerald-500">Save</Button>
              </div>
            ) : (
              <>
                <div>
                  <strong>{user.email}</strong> ({user.role.toUpperCase()})
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    onClick={() => startEdit(user)}
                    className="border border-cyan-400 text-cyan-300 hover:bg-cyan-700/10 transition duration-300"
                  >
                    Edit
                  </Button>

                  <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  )
} 