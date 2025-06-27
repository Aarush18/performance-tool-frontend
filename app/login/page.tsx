"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../context/auth-context"
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"

interface QuickUser {
  email: string
  role: string
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [quickUsers, setQuickUsers] = useState<QuickUser[]>([])
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/quick-login-users`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQuickUsers(data)
      })
      .catch((err) => console.error("Failed to fetch quick login users:", err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const success = await login(email, password)
      if (success) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
        if (storedUser.role === "admin") {
          router.push("/admin/users")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/bg-download.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container maxWidth="xs">
        <Card sx={{ backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#fff", borderRadius: 2 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Performance Management System
            </Typography>
            <Typography component="h2" variant="h6" align="center" sx={{ mb: 3 }}>
              Sign In
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{
                  style: { color: "#fff", borderColor: "#fff" },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{
                  style: { color: "#fff" },
                }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="quick-login-label" sx={{ color: "#ccc" }}>
                  Quick Login As
                </InputLabel>
                <Select
                  labelId="quick-login-label"
                  id="quick-login-select"
                  value={email}
                  label="Quick Login As"
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ color: "#fff" }}
                >
                  {quickUsers.map((user) => (
                    <MenuItem key={user.email} value={user.email}>
                      {user.role} – {user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, bgcolor: "#5c7cfa" }}>
                Sign In
              </Button>

              <Typography variant="body2" align="right" sx={{ mt: 1 }}>
                <Link href="/forgot-password" style={{ color: "#90caf9", textDecoration: "underline" }}>
                  Forgot Password?
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
