"use client"

import { useEffect, useState } from "react"
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Stack,
  Button
} from "@mui/material"
import { useRouter } from "next/navigation"

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

export default function HRNotesView() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [years, setYears] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchData = async () => {
      try {
        const [notesRes, employeesRes, yearsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getNotes`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/noteYears`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        const notesData = await notesRes.json()
        const employeeData = await employeesRes.json()
        const yearData = await yearsRes.json()

        setNotes(notesData)
        setEmployees(employeeData)
        const yearStrings = yearData.map((y: any) => y.toString())
        setYears(yearStrings)
        setLoading(false)
      } catch (err) {
        console.error("Error loading HR notes data:", err)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const result = notes.filter(note => {
      const matchEmployee = selectedEmployeeId ? note.employee_id === Number(selectedEmployeeId) : true
      const matchYear = selectedYear ? new Date(note.timestamp).getFullYear().toString() === selectedYear : true
      return matchEmployee && matchYear
    })
    setFilteredNotes(result)
  }, [selectedEmployeeId, selectedYear, notes])

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">HR Performance Notes</Typography>
        <Button variant="outlined" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Stack spacing={3} sx={{ mb: 4 }}>
            <FormControl fullWidth>
              <InputLabel shrink>Employee</InputLabel>
              <Select
                value={selectedEmployeeId}
                label="Employee"
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                displayEmpty
                renderValue={(selected) =>
                  selected === "" ? "All Employees" : employees.find(e => e.id === Number(selected))?.name || selected
                }
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name}
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
              >
                <MenuItem value="">All Years</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {filteredNotes.length === 0 ? (
            <Typography>No public notes found.</Typography>
          ) : (
            <Card>
              <CardContent>
                {filteredNotes.map(note => (
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
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  )
}
