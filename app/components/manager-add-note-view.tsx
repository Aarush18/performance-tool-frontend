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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
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
    <Card sx={{ maxWidth: 500, mx: "auto" }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Manager Add Note View
        </Typography>

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployeeId}
              label="Employee"
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
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
          />

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={noteType}
              label="Type"
              onChange={(e) => setNoteType(e.target.value as "positive" | "negative" | "neutral")}
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
              alignSelf: "flex-start",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Add Note
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
 