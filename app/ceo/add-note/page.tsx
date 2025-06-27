"use client"

import ProtectedRoute from "../../components/protected-route"
import CEOAddNoteView from "../../components/ceo-add-note-view"
import { Box, Button, Container, Typography } from "@mui/material"
import { useRouter } from "next/navigation"

export default function CEOAddNotePage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRoles={["ceo"]}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(145deg, #0f172a, #1e293b)",
          color: "#e0f2fe",
          px: 3,
          py: 6,
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            borderRadius: 4,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 0 25px rgba(14, 165, 233, 0.2)",
            p: 5,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: "#93c5fd",
                textShadow: "0 0 10px rgba(147, 197, 253, 0.5)",
              }}
            >
              🚀 Add Employee Note
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push("/dashboard")}
              sx={{
                borderColor: "#38bdf8",
                color: "#38bdf8",
                "&:hover": {
                  backgroundColor: "#38bdf8",
                  color: "#0f172a",
                },
              }}
            >
              ⬅ Back to Dashboard
            </Button>
          </Box>

          <CEOAddNoteView />
        </Container>
      </Box>
    </ProtectedRoute>
  )
}
