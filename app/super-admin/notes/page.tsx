"use client"

import ProtectedRoute from "../../components/protected-route"
import SuperAdminNotesView from "../../components/super-admin-notes-view"

export default function SuperAdminNotesPage() {
  return (
    <ProtectedRoute requiredRoles={["super-admin"]}>
      <SuperAdminNotesView />
    </ProtectedRoute>
  )
} 