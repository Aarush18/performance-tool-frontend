"use client"

import { useEffect, useState } from "react"
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Button,
} from "@mui/material"
import { useRouter } from "next/navigation"

interface Log {
    id: number
    user_id: number
    user_email: string // 👈 add this line
    action: string
    details: string
    timestamp: string
    target_id?: number
}


export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter();


    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activityLogs`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (!res.ok) throw new Error("Failed to fetch logs")
                const data = await res.json()
                setLogs(data)
            } catch (err) {
                console.error("Error fetching logs:", err)
                setLogs([])
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [])

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Activity Logs
                </Typography>
                <Button variant="outlined" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                </Button>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : logs.length === 0 ? (
                <Typography>No logs available.</Typography>
            ) : (
                <Card>
                    <CardContent>
                        <List>
                            {logs.map((log) => (
                                <Box key={log.id} sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                                    <Typography variant="subtitle2">
                                        👤 <strong>{log.user_email}</strong> performed <strong>{log.action}</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {log.details || "No extra details"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </Typography>
                                </Box>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}
        </Container>
    )
}
