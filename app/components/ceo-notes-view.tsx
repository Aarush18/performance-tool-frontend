"use client"

import { useEffect, useState } from "react"
import {
  Card, CardContent, Typography, FormControl, InputLabel,
  Select, MenuItem, Box, Chip, Stack, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [userRole, setUserRole] = useState("")
  const [searchText, setSearchText] = useState("")

  const router = useRouter();

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
        const matchById = selectedEmployeeId !== ""
          ? note.employee_id === Number(selectedEmployeeId)
          : true
        const matchByYear = selectedYear
          ? new Date(note.timestamp).getFullYear().toString() === selectedYear
          : true
        const matchByCreator = selectedCreatorRole ? note.creator_role === selectedCreatorRole : true
        const matchByPrivacy = privacyFilter === "private"
          ? note.is_private === true
          : privacyFilter === "public"
            ? note.is_private === false
            : true
        const matchByText = searchText
          ? `${note.employee_name} ${note.note} ${note.employee_id}`
            .toLowerCase()
            .includes(searchText.toLowerCase())
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

  const handleEditSave = async () => {
    if (!selectedNote) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${selectedNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          note: selectedNote.note,
          type: selectedNote.note_type,
        }),
      })
      setEditDialogOpen(false)
      fetchNotes()
    } catch (err) {
      console.error("Error updating note:", err)
    }
  }

  const handleDelete = async () => {
    if (!selectedNote) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${selectedNote.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteDialogOpen(false)
      fetchNotes()
    } catch (err) {
      console.error("Error deleting note:", err)
    }
  }

  const handleExportPDF = () => {
    if (!selectedEmployeeId || !token) return
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/export/${selectedEmployeeId}?token=${token}`
    window.open(url, "_blank")
  }

  return (
    <>
      <TextField
        label="Search Notes"
        placeholder="Search by keyword, employee name, or ID"
        fullWidth
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ my: 2 }}
      />
      {userRole === "ceo" && selectedEmployeeId && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={handleExportPDF}>
            Export PDF for Employee
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/timeline/${selectedEmployeeId}`)}
          >
            View Timeline
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push(`/ceo/custom-tags/${selectedEmployeeId}`)}
          >
            Manage Tags
          </Button>
        </Stack>
      )}

      <Card sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            CEO Employee Notes View
          </Typography>

          <Stack spacing={3}>
            {/* Filters */}
            <FormControl fullWidth>
              <InputLabel shrink>Employee</InputLabel>
              <Select
                value={selectedEmployeeId}
                displayEmpty
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
                onChange={(e) => setSelectedCreatorRole(e.target.value)}
                displayEmpty
                renderValue={(selected) =>
                  selected === "" ? "All Roles" : selected.toUpperCase()
                }
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="ceo">CEO</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel shrink>Note Visibility</InputLabel>
              <Select
                value={privacyFilter}
                onChange={(e) => setPrivacyFilter(e.target.value as "all" | "private" | "public")}
                displayEmpty
                renderValue={(selected) =>
                  selected === "all"
                    ? "All Notes"
                    : selected === "private"
                      ? "Private Notes Only"
                      : "Public Notes Only"
                }
              >
                <MenuItem value="all">All Notes</MenuItem>
                <MenuItem value="private">Private Notes Only</MenuItem>
                <MenuItem value="public">Public Notes Only</MenuItem>
              </Select>
            </FormControl>

            {/* Notes */}
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
                      border: note.is_private ? "1px dashed #f44336" : "none",
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
                      <Chip
                        label={`By: ${note.creator_role.toUpperCase()}`}
                        size="small"
                        variant="filled"
                      />
                      <Chip
                        label={note.is_private ? "🔒 Private" : "🌐 Public"}
                        size="small"
                        color={note.is_private ? "error" : "primary"}
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

                    {["ceo", "manager"].includes(userRole) && (
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedNote(note)
                            setEditDialogOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setSelectedNote(note)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Stack>
        </CardContent>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Note"
              multiline
              rows={4}
              value={selectedNote?.note || ""}
              onChange={(e) =>
                setSelectedNote({ ...selectedNote!, note: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedNote?.note_type || ""}
                label="Type"
                onChange={(e) =>
                  setSelectedNote({ ...selectedNote!, note_type: e.target.value as "positive" | "negative" | "neutral" })
                }
              >
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="negative">Negative</MenuItem>
                <MenuItem value="neutral">Neutral</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditSave}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this note?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}
