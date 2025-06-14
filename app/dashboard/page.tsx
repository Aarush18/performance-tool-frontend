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
    <ProtectedRoute requiredRoles={["ceo", "manager", "hr"]}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Performance Management Dashboard
          </Typography>
          <Button variant="outlined" color="inherit" onClick={logout} sx={{ ml: 2 }}>
            Logout
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, {user.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Role: {typeof user.role === "string"
              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
              : "Unknown"}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* CEO View */}
          {user.role === "ceo" && (
            <>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Employee Notes</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage performance notes for all employees
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => router.push("/ceo/notes")}>
                      View Notes
                    </Button>
                    <Button size="small" onClick={handleExportNotes}>
                      Export PDF
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Add New Note</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create a new performance note for an employee
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => router.push("/ceo/add-note")}>
                      Add Note
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Button size="small" onClick={() => router.push("/ceo/activity-logs")}>
                      View Activity Logs
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {/* Manager View */}
          {user.role === "manager" && (
            <>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Team Notes</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage performance notes for your team
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => router.push("/manager/notes")}>
                      View Notes
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Add New Note</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create a new performance note for a team member
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => router.push("/manager/add-note")}>
                      Add Note
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </>
          )}

          {/* HR View */}
          {user.role === "hr" && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Public Performance Notes</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View performance notes accessible to HR
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => router.push("/hr/notes")}>
                    View Notes
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}


        </Grid>
      </Container>
    </ProtectedRoute>
  )
}
