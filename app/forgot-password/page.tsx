"use client"

import { useState } from "react"
import { Box, Button, TextField, Typography, Alert } from "@mui/material"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setMessage("")
    setError("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage("Reset link sent. Please check your email or console.")
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    }
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>Forgot Password</Typography>
      <TextField
        fullWidth
        label="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button fullWidth variant="contained" onClick={handleSubmit}>Send Reset Link</Button>
      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  )
}
