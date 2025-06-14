"use client"

import { useEffect, useState } from "react"
import {
  Card, CardContent, Typography, FormControl, InputLabel,
  Select, MenuItem, Box, Chip, Stack
} from "@mui/material"

interface Note {
  id: number
  employee_id: number
  employee_name: string
  note: string
  note_type: "positive" | "negative" | "neutral"
  timestamp: string
  creator_role: "ceo" | "manager" | "hr"
}

interface Employee {
  id: number
  name: string
}

export default function CEONotesView() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedCreatorRole, setSelectedCreatorRole] = useState("")
  const [years, setYears] = useState<string[]>([])
  const [notes, setNotes] = useState<Note[]>([])

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setEmployees(data)
      } catch (err) {
        console.error("Error fetching employees:", err)
      }
    }
    fetchEmployees()
  }, [token])

  useEffect(() => {
    const fetchYears = async () => {
      if (!token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/noteYears`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          const yearStrings = data.map((y: any) => y.toString())
          setYears(yearStrings)
        }
      } catch (err) {
        console.error("Error fetching years:", err)
      }
    }
    fetchYears()
  }, [token])

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getNotes`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)

        const data = await res.json()
        const filteredNotes = data.filter((note: Note) => {
          const matchById = selectedEmployeeId ? note.employee_id === selectedEmployeeId : true
          const matchByYear = selectedYear
            ? new Date(note.timestamp).getFullYear().toString() === selectedYear
            : true
          const matchByCreator = selectedCreatorRole ? note.creator_role === selectedCreatorRole : true

          return matchById && matchByYear && matchByCreator
        })

        setNotes(filteredNotes)
      } catch (err) {
        console.error("Error fetching notes:", err)
        setNotes([])
      }
    }

    fetchNotes()
  }, [selectedEmployeeId, selectedYear, selectedCreatorRole, token])

  return (
    <Card sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          CEO Employee Notes View
        </Typography>

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel shrink>Employee</InputLabel>
            <Select
              value={selectedEmployeeId}
              displayEmpty
              label="Employee"
              onChange={(e) => {
                const value = e.target.value
                setSelectedEmployeeId(value === "" ? "" : Number(value))
              }}
              renderValue={(selected) =>
                selected === ""
                  ? "All Employees"
                  : employees.find((e) => e.id === selected)?.name || selected
              }
            >

              <MenuItem value="">All Employees</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.id} - {emp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          <FormControl fullWidth>
            <InputLabel shrink>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected === "" ? "All Years" : selected}
            >
              <MenuItem value="">All Years</MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel shrink>Created By</InputLabel>
            <Select
              value={selectedCreatorRole}
              label="Created By"
              onChange={(e) => setSelectedCreatorRole(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected === "" ? "All Roles" : selected.toUpperCase()}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="ceo">CEO</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="hr">HR</MenuItem>
            </Select>
          </FormControl>

          <Box>
            {notes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No notes found for the selected filters.
              </Typography>
            ) : (
              notes.map((note) => (
                <Box key={note.id} sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Chip
                    label={note.note_type}
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
                  <Chip
                    label={`By: ${note.creator_role.toUpperCase()}`}
                    size="small"
                    variant="filled"
                  />
                </Box>
              
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                  Employee: {note.employee_name} (ID: {note.employee_id})
                </Typography>
              
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
