"use client"

import type React from "react"
import { useState } from "react"
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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card sx={{ width: "100%" }}>
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
              />

              {/* ✅ Future Quick Login Dropdown - Leave As-Is */}
              {
              <FormControl fullWidth margin="normal">
                <InputLabel id="demo-login-select-label">Quick Login As</InputLabel>
                <Select
                  labelId="demo-login-select-label"
                  id="demo-login-select"
                  value={email}
                  label="Quick Login As"
                  onChange={(e) => setEmail(e.target.value)}
                >
                  <MenuItem value="aarushgupta2018@gmail.com">CEO</MenuItem>
                  <MenuItem value="aarushgupta.bt23mech@pec.edu.in">Manager</MenuItem>
                  <MenuItem value="test@123.com">HR</MenuItem>
                </Select>
              </FormControl> 
              }

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                Sign In
              </Button>

              <Typography variant="body2" align="right" sx={{ mt: 1 }}>
                <Link href="/forgot-password" style={{ color: "#1976d2", textDecoration: "underline" }}>
                  Forgot Password?
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
