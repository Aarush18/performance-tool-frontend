"use client"

import { useParams } from "next/navigation"
import ProtectedRoute from "../../../components/protected-route"
import CustomTagsForm from "../../../components/CustomTagsForm"
import { Box, Typography, Paper } from "@mui/material"

export default function SuperAdminViewTagsPage() {
  const params = useParams()
  const employeeId = params?.employeeId as string | undefined

  return (
    <ProtectedRoute requiredRoles={["super-admin"]}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a, #020617)",
          py: 6,
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 800,
            mx: "auto",
            p: 4,
            borderRadius: 3,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(18px)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(0,255,255,0.05)",
          }}
        >
          <Typography variant="h4" sx={{ color: "#00ffff", fontWeight: "bold", mb: 3 }}>
            View & Add Tags for Employee
          </Typography>
          {employeeId ? (
            <CustomTagsForm employeeId={employeeId} />
          ) : (
            <Typography color="error">Invalid employee ID</Typography>
          )}
        </Paper>
      </Box>
    </ProtectedRoute>
  )
} 