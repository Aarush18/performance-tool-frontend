"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import TimelineView from "@/app/components/TimelineView"
import { CircularProgress, Box, Typography } from "@mui/material"

interface Note {
    id: number
    note: string
    note_type: "positive" | "negative" | "neutral"
    timestamp: string
    created_by_name: string
}

export default function EmployeeTimelinePage() {
    const { employeeId } = useParams()
    const [notes, setNotes] = useState<Note[]>([])
    const [employeeName, setEmployeeName] = useState("")
    const [loading, setLoading] = useState(true)

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    useEffect(() => {
        const fetchTimeline = async () => {
            if (!token || !employeeId) return
    
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/timeline/${employeeId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
                if (!res.ok) throw new Error("Failed to fetch timeline data")
                const data = await res.json()
                setNotes(data)
                setEmployeeName(data[0]?.employee_name || "")
            } catch (err) {
                console.error("Error fetching timeline:", err)
            } finally {
                setLoading(false)
            }
        }
    
        fetchTimeline()
    }, [employeeId, token])
    
    return (
        <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Timeline: {employeeName}
            </Typography>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TimelineView notes={notes} />
            )}
        </Box>
    )
}
