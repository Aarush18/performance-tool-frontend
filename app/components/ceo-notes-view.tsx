"use client"

import { useEffect, useState } from "react"
import {
  Card, CardContent, Typography, FormControl, InputLabel,
  Select, MenuItem, Box, Chip, Stack, Button, TextField
} from "@mui/material"
import { useRouter } from "next/navigation"

interface Note {
  id: number
  employee_id: number
  employee_name: string
  note: string
  note_type: "positive" | "negative" | "neutral"
  timestamp: string
  creator_role: "ceo" | "manager" | "hr"
  is_private: boolean
  creator_email: string // ✅ Add this
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
  const [privacyFilter, setPrivacyFilter] = useState<"all" | "private" | "public">("all")
  const [searchText, setSearchText] = useState("")
  const [userRole, setUserRole] = useState("")
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editedText, setEditedText] = useState("");


  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setUserRole(payload.role)
    }
  }, [])

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setEditedText(note.note);
  };

  const handleDelete = async (noteId: number) => {
    if (!token) return;
    const confirm = window.confirm("Are you sure you want to delete this note?");
    if (!confirm) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchNotes();
    } catch (err) {
      console.error("❌ Error deleting note:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingNote || !token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${editingNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note: editedText, type: editingNote.note_type }),
      });
      if (res.ok) {
        setEditingNote(null);
        setEditedText("");
        fetchNotes();
      }
    } catch (err) {
      console.error("❌ Error updating note:", err);
    }
  };

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
          setYears(data.map((year: any) => year.toString()))
        }
      } catch (err) {
        console.error("Error fetching years:", err)
      }
    }
    fetchYears()
  }, [token])

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
        const matchByCreator = selectedCreatorRole ? note.creator_role === selectedCreatorRole : true
        const matchByPrivacy =
          privacyFilter === "private" ? note.is_private === true :
            privacyFilter === "public" ? note.is_private === false : true
        const matchByText = searchText
          ? `${note.employee_name} ${note.note} ${note.employee_id}`.toLowerCase().includes(searchText.toLowerCase())
          : true
        return matchById && matchByYear && matchByCreator && matchByPrivacy && matchByText
      })
      setNotes(filteredNotes)
    } catch (err) {
      console.error("Error fetching notes:", err)
      setNotes([])
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [selectedEmployeeId, selectedYear, selectedCreatorRole, privacyFilter, searchText, token])

  const handleExportPDF = () => {
    if (!selectedEmployeeId || !token) return
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/export/${selectedEmployeeId}?token=${token}`
    window.open(url, "_blank")
  }

  return (
    <Card
      sx={{
        maxWidth: "100%",
        mx: "auto",
        mt: 4,
        borderRadius: 4,
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 0 30px rgba(0,255,255,0.08)",
        color: "#fff",
        fontFamily: "'Orbitron', sans-serif",
        p: 4,
      }}
    >
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: "#90caf9" }}>
        CEO Employee Notes View 🚀
      </Typography>

      <Stack spacing={3}>
        {/* Filters */}
        <TextField
          label="Search Notes"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ input: { color: "#fff" } }}
        />

        <FormControl fullWidth>
          <InputLabel sx={{ color: "#90caf9" }}>Employee</InputLabel>
          <Select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(String(e.target.value) === "" ? "" : Number(e.target.value))}
            sx={{ color: "white" }}
          >
            <MenuItem value="">All Employees</MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>{`${emp.id} - ${emp.name}`}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel sx={{ color: "#90caf9" }}>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ color: "white" }}
          >
            <MenuItem value="">All Years</MenuItem>
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel sx={{ color: "#90caf9" }}>Created By</InputLabel>
          <Select
            value={selectedCreatorRole}
            onChange={(e) => setSelectedCreatorRole(e.target.value)}
            sx={{ color: "white" }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ceo">CEO</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel sx={{ color: "#90caf9" }}>Visibility</InputLabel>
          <Select
            value={privacyFilter}
            onChange={(e) => setPrivacyFilter(e.target.value as any)}
            sx={{ color: "white" }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {selectedEmployeeId && (
        <Box sx={{ display: "flex", gap: 2, mt: 4, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#00ffff",
              color: "#00ffff",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(0,255,255,0.1)",
                borderColor: "#00ffff",
              },
            }}
            onClick={() => router.push(`/ceo/custom-tags/${selectedEmployeeId}`)} // ✅ This works
          >
            🏷 View Tags
          </Button>

          <Button
            variant="outlined"
            sx={{
              borderColor: "#00ffff",
              color: "#00ffff",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(0,255,255,0.1)",
                borderColor: "#00ffff",
              },
            }}
            onClick={() => router.push(`/timeline/${selectedEmployeeId}`)}
          >
            🕒 Show Timeline
          </Button>

          <Button
            variant="contained"
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
            }}
            onClick={handleExportPDF}
          >
            📤 Export Notes
          </Button>
        </Box>
      )}

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
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "linear-gradient(145deg, rgba(0,0,0,0.4), rgba(30,30,30,0.6))",
                boxShadow: "0 5px 25px rgba(0,255,255,0.1)",
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
                <Chip label={`By: ${note.creator_role.toUpperCase()} (${note.creator_email})`} />

                <Chip
                  label={note.is_private ? "🔒 Private" : "🌐 Public"}
                  variant="outlined"
                  sx={{ color: "#fff", borderColor: "#00ffff" }}
                />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {note.employee_name} (ID: {note.employee_id})
              </Typography>
              {editingNote?.id === note.id ? (
                <>
                  <TextField
                    multiline
                    fullWidth
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    sx={{ mt: 1, mb: 1, backgroundColor: "cyan", input: { color: "#fff" } }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button onClick={handleUpdate} size="small" variant="contained">💾 Save</Button>
                    <Button onClick={() => setEditingNote(null)} size="small" color="secondary">❌ Cancel</Button>
                  </Stack>
                </>
              ) : (
                <>
                  <Typography variant="body2">{note.note}</Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Button onClick={() => handleEdit(note)} size="small" variant="outlined" sx={{ color: "#00ffff", borderColor: "#00ffff" }}>
                      ✏️ Edit
                    </Button>
                    <Button onClick={() => handleDelete(note.id)} size="small" variant="outlined" color="error">
                      🗑 Delete
                    </Button>
                  </Stack>
                </>
              )}

              <Typography variant="caption" color="rgba(255,255,255,0.6)">
                {note.timestamp ? new Date(note.timestamp).toLocaleString() : "No timestamp"}
              </Typography>

            </Box>
          ))
        )}
      </Box>

    </Card>
  )
}
