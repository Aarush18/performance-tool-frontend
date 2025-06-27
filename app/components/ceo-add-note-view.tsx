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
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material"

interface Employee {
  id: number
  name: string
}

export default function CEOAddNoteView() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("")
  const [noteType, setNoteType] = useState<"positive" | "negative" | "neutral">("negative")
  const [performanceNote, setPerformanceNote] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addNote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          noteType,
          performanceNote,
          is_private: isPrivate,
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
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        borderRadius: 4,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 0 30px rgba(14,165,233,0.15)",
        color: "#e0f2fe",
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            mb: 4,
            fontWeight: "bold",
            color: "#7dd3fc",
            textShadow: "0 0 10px rgba(125, 211, 252, 0.4)",
          }}
        >
          ✍️ Add Performance Note
        </Typography>

        <Stack spacing={3}>
          {/* Employee Dropdown */}
          <FormControl fullWidth sx={dropdownStyles}>
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployeeId}
              label="Employee"
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  👤 {emp.id} - {emp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Note Text */}
          <TextField
            label="Performance Note"
            multiline
            rows={6}
            value={performanceNote}
            onChange={(e) => setPerformanceNote(e.target.value)}
            fullWidth
            variant="outlined"
            sx={textFieldStyles}
          />

          {/* Note Type Dropdown */}
          <FormControl fullWidth sx={dropdownStyles}>
            <InputLabel>Type</InputLabel>
            <Select
              value={noteType}
              label="Type"
              onChange={(e) => setNoteType(e.target.value as "positive" | "negative" | "neutral")}
            >
              <MenuItem value="positive">✅ Positive</MenuItem>
              <MenuItem value="negative">⚠️ Negative</MenuItem>
              <MenuItem value="neutral">➖ Neutral</MenuItem>
            </Select>
          </FormControl>

          {/* Private checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
                sx={{
                  color: "#7dd3fc",
                  "&.Mui-checked": {
                    color: "#38bdf8",
                  },
                }}
              />
            }
            label="🔒 Mark as Private (CEO only)"
            sx={{ color: "#bae6fd", fontWeight: 500 }}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            onClick={handleAddNote}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              background: "#38bdf8",
              color: "#0f172a",
              "&:hover": {
                background: "#0ea5e9",
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

// Style helpers
const dropdownStyles = {
  "& .MuiInputBase-root": {
    background: "#1e293b",
    borderRadius: "12px",
    color: "#e0f2fe",
  },
  "& .MuiInputLabel-root": {
    color: "#7dd3fc",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "1px solid rgba(125, 211, 252, 0.3)",
  },
  "& .MuiSvgIcon-root": {
    color: "#7dd3fc",
  },
}

const textFieldStyles = {
  "& .MuiInputBase-root": {
    background: "#1e293b",
    borderRadius: "12px",
    color: "#e0f2fe",
  },
  "& .MuiInputLabel-root": {
    color: "#7dd3fc",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "1px solid rgba(125, 211, 252, 0.3)",
  },
}
