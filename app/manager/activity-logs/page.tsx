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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/activityLogs`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!res.ok) throw new Error("Failed to fetch logs")
                const data = await res.json()
                
                // Extract unique actions and users for filters
                const actions = [...new Set(data.map((log: Log) => log.action))] as string[]
                const users = [...new Set(data.map((log: Log) => log.user_email))] as string[]
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/activityLogs/${id}`, {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/activityLogs/${editLog.id}`, {
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
                    📜 Manager - Activity Logs
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
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 4,
                }}
            >
                <TextField
                    variant="outlined"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: "#7dd3fc" }} />,
                        sx: { color: "#fff" }
                    }}
                    sx={{
                        flex: '1 1 200px',
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#7dd3fc" },
                            "&:hover fieldset": { borderColor: "#7dd3fc" },
                            "&.Mui-focused fieldset": { borderColor: "#7dd3fc" },
                        },
                        "& .MuiInputLabel-root": { color: "#7dd3fc" }
                    }}
                />
                <FormControl sx={{ flex: '1 1 200px' }}>
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
                <FormControl sx={{ flex: '1 1 200px' }}>
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
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    sx={{
                        flex: '1 1 200px',
                        height: '56px',
                        backgroundColor: "#0ea5e9",
                        "&:hover": { backgroundColor: "#0284c7" }
                    }}
                >
                    Export CSV
                </Button>
            </Box>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress sx={{ color: "#7dd3fc" }} />
                </Box>
            ) : (
                <Stack spacing={2}>
                    {logs.map(log => (
                        <Card key={log.id} sx={{ bgcolor: "rgba(15, 23, 42, 0.7)", color: "#e2e8f0", border: "1px solid #1e293b", backdropFilter: "blur(5px)" }}>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "#94a3b8" }}>
                                            {log.user_email}
                                        </Typography>
                                        <Typography variant="body2" sx={{ my: 1 }}>
                                            <span style={{ fontWeight: "bold", color: "#5eead4" }}>Action:</span> {log.action}
                                        </Typography>
                                        <Typography variant="body2">
                                            <span style={{ fontWeight: "bold", color: "#a5b4fc" }}>Details:</span> {log.details}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton onClick={() => handleEditOpen(log)} size="small" sx={{ color: "#60a5fa" }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(log.id)} size="small" sx={{ color: "#f87171" }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography variant="caption" sx={{ color: "#475569", display: "block", mt: 1 }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    sx={{
                        "& .MuiPaginationItem-root": { color: "#7dd3fc" },
                        "& .Mui-selected": { backgroundColor: "rgba(14, 165, 233, 0.2)", color: "#fff" },
                    }}
                />
            </Box>

             {/* Edit Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Log</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Action"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editAction}
                        onChange={(e) => setEditAction(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Details"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editDetails}
                        onChange={(e) => setEditDetails(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSave} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
} 