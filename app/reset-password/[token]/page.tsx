"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
} from "@mui/material"

export default function ResetPasswordPage() {
  const { token } = useParams()
  const router = useRouter()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setMessage("")
    setError("")

    if (!newPassword || !confirmPassword) {
      return setError("Please fill in all fields.")
    }

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.")
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setMessage("Password reset successful! Redirecting to login...")
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    }
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>Reset Password</Typography>

      <TextField
        label="New Password"
        type="password"
        fullWidth
        sx={{ mb: 2 }}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <TextField
        label="Confirm Password"
        type="password"
        fullWidth
        sx={{ mb: 2 }}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button fullWidth variant="contained" onClick={handleSubmit}>
        Reset Password
      </Button>

      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  )
}
