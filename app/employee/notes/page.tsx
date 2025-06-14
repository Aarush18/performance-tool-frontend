"use client"

import { useEffect, useState } from "react"
import ProtectedRoute from "../../components/protected-route"
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/auth-context"

interface Note {
  id: number
  text: string
  date: string
  type: "positive" | "negative"
}

export default function EmployeeNotesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedYear, setSelectedYear] = useState("2024")
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/notes`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }

        const data = await res.json()
        setNotes(data.notes || [])
      } catch (err) {
        console.error("Error fetching notes:", err)
      }
    }

    fetchNotes()
  }, [])

  return (
    <ProtectedRoute requiredRoles={["employee"]}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Performance Notes
          </Typography>
          <Box>
            <Button variant="outlined" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </Box>
        </Box>

        <Card sx={{ maxWidth: 500, mx: "auto" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {user?.name}'s Performance Notes
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)}>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
              </Select>
            </FormControl>

            {notes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No notes available.
              </Typography>
            ) : (
              notes.map((note) => (
                <Box key={note.id} sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
                    <Chip
                      label={note.type === "positive" ? "Positive" : "Needs Improvement"}
                      size="small"
                      color={note.type === "positive" ? "success" : "error"}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {note.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {note.date}
                  </Typography>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Container>
    </ProtectedRoute>
  )
}
