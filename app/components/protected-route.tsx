"use client"

import { type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/auth-context"
import type { UserRole } from "../types/auth"
import { CircularProgress, Box } from "@mui/material"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles: UserRole[]
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("loading:", loading, "isAuthenticated:", isAuthenticated, "hasPermission:", hasPermission(requiredRoles))
    if (!loading && !isAuthenticated) {
      router.push("/login")
    } else if (!loading && isAuthenticated && !hasPermission(requiredRoles)) {
      router.push("/unauthorized")
    }
  }, [loading, isAuthenticated, hasPermission, requiredRoles, router])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!hasPermission(requiredRoles)) {
    return null
  }

  return <>{children}</>
}
