"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../components/protected-route"
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Stack,
  Chip,
  Divider,
  Skeleton,
} from "@mui/material"
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  History as HistoryIcon,
  NoteAdd as NoteAddIcon,
} from "@mui/icons-material"

interface User {
  id: number
  email: string
  role: string
}

interface Note {
  id: number
  employee_name: string
  note: string
  note_type: string
  timestamp: string
  creator_role: string
  is_private: boolean
  performance_note?: string
}

interface ActivityLog {
  id: number
  user_email: string
  action: string
  details: string
  timestamp: string
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalManagers: 0,
    totalEmployees: 0,
  })
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Fetch dashboard stats
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Fetch users
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      // Fetch notes
      const notesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/getNotes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (notesRes.ok) {
        const notesData = await notesRes.json()
        setNotes(notesData.slice(0, 5)) // Show latest 5 notes
      }

      // Fetch activity logs
      const logsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/activityLogs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setActivityLogs(logsData.slice(0, 5)) // Show latest 5 logs
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const FuturisticCard = ({ 
    title, 
    desc, 
    icon: Icon, 
    actions, 
    color = "#7dd3fc" 
  }: {
    title: string
    desc: string
    icon: any
    actions: { label: string; onClick: () => void }[]
    color?: string
  }) => (
    <Card
      sx={{
        background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(2,6,23,0.9))",
        border: `1px solid ${color}40`,
        boxShadow: `0 0 25px ${color}20`,
        borderRadius: 4,
        color: "#e0f2fe",
        backdropFilter: "blur(12px)",
        fontFamily: "'Orbitron', sans-serif",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px) scale(1.02)",
          boxShadow: `0 0 35px ${color}40`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Icon sx={{ fontSize: 40, color, mr: 2 }} />
          <Typography variant="h6" sx={{ color, fontWeight: "bold" }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 3, color: "#cbd5e1" }}>
          {desc}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={action.onClick}
              sx={{
                borderColor: color,
                color,
                "&:hover": {
                  backgroundColor: color,
                  color: "#0f172a",
                },
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute requiredRoles={["super-admin"]}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a, #020617)",
          py: 4,
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <Container maxWidth="xl">
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
              <Typography variant="h3" fontWeight="bold" sx={{ color: "#00ffff", textShadow: "0 0 20px rgba(0,255,255,0.5)" }}>
                🚀 Super Admin Dashboard
              </Typography>
              <Chip 
                label="SUPER ADMIN" 
                sx={{ 
                  background: "linear-gradient(45deg, #00ffff, #005eff)",
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }} 
              />
            </Box>

            {/* Stats Cards */}
            {loading ? (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[...Array(4)].map((_, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, bgcolor: 'grey.900' }} />
                  </Grid>
                ))}
              </Grid>
            ) : (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,94,255,0.1))", border: "1px solid rgba(0,255,255,0.3)" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h4" sx={{ color: "#00ffff", fontWeight: "bold" }}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                      Total Users
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,94,255,0.1))", border: "1px solid rgba(0,255,255,0.3)" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h4" sx={{ color: "#00ffff", fontWeight: "bold" }}>
                      {stats.totalNotes}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                      Total Notes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,94,255,0.1))", border: "1px solid rgba(0,255,255,0.3)" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h4" sx={{ color: "#00ffff", fontWeight: "bold" }}>
                      {stats.totalManagers}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                      Managers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,94,255,0.1))", border: "1px solid rgba(0,255,255,0.3)" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h4" sx={{ color: "#00ffff", fontWeight: "bold" }}>
                      {stats.totalEmployees}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                      Employees
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            )}

            <Grid container spacing={4}>
              {/* Admin Functions */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ color: "#00ffff", mb: 3, fontWeight: "bold" }}>
                  👑 Admin Functions
                </Typography>
                <Stack spacing={3}>
                  <FuturisticCard
                    title="👥 User Management"
                    desc="Create, edit, and manage all users in the system"
                    icon={PeopleIcon}
                    color="#00ffff"
                    actions={[
                      { label: "Manage Users", onClick: () => router.push("/super-admin/users") },
                      { label: "Create User", onClick: () => router.push("/super-admin/create-user") },
                    ]}
                  />
                  <FuturisticCard
                    title="👨‍💼 Team Management"
                    desc="Assign employees to managers and manage team structures"
                    icon={GroupIcon}
                    color="#00ffff"
                    actions={[
                      { label: "Manage Teams", onClick: () => router.push("/super-admin/teams") },
                      { label: "Create Employee", onClick: () => router.push("/super-admin/create-employee") },
                    ]}
                  />
                </Stack>
              </Grid>

              {/* CEO Functions */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ color: "#00ffff", mb: 3, fontWeight: "bold" }}>
                  🏢 CEO Functions
                </Typography>
                <Stack spacing={3}>
                  <FuturisticCard
                    title="📝 Performance Notes"
                    desc="View and manage all employee performance notes"
                    icon={AssessmentIcon}
                    color="#00ffff"
                    actions={[
                      { label: "View Notes", onClick: () => router.push("/super-admin/notes") },
                      { label: "Add Note", onClick: () => router.push("/super-admin/add-note") },
                    ]}
                  />
                  <FuturisticCard
                    title="📜 Activity Logs"
                    desc="Monitor all system activities and user actions"
                    icon={HistoryIcon}
                    color="#00ffff"
                    actions={[
                      { label: "View Logs", onClick: () => router.push("/super-admin/activity-logs") },
                    ]}
                  />
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4, borderColor: "rgba(0,255,255,0.3)" }} />

            {/* Recent Activity */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: "#00ffff", mb: 2, fontWeight: "bold" }}>
                  📝 Recent Notes
                </Typography>
                <Card sx={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,255,255,0.2)" }}>
                  <CardContent>
                    {notes.length === 0 ? (
                      <Typography sx={{ color: "#cbd5e1" }}>No recent notes</Typography>
                    ) : (
                      <Stack spacing={2}>
                        {notes.map((note) => (
                          <Box key={note.id} sx={{ p: 2, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: "#00ffff" }}>
                              {note.employee_name} - {note.creator_role}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 1 }}>
                              {(note.performance_note || '').substring(0, 100)}...
                            </Typography>
                            <Chip 
                              label={note.note_type} 
                              size="small" 
                              sx={{ mt: 1, 
                                background: note.note_type === "positive" ? "#10b981" : 
                                           note.note_type === "negative" ? "#ef4444" : "#f59e0b" 
                              }} 
                            />
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: "#00ffff", mb: 2, fontWeight: "bold" }}>
                  🔍 Recent Activity
                </Typography>
                <Card sx={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,255,255,0.2)" }}>
                  <CardContent>
                    {activityLogs.length === 0 ? (
                      <Typography sx={{ color: "#cbd5e1" }}>No recent activity</Typography>
                    ) : (
                      <Stack spacing={2}>
                        {activityLogs.map((log) => (
                          <Box key={log.id} sx={{ p: 2, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: "#00ffff" }}>
                              {log.user_email}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 1 }}>
                              {log.action}: {log.details}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", mt: 1, display: "block" }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </ProtectedRoute>
  )
} 