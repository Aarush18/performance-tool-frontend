"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Paper,
} from "@mui/material"
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import jsPDF from "jspdf"

import { useRouter } from "next/navigation"

interface Note {
  id: number
  employee_name: string
  employee_email: string
  employee_id: number
  note_type: string
  performance_note: string
  is_private: boolean
  created_at: string
  tags?: string[]
  creator_email: string
  creator_role: string
}

interface Tag {
  id: number
  name: string
  color: string
}

export default function SuperAdminNotesView() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const router = useRouter()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
      setMessage({ type: "error", text: "Failed to fetch notes" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setNotes(notes.filter(note => note.id !== noteId))
        setMessage({ type: "success", text: "Note deleted successfully" })
      } else {
        throw new Error("Failed to delete note")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      setMessage({ type: "error", text: "Failed to delete note" })
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const filteredNotes = getFilteredNotes()

    let yPos = 20
    doc.setFontSize(20)
    doc.text("Performance Notes Report", 20, yPos)
    yPos += 20

    doc.setFontSize(12)
    filteredNotes.forEach((note, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text(`${index + 1}. ${note.employee_name || 'Unknown'}`, 20, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont(undefined, "normal")
      doc.text(`Email: ${note.employee_email || 'N/A'}`, 20, yPos)
      yPos += 6

      doc.text(`Type: ${note.note_type}`, 20, yPos)
      yPos += 6

      doc.text(`Date: ${new Date(note.created_at).toLocaleDateString()}`, 20, yPos)
      yPos += 6

      if (note.tags && note.tags.length > 0) {
        doc.text(`Tags: ${note.tags.join(", ")}`, 20, yPos)
        yPos += 6
      }

      const safeNote = typeof note.performance_note === 'string' ? note.performance_note : '';
      doc.text(`Note: ${safeNote.length > 100 ? safeNote.substring(0, 100) + '...' : safeNote}`, 20, yPos)
      yPos += 15
    })

    doc.save("performance-notes-report.pdf")
  }

  const getFilteredNotes = () => {
    return notes.filter(note => {
      const matchesSearch = (note.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (note.employee_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (note.performance_note || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = filterType === "all" || note.note_type === filterType

      return matchesSearch && matchesType
    })
  }

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "positive": return "#4caf50"
      case "negative": return "#f44336"
      case "neutral": return "#ff9800"
      default: return "#757575"
    }
  }

  const filteredNotes = getFilteredNotes()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: "#00ffff" }} />
      </Box>
    )
  }

  return (
    <Box>
      {message.text && (
        <Alert 
          severity={message.type === "success" ? "success" : "error"} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: "", text: "" })}
        >
          {message.text}
        </Alert>
      )}

      <Card
        sx={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(2,6,23,0.9))",
          border: "1px solid rgba(0,255,255,0.2)",
          boxShadow: "0 0 25px rgba(0,255,255,0.2)",
          borderRadius: 4,
          color: "#e0f2fe",
          backdropFilter: "blur(12px)",
          fontFamily: "'Orbitron', sans-serif",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ color: "#00ffff", fontWeight: "bold" }}>
              📊 Performance Notes Dashboard
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportToPDF}
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
            >
              Export PDF
            </Button>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "#00ffff", mr: 1 }} />,
              }}
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
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#00ffff" }}>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="negative">Negative</MenuItem>
                <MenuItem value="neutral">Neutral</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography variant="body2" sx={{ color: "#00ffff", mb: 2 }}>
            Showing {filteredNotes.length} of {notes.length} notes
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
        {filteredNotes.map((note) => {
          const safeNote = typeof note.performance_note === 'string' ? note.performance_note : '';
          return (
            <Card
              key={note.id}
              sx={{
                background: "linear-gradient(135deg, rgba(15,23,42,0.8), rgba(2,6,23,0.8))",
                border: "1px solid rgba(0,255,255,0.2)",
                boxShadow: "0 0 15px rgba(0,255,255,0.1)",
                borderRadius: 3,
                color: "#e0f2fe",
                backdropFilter: "blur(8px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 0 25px rgba(0,255,255,0.3)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" sx={{ color: "#00ffff", fontWeight: "bold" }}>
                      {note.employee_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#b0bec5" }}>
                      {note.employee_email || 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#b0bec5" }}>
                      Created by: {note.creator_email} ({note.creator_role})
                    </Typography>
                  </Box>
                  <Chip
                    label={note.note_type}
                    size="small"
                    sx={{
                      backgroundColor: getNoteTypeColor(note.note_type),
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                </Box>

                <Typography variant="body2" sx={{ mb: 2, color: "#e0f2fe" }}>
                  {safeNote.length > 100
                    ? `${safeNote.substring(0, 100)}...`
                    : safeNote}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ color: "#b0bec5" }}>
                    {new Date(note.created_at).toLocaleDateString()}
                  </Typography>
                  <Box>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedNote(note)
                          setViewDialogOpen(true)
                        }}
                        sx={{ color: "#00ffff" }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Note">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteNote(note.id)}
                        sx={{ color: "#f44336" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    {note.employee_id && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ ml: 1, color: '#00ffff', borderColor: '#00ffff' }}
                        onClick={() => router.push(`/super-admin/view-tags/${note.employee_id}`)}
                      >
                        View Tags for Employee
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )
        })}
      </Box>

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,0.95))",
            border: "1px solid rgba(0,255,255,0.3)",
            color: "#e0f2fe",
          },
        }}
      >
        {selectedNote && (
          <>
            <DialogTitle sx={{ color: "#00ffff", fontWeight: "bold" }}>
              Note Details - {selectedNote.employee_name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: "#00ffff", fontWeight: "bold" }}>
                  Employee Information
                </Typography>
                <Typography variant="body2" sx={{ color: "#e0f2fe" }}>
                  Name: {selectedNote.employee_name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#e0f2fe" }}>
                  Email: {selectedNote.employee_email}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: "#00ffff", fontWeight: "bold" }}>
                  Note Information
                </Typography>
                <Chip
                  label={selectedNote.note_type}
                  sx={{
                    backgroundColor: getNoteTypeColor(selectedNote.note_type),
                    color: "white",
                    fontWeight: "bold",
                    mb: 1,
                  }}
                />
                {selectedNote.is_private && (
                  <Chip
                    label="Private"
                    sx={{
                      backgroundColor: "#ff9800",
                      color: "white",
                      fontWeight: "bold",
                      ml: 1,
                    }}
                  />
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: "#00ffff", fontWeight: "bold" }}>
                  Performance Note
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(0,255,255,0.2)",
                  }}
                >
                  <Typography variant="body1" sx={{ color: "#e0f2fe", whiteSpace: "pre-wrap" }}>
                    {selectedNote.performance_note}
                  </Typography>
                </Paper>
              </Box>

              <Typography variant="caption" sx={{ color: "#b0bec5" }}>
                Created: {new Date(selectedNote.created_at).toLocaleString()}
              </Typography>

              <Typography variant="subtitle1" sx={{ color: "#00ffff", fontWeight: "bold" }}>
                Created By
              </Typography>
              <Typography variant="body2" sx={{ color: "#e0f2fe" }}>
                {selectedNote.creator_email} ({selectedNote.creator_role})
              </Typography>
            </DialogContent>
            <DialogActions>
              {selectedNote && selectedNote.employee_id && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ color: '#00ffff', borderColor: '#00ffff' }}
                  onClick={() => router.push(`/super-admin/view-tags/${selectedNote.employee_id}`)}
                >
                  View Tags for Employee
                </Button>
              )}
              <Button
                onClick={() => setViewDialogOpen(false)}
                sx={{
                  color: "#00ffff",
                  borderColor: "#00ffff",
                  "&:hover": {
                    borderColor: "#00ffff",
                    backgroundColor: "rgba(0,255,255,0.1)",
                  },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
} 