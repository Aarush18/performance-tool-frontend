"use client"

import { useEffect, useState } from "react"
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Button,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Pagination,
    Grid,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { Search as SearchIcon, FilterList as FilterIcon, Download as DownloadIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

interface Log {
    id: number
    user_id: number
    user_email: string
    action: string
    details: string
    timestamp: string
    target_id?: number
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [actionFilter, setActionFilter] = useState("")
    const [userFilter, setUserFilter] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [uniqueActions, setUniqueActions] = useState<string[]>([])
    const [uniqueUsers, setUniqueUsers] = useState<string[]>([])
    const [editOpen, setEditOpen] = useState(false)
    const [editLog, setEditLog] = useState<Log | null>(null)
    const [editAction, setEditAction] = useState("")
    const [editDetails, setEditDetails] = useState("")
    const router = useRouter()
    const logsPerPage = 10

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activityLogs`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!res.ok) throw new Error("Failed to fetch logs")
                const data = await res.json()
                
                // Extract unique actions and users for filters
                const actions = [...new Set(data.map((log: Log) => log.action))]
                const users = [...new Set(data.map((log: Log) => log.user_email))]
                setUniqueActions(actions)
                setUniqueUsers(users)

                // Apply filters
                const filteredLogs = data.filter((log: Log) => {
                    const matchesSearch = searchQuery === "" || 
                        log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.details.toLowerCase().includes(searchQuery.toLowerCase())
                    const matchesAction = actionFilter === "" || log.action === actionFilter
                    const matchesUser = userFilter === "" || log.user_email === userFilter
                    return matchesSearch && matchesAction && matchesUser
                })

                setTotalPages(Math.ceil(filteredLogs.length / logsPerPage))
                
                // Paginate results
                const startIndex = (page - 1) * logsPerPage
                const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage)
                setLogs(paginatedLogs)
            } catch (err) {
                console.error("Error fetching logs:", err)
                setLogs([])
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [page, searchQuery, actionFilter, userFilter])

    const handleExport = () => {
        const csvContent = [
            ["User", "Action", "Details", "Timestamp"],
            ...logs.map(log => [
                log.user_email,
                log.action,
                log.details,
                new Date(log.timestamp).toLocaleString()
            ])
        ].map(row => row.join(",")).join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `activity_logs_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this log?")) return;
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activityLogs/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
            setLogs(logs.filter(log => log.id !== id))
        }
    }

    const handleEditOpen = (log: Log) => {
        setEditLog(log)
        setEditAction(log.action)
        setEditDetails(log.details)
        setEditOpen(true)
    }

    const handleEditSave = async () => {
        if (!editLog) return
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activityLogs/${editLog.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: editAction, details: editDetails }),
        })
        if (res.ok) {
            setLogs(logs.map(l => l.id === editLog.id ? { ...l, action: editAction, details: editDetails } : l))
            setEditOpen(false)
        }
    }

    return (
        <Container
            maxWidth="lg"
            sx={{
                background: "linear-gradient(135deg, #0f172a, #020617)",
                minHeight: "100vh",
                pt: 6,
                pb: 6,
                borderRadius: 3,
                boxShadow: "0 0 30px rgba(0, 255, 255, 0.08)",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontWeight: "bold",
                        color: "#7dd3fc",
                        textShadow: "0 0 10px rgba(125, 211, 252, 0.4)",
                    }}
                >
                    📜 Activity Logs
                </Typography>

                <Button
                    variant="outlined"
                    onClick={() => router.push("/dashboard")}
                    sx={{
                        color: "#7dd3fc",
                        borderColor: "#7dd3fc",
                        "&:hover": {
                            backgroundColor: "#0ea5e9",
                            color: "#0f172a",
                            borderColor: "#0ea5e9",
                        },
                    }}
                >
                    Back to Dashboard
                </Button>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: "#7dd3fc" }} />,
                            sx: { color: "#fff" }
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "#7dd3fc" },
                                "&:hover fieldset": { borderColor: "#7dd3fc" },
                                "&.Mui-focused fieldset": { borderColor: "#7dd3fc" },
                            },
                            "& .MuiInputLabel-root": { color: "#7dd3fc" }
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ color: "#7dd3fc" }}>Filter by Action</InputLabel>
                        <Select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            sx={{
                                color: "#fff",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#7dd3fc" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#7dd3fc" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7dd3fc" },
                            }}
                        >
                            <MenuItem value="">All Actions</MenuItem>
                            {uniqueActions.map(action => (
                                <MenuItem key={action} value={action}>{action}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel sx={{ color: "#7dd3fc" }}>Filter by User</InputLabel>
                        <Select
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            sx={{
                                color: "#fff",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#7dd3fc" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#7dd3fc" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7dd3fc" },
                            }}
                        >
                            <MenuItem value="">All Users</MenuItem>
                            {uniqueUsers.map(user => (
                                <MenuItem key={user} value={user}>{user}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleExport}
                        startIcon={<DownloadIcon />}
                        sx={{
                            height: "100%",
                            color: "#7dd3fc",
                            borderColor: "#7dd3fc",
                            "&:hover": {
                                backgroundColor: "#0ea5e9",
                                color: "#0f172a",
                                borderColor: "#0ea5e9",
                            },
                        }}
                    >
                        Export Logs
                    </Button>
                </Grid>
            </Grid>

            {loading ? (
                <CircularProgress sx={{ color: "#7dd3fc" }} />
            ) : logs.length === 0 ? (
                <Typography sx={{ color: "#e0f2fe" }}>No logs available.</Typography>
            ) : (
                <>
                <Card
                    sx={{
                        background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(2,6,23,0.9))",
                        border: "1px solid rgba(125,211,252,0.2)",
                        boxShadow: "0 0 25px rgba(125,211,252,0.2)",
                        borderRadius: 4,
                        color: "#e0f2fe",
                        backdropFilter: "blur(12px)",
                        fontFamily: "'Orbitron', sans-serif",
                            mb: 3
                    }}
                >
                    <CardContent>
                        <Stack spacing={3}>
                            {logs.map((log) => (
                                <Box
                                    key={log.id}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: "linear-gradient(145deg, rgba(30,58,138,0.3), rgba(2,6,23,0.6))",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        boxShadow: "0 5px 20px rgba(0,255,255,0.1)",
                                        transition: "transform 0.2s",
                                        "&:hover": {
                                            transform: "scale(1.01)",
                                            boxShadow: "0 5px 30px rgba(0,255,255,0.3)",
                                        },
                                        position: "relative"
                                    }}
                                >
                                    <Typography variant="subtitle1" sx={{ color: "#7dd3fc", fontWeight: "bold" }}>
                                        👤 {log.user_email}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        🔧 Action: <strong>{log.action}</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 1 }}>
                                        📝 {log.details || "No extra details"}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ mt: 2, display: "block", color: "rgba(255,255,255,0.6)" }}
                                    >
                                        ⏰ {new Date(log.timestamp).toLocaleString()}
                                    </Typography>
                                    <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
                                        <IconButton onClick={() => handleEditOpen(log)} size="small">
                                            <EditIcon sx={{ color: "#0ea5e9" }} />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(log.id)} size="small">
                                            <DeleteIcon sx={{ color: "#ef4444" }} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>

                    {/* Pagination */}
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, value) => setPage(value)}
                            sx={{
                                "& .MuiPaginationItem-root": {
                                    color: "#7dd3fc",
                                    borderColor: "#7dd3fc",
                                    "&.Mui-selected": {
                                        backgroundColor: "#7dd3fc",
                                        color: "#0f172a",
                                        "&:hover": {
                                            backgroundColor: "#7dd3fc",
                                        },
                                    },
                                    "&:hover": {
                                        backgroundColor: "rgba(125,211,252,0.1)",
                                    },
                                },
                            }}
                        />
                    </Box>

                    {/* Edit Modal */}
                    <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                        <DialogTitle>Edit Activity Log</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Action"
                                value={editAction}
                                onChange={e => setEditAction(e.target.value)}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Details"
                                value={editDetails}
                                onChange={e => setEditDetails(e.target.value)}
                                fullWidth
                                margin="normal"
                                multiline
                                minRows={2}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditOpen(false)} color="secondary">Cancel</Button>
                            <Button onClick={handleEditSave} color="primary" variant="contained">Save</Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Container>
    )
}
