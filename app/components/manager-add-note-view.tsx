"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Stack,
} from "@mui/material"

interface Employee {
  id: number
  name: string
}

export default function ManagerAddNoteView() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("")
  const [noteType, setNoteType] = useState<"positive" | "negative" | "neutral">("negative")
  const [performanceNote, setPerformanceNote] = useState("")

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/my-employees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch employees")

        const data = await res.json()
        setEmployees(data)
        if (data.length > 0) setSelectedEmployeeId(data[0].id)
      } catch (error) {
        console.error("Error fetching employees:", error)
      }
    }

    fetchEmployees()
  }, [])

  const handleAddNote = async () => {
    if (!selectedEmployeeId) {
      alert("Please select an employee.")
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: selectedEmployeeId,
          note: performanceNote,
          note_type: noteType,
        }),
      })

      if (!res.ok) throw new Error("Failed to add note")

      const data = await res.json()
      console.log("✅ Note added:", data)
      alert("Note added successfully!")
      setPerformanceNote("")
    } catch (error) {
      console.error("Error adding note:", error)
      alert("Failed to add note. Please try again.")
    }
  }

  return (
    <Card
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 6,
        borderRadius: 4,
        background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(15,15,35,0.7))",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0,255,255,0.2)",
        boxShadow: "0 0 25px rgba(0,255,255,0.2)",
        color: "#00ffff",
        fontFamily: "'Orbitron', sans-serif",
        p: 4,
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 3, textShadow: "0 0 8px #00ffff", color: "#00ffff" }}
        >
          ✍️ Add Performance Note
        </Typography>

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#00ffff" }}>Employee</InputLabel>
            <Select
              value={selectedEmployeeId}
              label="Employee"
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              sx={{
                color: "#00ffff",
                fontFamily: "'Orbitron', sans-serif",
                "& .MuiSvgIcon-root": { color: "#00ffff" },
              }}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Performance Note"
            multiline
            rows={6}
            value={performanceNote}
            onChange={(e) => setPerformanceNote(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{
              input: { color: "#00ffff", fontFamily: "'Orbitron', sans-serif" },
              label: { color: "#00ffff" },
              textarea: { color: "#00ffff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#00ffff" },
                "&:hover fieldset": { borderColor: "#00ffff" },
                "&.Mui-focused fieldset": { borderColor: "#00ffff" },
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel sx={{ color: "#00ffff" }}>Type</InputLabel>
            <Select
              value={noteType}
              label="Type"
              onChange={(e) => setNoteType(e.target.value as "positive" | "negative" | "neutral")}
              sx={{
                color: "#00ffff",
                fontFamily: "'Orbitron', sans-serif",
                "& .MuiSvgIcon-root": { color: "#00ffff" },
              }}
            >
              <MenuItem value="positive">Positive</MenuItem>
              <MenuItem value="negative">Negative</MenuItem>
              <MenuItem value="neutral">Neutral</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleAddNote}
            sx={{
              mt: 2,
              alignSelf: "flex-start",
              textTransform: "none",
              fontWeight: "bold",
              fontFamily: "'Orbitron', sans-serif",
              background: "linear-gradient(90deg, #00ffff, #005eff)",
              color: "#000",
              boxShadow: "0 0 12px rgba(0,255,255,0.5)",
              "&:hover": {
                background: "linear-gradient(90deg, #005eff, #00ffff)",
                boxShadow: "0 0 20px rgba(0,255,255,0.8)",
              },
            }}
          >
            ➕ Add Note
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
