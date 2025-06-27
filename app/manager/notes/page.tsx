"use client"

import ProtectedRoute from "../../components/protected-route"
import ManagerNotesView from "../../components/manager-notes-view"
import { Box, Button, Container, Typography } from "@mui/material"
import { useRouter } from "next/navigation"

export default function ManagerNotesPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRoles={["manager"]}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #050505 0%, #0f0f23 100%)",
          backgroundAttachment: "fixed",
          px: 2,
          py: 6,
          color: "#00ffff",
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: "#00ffff",
                textShadow: "0 0 10px rgba(0,255,255,0.8)",
              }}
            >
              📊 Team Performance Notes
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push("/dashboard")}
              sx={{
                borderColor: "#00ffff",
                color: "#00ffff",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "rgba(0,255,255,0.1)",
                  borderColor: "#00ffff",
                },
              }}
            >
              ⬅ Back to Dashboard
            </Button>
          </Box>

          <ManagerNotesView />
        </Container>
      </Box>
    </ProtectedRoute>
  )
}
