"use client"

import { useEffect, useState } from "react"
import {
  Card, CardContent, Typography, FormControl, InputLabel,
  Select, MenuItem, Box, Chip, Stack, TextField, Button
} from "@mui/material"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Note {
  id: number
  employee_id: number
  employee_name: string
  note: string
  note_type: "positive" | "negative" | "neutral"
  timestamp: string
  is_private: boolean
}

interface Employee {
  id: number
  name: string
}

interface Tag {
  tag: string
  created_by_role: string
}

export default function ManagerNotesView() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("")
  const [selectedYear, setSelectedYear] = useState("")
  const [years, setYears] = useState<string[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [privacyFilter, setPrivacyFilter] = useState<"all" | "private" | "public">("all")
  const [searchText, setSearchText] = useState("")
  const [userRole, setUserRole] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")



  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setUserRole(payload.role)
    }
  }, [])
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/my-employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, [token]);

  useEffect(() => {
    const fetchYears = async () => {
      if (!token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/noteYears`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setYears(data.map((year: any) => year.toString()))
        }
      } catch (err) {
        console.error("Error fetching years:", err)
      }
    }
    fetchYears()
  }, [token])

  useEffect(() => {
    const fetchTags = async () => {
      if (!selectedEmployeeId || !token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/${selectedEmployeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch tags")
        const data = await res.json()
        setTags(data)
      } catch (err) {
        console.error("Error fetching tags:", err)
      }
    }
    fetchTags()
  }, [selectedEmployeeId, token])

  const fetchNotes = async () => {
    if (!token) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getNotes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
      const data = await res.json()
      const filteredNotes = data.filter((note: Note) => {
        const matchById = selectedEmployeeId !== "" ? note.employee_id === Number(selectedEmployeeId) : true
        const matchByYear = selectedYear ? new Date(note.timestamp).getFullYear().toString() === selectedYear : true
        const matchByPrivacy =
          privacyFilter === "private" ? note.is_private === true :
            privacyFilter === "public" ? note.is_private === false : true
        const matchByText = searchText
          ? `${note.employee_name} ${note.note} ${note.employee_id}`.toLowerCase().includes(searchText.toLowerCase())
          : true
        return matchById && matchByYear && matchByPrivacy && matchByText
      })
      setNotes(filteredNotes)
    } catch (err) {
      console.error("Error fetching notes:", err)
      setNotes([])
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [selectedEmployeeId, selectedYear, privacyFilter, searchText, token])

  const exportToPDF = () => {
    const doc = new jsPDF()
    const filteredNotes = selectedEmployeeId
      ? notes.filter((n) => n.employee_id === Number(selectedEmployeeId))
      : notes
    const tableData = filteredNotes.map((note) => [
      note.employee_name,
      note.employee_id,
      note.note_type,
      note.note,
      new Date(note.timestamp).toLocaleString(),
      note.is_private ? "Private" : "Public"
    ])
    autoTable(doc, {
      head: [["Employee Name", "Employee ID", "Type", "Note", "Timestamp", "Visibility"]],
      body: tableData,
    })
    const selectedEmployee = employees.find(e => e.id === Number(selectedEmployeeId))
    const filename = selectedEmployeeId && selectedEmployee ? `${selectedEmployee.name}_notes.pdf` : "manager_notes.pdf"
    doc.save(filename)
  }

  const handleEdit = (id: number, currentText: string) => {
    setEditingNoteId(id)
    setEditText(currentText)
  }

  const handleSaveEdit = async (id: number) => {
    try {
      const originalNote = notes.find(n => n.id === id)
      if (!originalNote) throw new Error("Note not found")
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          note: editText,
          note_type: originalNote.note_type,
          is_private: originalNote.is_private
        }),
      })
  
      if (res.ok) {
        setEditingNoteId(null)
        setEditText("")
        fetchNotes()
      } else {
        throw new Error("Edit failed")
      }
    } catch (err) {
      console.error("Error editing note:", err)
    }
  }
  

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchNotes(); // refresh notes
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  }


  return (
    <Card sx={{
      maxWidth: "100%",
      mx: "auto",
      mt: 4,
      borderRadius: 4,
      background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(10,10,25,0.7))",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(0,255,255,0.15)",
      boxShadow: "0 0 30px rgba(0,255,255,0.15)",
      color: "#fff",
      fontFamily: "'Orbitron', sans-serif",
      p: 4,
    }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: "#00ffff", textShadow: "0 0 10px #00ffff", fontFamily: "'Orbitron', sans-serif" }}>
        ⚙️ Manager Team Notes View
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Search Notes"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{
            input: { color: "#00ffff", fontFamily: "'Orbitron', sans-serif" },
            label: { color: "#00ffff" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#00ffff" },
              "&:hover fieldset": { borderColor: "#00ffff" },
              "&.Mui-focused fieldset": { borderColor: "#00ffff" },
            },
          }}
        />

        <FormControl fullWidth>
          <InputLabel sx={{ color: "#00ffff" }}>Employee</InputLabel>
          <Select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            sx={{ color: "#00ffff", fontFamily: "'Orbitron', sans-serif" }}
          >
            <MenuItem value="">All Employees</MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>{`${emp.id} - ${emp.name}`}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel sx={{ color: "#00ffff" }}>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ color: "#00ffff" }}
          >
            <MenuItem value="">All Years</MenuItem>
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>


        <Button
          variant="outlined"
          onClick={() => selectedEmployeeId && router.push(`/ceo/custom-tags/${selectedEmployeeId}`)}
          sx={{ color: "#00ffff", borderColor: "#00ffff", fontWeight: 600, alignSelf: "flex-start" }}
        >
          View All Tags for Employee
        </Button>

        <Button
          variant="contained"
          onClick={exportToPDF}
          sx={{ backgroundColor: "#00ffff", color: "#000", fontWeight: 600, alignSelf: "flex-start" }}
        >
          Export Notes as PDF
        </Button>
      </Stack>

      <Box sx={{ mt: 4 }}>
        {notes.length === 0 ? (
          <Typography variant="body2" color="rgba(255,255,255,0.6)">
            No notes found for the selected filters.
          </Typography>
        ) : (
          notes.map((note) => (
            <Box
              key={note.id}
              sx={{
                mb: 3,
                p: 3,
                borderRadius: "20px",
                border: "1px solid rgba(0,255,255,0.2)",
                background: "rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)",
                },
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                <Chip
                  label={note.note_type}
                  color={
                    note.note_type === "positive"
                      ? "success"
                      : note.note_type === "negative"
                        ? "error"
                        : "warning"
                  }
                />
                <Chip
                  label={note.is_private ? "🔒 Private" : "🌐 Public"}
                  variant="outlined"
                  sx={{ borderColor: "#00ffff", color: "#fff", backgroundColor: "rgba(0,255,255,0.1)", fontWeight: "bold" }}
                />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {note.employee_name} (ID: {note.employee_id})
              </Typography>
              <Typography variant="body2">{note.note}</Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.6)">
                {new Date(note.timestamp).toLocaleString()}
              </Typography>


              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                {editingNoteId === note.id ? (
                  <>
                    <TextField
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ input: { color: "#00ffff" } }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleSaveEdit(note.id)}
                      sx={{ color: "#00ff00", borderColor: "#00ff00" }}
                    >
                      ✅ Save
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditingNoteId(null)
                        setEditText("")
                      }}
                      sx={{ color: "#ff4444", borderColor: "#ff4444" }}
                    >
                      ❌ Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => handleEdit(note.id, note.note)}
                      sx={{ color: "#00ffff", borderColor: "#00ffff" }}
                    >
                      ✏️ Edit
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => handleDelete(note.id)}
                      sx={{ color: "#ff4444", borderColor: "#ff4444" }}
                    >
                      🗑️ Delete
                    </Button>
                  </>
                )}
              </Box>



            </Box>
          ))
        )}
      </Box>
    </Card>
  )
}
