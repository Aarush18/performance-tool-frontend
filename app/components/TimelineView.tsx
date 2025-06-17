import { Box, Typography, Divider, Chip, Button } from "@mui/material"
import { useRouter } from "next/navigation"

interface Note {
  id: number
  note: string
  note_type: "positive" | "negative" | "neutral"
  timestamp: string
  creator_email: string
}

interface Props {
  notes: Note[]
  employeeName?: string
}

export default function TimelineView({ notes, employeeName = "Unknown" }: Props) {
  const router = useRouter()

  if (notes.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => router.push("/dashboard")} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="body1" color="text.secondary">
          No notes available for this employee.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header and Back Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Timeline: {employeeName}</Typography>
        <Button variant="outlined" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </Box>

      {/* Notes */}
      {notes.map((note, index) => (
        <Box key={note.id} sx={{ mb: 3, pl: 2, borderLeft: "3px solid #ccc" }}>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "#555" }}>
              {new Date(note.timestamp).toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {note.note}
            </Typography>
            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
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
                size="small"
              />
              <Chip label={`By: ${note.creator_email}`} variant="outlined" size="small" />
            </Box>
          </Box>
          {index !== notes.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}
    </Box>
  )
}
