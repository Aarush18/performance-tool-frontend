"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Divider,
  IconButton,
  Paper,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useRouter } from "next/navigation"

interface Props {
  employeeId: string
}

export default function CustomTagsForm({ employeeId }: Props) {
  const [tag, setTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [existingTags, setExistingTags] = useState<{ tag: string; created_by_role: string }[]>([])

  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const fetchTags = async () => {
      if (!employeeId || !token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch tags")
        const data = await res.json()
        setExistingTags(data)
      } catch (err) {
        console.error("Error fetching tags:", err)
      }
    }
    fetchTags()
  }, [employeeId, token, message])

  const handleAddTag = async () => {
    if (!tag.trim() || !employeeId || !token) return
  
    setLoading(true)
    setMessage("")
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/${employeeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tag }), // 👈 this was already fine
      })
  
      if (!res.ok) {
        const errorBody = await res.text()
        console.error("Backend error:", errorBody)
        throw new Error("Failed to add tag")
      }
  
      setMessage("Tag added successfully!")
      setTag("")
    } catch (err) {
      console.error("Error adding tag:", err)
      setMessage("Error adding tag")
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 700,
          p: 4,
          borderRadius: 3,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(18px)",
          color: "#fff",
          boxShadow: "0 8px 32px rgba(0,255,255,0.05)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            onClick={() => router.push("/dashboard")}
            sx={{
              mr: 1,
              color: "#90caf9",
              border: "1px solid rgba(255,255,255,0.2)",
              "&:hover": {
                backgroundColor: "rgba(144,202,249,0.1)",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ color: "#90caf9", fontWeight: "bold" }}>
            Add Custom Tag: ID {employeeId}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 3 }} />

        <TextField
          label="Enter Custom Tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
            mb: 2,
            input: { color: "#fff" },
            label: { color: "#90caf9" },
            "& .MuiOutlinedInput-root": {
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&:hover fieldset": {
                borderColor: "#90caf9",
              },
            },
          }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleAddTag}
          disabled={loading}
          sx={{
            borderRadius: 999,
            py: 1.2,
            fontWeight: 600,
            background: "linear-gradient(90deg, #00c6ff, #0072ff)",
            color: "#fff",
            boxShadow: "0 0 12px rgba(0,255,255,0.2)",
            "&:hover": {
              background: "linear-gradient(90deg, #0072ff, #00c6ff)",
              boxShadow: "0 0 16px rgba(0,255,255,0.4)",
            },
          }}
        >
          {loading ? "Adding..." : "Add Tag"}
        </Button>

        {message && (
          <Typography
            sx={{ mt: 2 }}
            color={message.includes("success") ? "lightgreen" : "red"}
          >
            {message}
          </Typography>
        )}

        {existingTags.length > 0 && (
          <Box sx={{ mt: 4 }}>
            {["ceo", "manager"].map((role) => {
              const roleTags = existingTags.filter(
                (t) => t.created_by_role.toLowerCase() === role
              )
              return (
                <Box key={role} sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#90caf9", mb: 1 }}
                  >
                    Tags by {role.toUpperCase()}:
                  </Typography>

                  {roleTags.length > 0 ? (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {roleTags.map((t, i) => (
                        <Chip
                          key={`${role}-${i}`}
                          label={t.tag}
                          variant="outlined"
                          sx={{
                            borderColor: "#90caf9",
                            color: "#90caf9",
                            backgroundColor: "rgba(144,202,249,0.1)",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="rgba(255,255,255,0.6)" sx={{ ml: 1 }}>
                      No tags yet.
                    </Typography>
                  )}
                </Box>
              )
            })}
          </Box>
        )}
      </Paper>
    </Box>
  )
}
