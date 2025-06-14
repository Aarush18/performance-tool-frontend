"use client"

import HRNotesView from "../../components/hr-notes-view"
import ProtectedRoute from "../../components/protected-route"

export default function HRNotesPage() {
  return (
    <ProtectedRoute requiredRoles={["hr"]}>
      <HRNotesView />
    </ProtectedRoute>
  )
}
