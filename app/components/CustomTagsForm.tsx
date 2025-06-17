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
                body: JSON.stringify({ tag }),
            })

            if (!res.ok) throw new Error("Failed to add tag")

            setMessage("Tag added successfully!")
            setTag("")
        } catch (err) {
            setMessage("Error adding tag")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Paper elevation={3} sx={{ maxWidth: 600, mx: "auto", mt: 6, p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <IconButton onClick={() => router.push("/dashboard")} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5">Add Custom Tag for Employee ID: {employeeId}</Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <TextField
                label="Enter Custom Tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
            />

            <Button
                variant="contained"
                fullWidth
                onClick={handleAddTag}
                disabled={loading}
            >
                {loading ? "Adding..." : "Add Tag"}
            </Button>

            {message && (
                <Typography sx={{ mt: 2 }} color={message.includes("success") ? "green" : "red"}>
                    {message}
                </Typography>
            )}

            {existingTags.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    {["ceo", "manager"].map((role) => {
                        const roleTags = existingTags.filter(t => t.created_by_role.toLowerCase() === role)
                        return (
                            <Box key={role} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Tags by {role.toUpperCase()}:
                                </Typography>

                                {roleTags.length > 0 ? (
                                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                        {roleTags.map((t, i) => (
                                            <Chip key={`${role}-${i}`} label={t.tag} variant="outlined" />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                        No tags yet.
                                    </Typography>
                                )}
                            </Box>
                        )
                    })}

                </Box>
            )}

        </Paper>
    )
}
