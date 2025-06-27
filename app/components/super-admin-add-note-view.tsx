"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material"

interface Employee {
  id: number
  name: string
  email: string
}

export default function SuperAdminAddNoteView() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("")
  const [noteType, setNoteType] = useState("positive")
  const [performanceNote, setPerformanceNote] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const handleAddNote = async () => {
    if (!selectedEmployeeId) {
      setMessage({ type: "error", text: "Please select an employee." })
      return
    }

    if (!performanceNote.trim()) {
      setMessage({ type: "error", text: "Please enter a note." })
      return
    }

    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/addNote`, {
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

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to add note")
      }

      setMessage({ type: "success", text: "Note added successfully!" })
      setPerformanceNote("")
      setSelectedEmployeeId("")
      setNoteType("positive")
      setIsPrivate(false)
    } catch (error: any) {
      console.error("Error adding note:", error)
      setMessage({ type: "error", text: error.message || "Failed to add note. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(2,6,23,0.9))",
        border: "1px solid rgba(0,255,255,0.2)",
        boxShadow: "0 0 25px rgba(0,255,255,0.2)",
        borderRadius: 4,
        color: "#e0f2fe",
        backdropFilter: "blur(12px)",
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ color: "#00ffff", mb: 3, fontWeight: "bold" }}>
          🚀 Add Performance Note
        </Typography>

        {message.text && (
          <Alert 
            severity={message.type === "success" ? "success" : "error"} 
            sx={{ mb: 3 }}
            onClose={() => setMessage({ type: "", text: "" })}
          >
            {message.text}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#00ffff" }}>Select Employee</InputLabel>
            <Select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value as number)}
              sx={{ 
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,255,255,0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,255,255,0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00ffff",
                },
              }}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name} ({employee.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ color: "#00ffff" }}>Note Type</InputLabel>
            <Select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              sx={{ 
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,255,255,0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,255,255,0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00ffff",
                },
              }}
            >
              <MenuItem value="positive">Positive</MenuItem>
              <MenuItem value="negative">Negative</MenuItem>
              <MenuItem value="neutral">Neutral</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Performance Note"
            multiline
            rows={6}
            value={performanceNote}
            onChange={(e) => setPerformanceNote(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(0,255,255,0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0,255,255,0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#00ffff",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#00ffff",
              },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#00ffff",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#00ffff",
                  },
                }}
              />
            }
            label="Make this note private (only visible to super-admin)"
            sx={{ color: "#e0f2fe" }}
          />

          <Button
            variant="contained"
            onClick={handleAddNote}
            disabled={loading}
            sx={{
              background: "linear-gradient(90deg, #00ffff, #005eff)",
              color: "#000",
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: "0 0 12px rgba(0,255,255,0.4)",
              "&:hover": {
                background: "linear-gradient(90deg, #005eff, #00ffff)",
                boxShadow: "0 0 20px rgba(0,255,255,0.7)",
              },
              "&:disabled": {
                background: "rgba(0,255,255,0.3)",
                color: "rgba(255,255,255,0.5)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#000" }} /> : "Add Note"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
} 