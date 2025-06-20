"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert
} from "@mui/material"

export default function ForcedResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forceResetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed")

      setSuccess("Password reset successfully. Redirecting...")
      setTimeout(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Set New Password
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Reset Password
          </Button>
        </form>
      </Box>
    </Container>
  )
}
