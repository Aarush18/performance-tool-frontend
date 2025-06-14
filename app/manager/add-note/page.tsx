"use client"

import ProtectedRoute from "../../components/protected-route"
import ManagerAddNoteView from "../../components/manager-add-note-view"
import { Box, Button, Container, Typography } from "@mui/material"
import { useRouter } from "next/navigation"

export default function ManagerAddNotePage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRoles={["manager"]}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Add Team Member Note
          </Typography>
          <Box>
            <Button variant="outlined" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </Box>
        </Box>
        <ManagerAddNoteView />
      </Container>
    </ProtectedRoute>
  )
}
