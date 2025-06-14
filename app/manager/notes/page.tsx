"use client"

import ProtectedRoute from "../../components/protected-route"
import ManagerNotesView from "../../components/manager-notes-view"
import { Box, Button, Container, Typography } from "@mui/material"
import { useRouter } from "next/navigation"

export default function ManagerNotesPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRoles={["manager"]}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Team Performance Notes
          </Typography>
          <Box>
            <Button variant="outlined" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </Box>
        </Box>
        <ManagerNotesView />
      </Container>
    </ProtectedRoute>
  )
}
