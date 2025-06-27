"use client"
import { useEffect, useState } from "react"
import ProtectedRoute from "../../components/protected-route"
import CEONotesView from "../../components/ceo-notes-view"
import { Box, Button, Container, Typography, Paper } from "@mui/material"
import { useRouter } from "next/navigation"

export default function CEONotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState([])

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getNotes`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)

        const data = await res.json()
        setNotes(data)
      } catch (error) {
        console.error("Error fetching notes:", error)
      }
    }

    fetchNotes()
  }, [])

  return (
    <ProtectedRoute requiredRoles={["ceo"]}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
          py: 8,
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <Container maxWidth="lg">
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
              <Typography variant="h4" fontWeight="bold" sx={{ color: "#90caf9" }}>
                🧠 CEO Employee Notes
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push("/dashboard")}
                sx={{
                  borderRadius: 999,
                  color: "#90caf9",
                  borderColor: "#90caf9",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#90caf9",
                    color: "#000",
                  },
                }}
              >
                ← Back to Dashboard
              </Button>
            </Box>

            <CEONotesView notes={notes} />
          </Paper>
        </Container>
      </Box>
    </ProtectedRoute>
  )
}
