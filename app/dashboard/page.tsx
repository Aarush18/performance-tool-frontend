"use client"

import { useEffect, useState } from "react"
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/auth-context"
import ProtectedRoute from "../components/protected-route"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthChecked(true)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/performance`)
        const data = await response.json()
        console.log("Performance data:", data)
      } catch (error) {
        console.error("Error fetching performance data:", error)
      }
    }

    if (isAuthChecked) fetchData()
  }, [isAuthChecked])

  const handleExportNotes = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Please log in to export notes.")
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/export`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to download PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `Performance_Notes_${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      console.error("Error downloading PDF:", err)
      alert("Failed to export notes.")
    }
  }

  if (!isAuthChecked || !user) return null

  return (
    <ProtectedRoute requiredRoles={["ceo", "manager", "hr", "admin", "super-admin"]}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
          py: 8,
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              boxShadow: "0 0 30px rgba(0,255,255,0.1)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  ⚡ Dashboard
                </Typography>
                <Typography variant="subtitle1">
                  Welcome, <span style={{ color: "#90caf9" }}>{user.name}</span> ({user.role.toUpperCase()})
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={logout}
                sx={{
                  borderRadius: 999,
                  color: "#fff",
                  borderColor: "#90caf9",
                  "&:hover": {
                    backgroundColor: "#90caf9",
                    color: "#000",
                  },
                }}
              >
                Logout
              </Button>
            </Box>

            <Grid container spacing={4}>
              {/* Super Admin View */}
              {user.role === "super-admin" && (
                <Grid item xs={12} md={4}>
                  <FuturisticCard
                    title="🚀 Super Admin Dashboard"
                    desc="Access the complete super admin dashboard with all powers"
                    actions={[
                      { label: "Super Admin Dashboard", onClick: () => router.push("/super-admin") },
                    ]}
                  />
                </Grid>
              )}

              {/* CEO View */}
              {user.role === "ceo" && (
                <>
                  <Grid item xs={12} md={4}>
                    <FuturisticCard
                      title="🧾 Employee Notes"
                      desc="View and manage performance notes for all employees"
                      actions={[
                        { label: "View Notes", onClick: () => router.push("/ceo/notes") },
                        { label: "Export PDF", onClick: handleExportNotes },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FuturisticCard
                      title="📝 Add Note"
                      desc="Create a new performance note for an employee"
                      actions={[
                        { label: "Add Note", onClick: () => router.push("/ceo/add-note") },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FuturisticCard
                      title="📜 Activity Logs"
                      desc="See actions taken by team members"
                      actions={[
                        { label: "View Logs", onClick: () => router.push("/ceo/activity-logs") },
                      ]}
                    />
                  </Grid>
                </>
              )}

              {/* Manager View */}
              {user.role === "manager" && (
                <>
                  <Grid item xs={12} md={4}>
                    <FuturisticCard
                      title="📄 Team Notes"
                      desc="Manage and view notes for your assigned team"
                      actions={[
                        { label: "View Notes", onClick: () => router.push("/manager/notes") },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FuturisticCard
                      title="➕ Add Note"
                      desc="Create a new performance note for your team member"
                      actions={[
                        { label: "Add Note", onClick: () => router.push("/manager/add-note") },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FuturisticCard
                      title="📜 Activity Logs"
                      desc="View activity logs for your team"
                      actions={[
                        { label: "View Logs", onClick: () => router.push("/manager/activity-logs") },
                      ]}
                    />
                  </Grid>
                </>
              )}

              {/* HR View */}
              {user.role === "hr" && (
                <Grid item xs={12} md={4}>
                  <FuturisticCard
                    title="🗂️ Public Notes"
                    desc="Access performance notes visible to HR"
                    actions={[
                      { label: "View Notes", onClick: () => router.push("/hr/notes") },
                    ]}
                  />
                </Grid>
              )}

              {/* Admin View */}
              {user.role === "admin" && (
                <Grid item xs={12} md={4}>
                  <FuturisticCard
                    title="⚙️ Admin Panel"
                    desc="Manage users and teams"
                    actions={[
                      { label: "Manage Users", onClick: () => router.push("/admin/users") },
                      { label: "Manage Teams", onClick: () => router.push("/admin/teams") },
                    ]}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        </Container>
      </Box>
    </ProtectedRoute>
  )
}

function FuturisticCard({ 
  title, 
  desc, 
  actions 
}: {
  title: string
  desc: string
  actions: { label: string; onClick: () => void }[]
}) {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 4,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#fff",
        boxShadow: "0 8px 20px rgba(0,255,255,0.15)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 10px 30px rgba(0,255,255,0.3)",
        },
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.7)">
          {desc}
        </Typography>
      </CardContent>
      <CardActions>
        {actions.map((action, idx) => (
          <Button
            key={idx}
            onClick={action.onClick}
            sx={{
              color: "#90caf9",
              textTransform: "none",
              borderRadius: 999,
              "&:hover": {
                color: "#fff",
                background: "rgba(144,202,249,0.1)",
              },
            }}
          >
            {action.label}
          </Button>
        ))}
      </CardActions>
    </Card>
  )
}
