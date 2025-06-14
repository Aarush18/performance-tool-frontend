"use client"

import { Box, Button, Container, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/auth-context"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          You do not have permission to access this page. Please contact your administrator if you believe this is an
          error.
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
