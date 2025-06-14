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
  Box,
  Chip,
  Stack,
} from "@mui/material"

interface Note {
  id: number
  employee_id: number
  employee_name: string
  note: string
  note_type: "positive" | "negative" | "neutral"
  timestamp: string
}

interface Employee {
  id: number
  name: string
}

export default function ManagerNotesView() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("")
  const [years, setYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState("")
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchEmployees = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setEmployees(data)
        if (data.length > 0) {
          setSelectedEmployee(data[0].name)
          setSelectedEmployeeId(data[0].id)
        }
      } catch (err) {
        console.error("Error fetching employees:", err)
      }
    }

    fetchEmployees()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchYears = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/noteYears`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          const yearStrings = data.map((year: any) => year.toString())
          setYears(yearStrings)
          if (yearStrings.length > 0) setSelectedYear(yearStrings[0])
        }
      } catch (err) {
        console.error("Error fetching years:", err)
        setYears([])
      }
    }

    fetchYears()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchNotes = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)

        const data = await res.json()
        const filteredNotes = data.filter((note: Note) => {
          const matchById = selectedEmployeeId ? note.employee_id === Number(selectedEmployeeId) : true
          const matchByName = selectedEmployee ? note.employee_name === selectedEmployee : true
          const matchByYear = new Date(note.timestamp).getFullYear().toString() === selectedYear
          return (matchById || matchByName) && matchByYear
        })
        setNotes(filteredNotes)
      } catch (err) {
        console.error("Error fetching notes:", err)
        setNotes([])
      }
    }

    if ((selectedEmployee || selectedEmployeeId) && selectedYear) {
      fetchNotes()
    }
  }, [selectedEmployee, selectedEmployeeId, selectedYear])

  return (
    <Card sx={{ maxWidth: 600, mx: "auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="text.secondary">
          Manager Notes View
        </Typography>

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Search by Name</InputLabel>
            <Select
              value={selectedEmployee}
              label="Search by Name"
              onChange={(e) => {
                const selected = employees.find(emp => emp.name === e.target.value)
                setSelectedEmployee(e.target.value)
                setSelectedEmployeeId(selected?.id || "")
              }}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.name}>
                  {emp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Search by ID</InputLabel>
            <Select
              value={selectedEmployeeId}
              label="Search by ID"
              onChange={(e) => {
                const selected = employees.find(emp => emp.id === Number(e.target.value))
                setSelectedEmployeeId(Number(e.target.value))
                setSelectedEmployee(selected?.name || "")
              }}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            {notes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No notes found for the selected employee/year.
              </Typography>
            ) : (
              notes.map((note) => (
                <Box key={note.id} sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Chip
                      label={`${note.note_type.charAt(0).toUpperCase() + note.note_type.slice(1)}:`}
                      size="small"
                      color={
                        note.note_type === "positive"
                          ? "success"
                          : note.note_type === "negative"
                          ? "error"
                          : "warning"
                      }
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {note.note}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(note.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
