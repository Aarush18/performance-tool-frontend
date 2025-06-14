"use client"
import { useEffect, useState } from "react"
import ProtectedRoute from "../../components/protected-route"
import CEONotesView from "../../components/ceo-notes-view"
import { Box, Button, Container, Typography } from "@mui/material"
import { useRouter } from "next/navigation"

export default function CEONotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState([])

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("token")  // moved inside useEffect
      if (!token) {
        console.error("No token found")
        return
      }
  
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getNotes`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
  
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
  
        const data = await res.json();
        setNotes(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    }
  
    fetchNotes()
  }, [])  // no dependency on token here
  

  return (
    <ProtectedRoute requiredRoles={["ceo"]}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            CEO Employee Notes
          </Typography>
          <Box>
            <Button variant="outlined" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </Box>
        </Box>
        <CEONotesView notes={notes} />
      </Container>
    </ProtectedRoute>
  )
}
