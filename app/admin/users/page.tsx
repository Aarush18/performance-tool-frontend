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

interface User {
  id: number
  email: string
  role: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ email: "", role: "" })

  // New User Form State
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState("")

  const API_BASE = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/admin/users`, {
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
  
    // ✅ Email already exists? Don't even send API request
    if (users.find((u) => u.email.trim().toLowerCase() === newUserEmail.trim().toLowerCase())) {
      alert("A user with this email already exists.")
      return
    }
  
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/admin/create-user`, {
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
  
      // ✅ Clear form & refresh list
      setNewUserEmail("")
      setNewUserPassword("")
      setNewUserRole("")
      fetchUsers()
    } catch (err: any) {
      console.error("Create user failed:", err)
      alert("Error: " + (err.message || "Could not create user"))
    }
  }
  
  
  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`${API_BASE}/api/admin/delete-user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      fetchUsers()
    } catch (err) {
      console.error("Delete failed:", err)
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
      alert("Both email and role are required.");
      return;
    }
      
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/api/admin/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            email: editForm.email,
            role: editForm.role.toLowerCase(),  // 🔥 this fixes the issue
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
      const res = await fetch(`${API_BASE}/api/admin/users/${selectedUserId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole.toLowerCase() }),
      })
  
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to assign role")
      }
  
      // ✅ Clear fields and refresh users
      setSelectedUserId("")
      setSelectedRole("")
      fetchUsers()
    } catch (err) {
      console.error("Role update failed", err)
    }
  }
  

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>

      {/* CREATE USER */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">Create New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
            <Input placeholder="Password" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
            <Select value={newUserRole} onValueChange={setNewUserRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ceo">CEO</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateUser}>Create User</Button>
        </CardContent>
      </Card>

      {/* ASSIGN ROLE */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">Assign Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ceo">CEO</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleRoleAssign}>Assign Role</Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* USER LIST */}
      <h3 className="text-xl font-semibold">User List</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        users.map((user) => (
          <div key={user.id} className="border p-3 rounded flex justify-between items-center">
            {editingUserId === user.id ? (
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <Input value={editForm.email} onChange={(e) => handleEditChange("email", e.target.value)} />
                <Select value={editForm.role} onValueChange={(val) => handleEditChange("role", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleEditSave} size="sm">Save</Button>
              </div>
            ) : (
              <>
                <div>
                  <strong>{user.email}</strong> ({user.role})
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(user)}>Edit</Button>
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
