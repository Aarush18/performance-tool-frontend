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
  Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button as MuiButton
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

export default function ManagerNotesView() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("")
  const [years, setYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState("")
  const [notes, setNotes] = useState<Note[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null)
  const [searchText, setSearchText] = useState("")
  const router = useRouter()




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
        setYears([])
      }
    }

    fetchYears()
  }, [token])

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)

        const data = await res.json()
        const filteredNotes = data.filter((note: Note) => {
          const matchById = selectedEmployeeId ? note.employee_id === Number(selectedEmployeeId) : true
          const matchByYear = selectedYear
            ? new Date(note.timestamp).getFullYear().toString() === selectedYear
            : true
          const matchByText = searchText
            ? `${note.employee_name} ${note.note} ${note.employee_id}`
              .toLowerCase()
              .includes(searchText.toLowerCase())
            : true

          return matchById && matchByYear && matchByText
        })

        setNotes(filteredNotes)
      } catch (err) {
        console.error("Error fetching notes:", err)
        setNotes([])
      }
    }

    fetchNotes()
  }, [selectedEmployeeId, selectedYear, searchText, token]) // 🛠️ Include searchText here

  const handleEdit = (note: Note) => {
    setNoteToEdit(note)
    setEditOpen(true)
  }

  const handleDelete = async (noteId: number) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        alert("Note deleted")
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
      } else {
        alert("Failed to delete")
      }
    } catch (err) {
      console.error("Error deleting:", err)
    }
  }

  const handleUpdate = async () => {
    if (!noteToEdit || !token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/notes/${noteToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          note: noteToEdit.note,
          note_type: noteToEdit.note_type,
        }),
      });

      if (!res.ok) throw new Error("Failed to update note");

      alert("Note updated successfully");
      setEditOpen(false);

      // Refresh notes
      setNotes((prev) =>
        prev.map((n) => (n.id === noteToEdit.id ? { ...n, ...noteToEdit } : n))
      );
    } catch (err) {
      console.error("Error updating note:", err);
      alert("Update failed");
    }
  };


  return (
    <Card sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="text.secondary">
          Manager Notes View
        </Typography>

        <TextField
          label="Search Notes"
          placeholder="Search by keyword, employee name, or ID"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ my: 2 }}
        />


        <Stack spacing={3}>
          {/* Employee ID filter */}
          <FormControl fullWidth>
            <InputLabel shrink>Search by Employee</InputLabel>
            <Select
              value={selectedEmployeeId}
              label="Search by Employee"
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              displayEmpty
              renderValue={(selected) =>
                selected === "" ? "All Employees" : `ID: ${selected}`
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

          {/* Year filter */}
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

          {selectedEmployeeId && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/ceo/custom-tags/${selectedEmployeeId}`)}
              sx={{ alignSelf: "flex-start", mt: 1 }}

            >
              Manage Tags for Employee
            </Button>
          )}


          {/* Notes display */}
          <Box>
            {notes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No notes found for the selected filters.
              </Typography>
            ) : (
              notes.map((note) => (
                <Box
                  key={note.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    border: "1px solid #ddd",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleEdit(note)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(note.id)}>
                      Delete
                    </Button>
                  </Box>

                  <Stack direction="row" spacing={1} mb={1}>
                    <Chip
                      label={note.note_type}
                      color={
                        note.note_type === "positive"
                          ? "success"
                          : note.note_type === "negative"
                            ? "error"
                            : "warning"
                      }
                      variant="outlined"
                    />
                    <Chip label={`ID: ${note.employee_id}`} variant="outlined" />
                    <Chip label={note.employee_name} />
                  </Stack>
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
          <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Edit Note</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label="Note"
                multiline
                rows={4}
                value={noteToEdit?.note || ""}
                onChange={(e) =>
                  setNoteToEdit((prev) =>
                    prev ? { ...prev, note: e.target.value } : prev
                  )
                }
              />
              <FormControl fullWidth>
                <InputLabel>Note Type</InputLabel>
                <Select
                  value={noteToEdit?.note_type || "neutral"}
                  onChange={(e) =>
                    setNoteToEdit((prev) =>
                      prev ? { ...prev, note_type: e.target.value as Note["note_type"] } : prev
                    )
                  }
                >
                  <MenuItem value="positive">Positive</MenuItem>
                  <MenuItem value="negative">Negative</MenuItem>
                  <MenuItem value="neutral">Neutral</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <MuiButton onClick={() => setEditOpen(false)}>Cancel</MuiButton>
              <MuiButton variant="contained" onClick={handleUpdate}>Update</MuiButton>
            </DialogActions>
          </Dialog>

        </Stack>
      </CardContent>
    </Card>
  )
}
