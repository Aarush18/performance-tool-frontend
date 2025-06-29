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
  Button,
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
  const [selectedTag, setSelectedTag] = useState("")
  const [years, setYears] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchData = async () => {
      try {
        const [notesRes, employeesRes, yearsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getNotes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/noteYears`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
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
    const query = searchQuery.trim().toLowerCase()

    const result = notes.filter((note) => {
      const matchEmployee = selectedEmployeeId ? note.employee_id === Number(selectedEmployeeId) : true
      const matchYear = selectedYear ? new Date(note.timestamp).getFullYear().toString() === selectedYear : true
      const matchTag = selectedTag ? note.note_type === selectedTag : true
      const matchSearch = query
        ? note.note.toLowerCase().includes(query) || note.employee_id.toString().includes(query)
        : true

      return matchEmployee && matchYear && matchTag && matchSearch
    })

    setFilteredNotes(result)
  }, [selectedEmployeeId, selectedYear, searchQuery, selectedTag, notes])

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #0f2027, #203a43, #2c5364)",
        py: 6,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: "#0a0f1a",
          boxShadow: "0 0 30px rgba(0, 255, 255, 0.1)",
          color: "#ffffff",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ color: "#00eaff", fontWeight: "bold" }}>
            HR Performance Notes
          </Typography>
          <Button variant="outlined" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Stack spacing={3} sx={{ mb: 4 }}>
              {/* Search */}
              <FormControl fullWidth>
                <InputLabel shrink htmlFor="search" sx={{ color: "#00eaff" }}>
                  Search Notes
                </InputLabel>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by employee ID or note content"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #3d4d6b",
                    backgroundColor: "#1a2238",
                    color: "#fff",
                    marginTop: "8px",
                    outline: "none",
                    width: "100%",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#00ffff")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#3d4d6b")}
                />
              </FormControl>

              {/* Employee Filter */}
              <FormControl fullWidth
                sx={{
                  bgcolor: "#10192c",
                  borderRadius: 2,
                  p: 1,
                  "& .MuiInputBase-root": {
                    bgcolor: "#1a2238",
                    color: "#fff",
                    borderRadius: 2,
                    border: "1px solid #3d4d6b",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#00ffff",
                    },
                    "&.Mui-focused": {
                      borderColor: "#00ffff",
                      boxShadow: "0 0 8px #00ffff",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#00eaff",
                    fontWeight: "bold",
                  },
                }}
              >
                <InputLabel shrink>Employee</InputLabel>
                <Select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  displayEmpty
                  renderValue={(selected) =>
                    selected === ""
                      ? "All Employees"
                      : employees.find((e) => e.id === Number(selected))?.name || selected
                  }
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Year Filter */}
              <FormControl fullWidth sx={{ ...filterStyles }}>
                <InputLabel shrink>Year</InputLabel>
                <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  <MenuItem value="">All Years</MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Tag Filter */}
              <FormControl fullWidth sx={{ ...filterStyles }}>
                <InputLabel shrink>Note Type</InputLabel>
                <Select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="positive">Positive</MenuItem>
                  <MenuItem value="negative">Negative</MenuItem>
                  <MenuItem value="neutral">Neutral</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Notes Display */}
            {filteredNotes.length === 0 ? (
              <Typography>No public notes found.</Typography>
            ) : (
              <Card sx={{ backgroundColor: "#141b2e", borderRadius: 2 }}>
                <CardContent>
                  {filteredNotes.map((note) => (
                    <Box
                      key={note.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: "#1e2a47",
                        borderRadius: 2,
                        border: "1px solid #2d3a5a",
                        transition: "0.3s ease",
                        "&:hover": {
                          borderColor: "#00ffff",
                          boxShadow: "0 0 10px rgba(0,255,255,0.2)",
                        },
                      }}
                    >
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

                      <Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#ffffff" }}>
                        Employee: {note.employee_name} (ID: {note.employee_id})
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 1, color: "#ffffff" }}>
                        {note.note}
                      </Typography>

                      <Typography variant="caption" sx={{ color: "#d0d0d0" }}>
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
    </Box>
  )
}

const filterStyles = {
  bgcolor: "#10192c",
  borderRadius: 2,
  p: 1,
  "& .MuiInputBase-root": {
    bgcolor: "#1a2238",
    color: "#fff",
    borderRadius: 2,
    border: "1px solid #3d4d6b",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: "#00ffff",
    },
    "&.Mui-focused": {
      borderColor: "#00ffff",
      boxShadow: "0 0 8px #00ffff",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#00eaff",
    fontWeight: "bold",
  },
}
