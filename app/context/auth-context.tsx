"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation" // ✅ import router
import type { User, AuthState, UserRole } from "../types/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (requiredRoles: UserRole[]) => boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialState)
  const router = useRouter() // ✅ initialize router

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser)
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        })
      } catch (error) {
        console.error("Failed to parse saved user", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        setAuthState({ ...initialState, loading: false })
      }
    } else {
      setAuthState({ ...initialState, loading: false })
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      const data = await res.json()
      const { user, token } = data

      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      })

      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    })
    router.push("/login") // ✅ redirect to login
  }

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!authState.isAuthenticated || !authState.user) {
      return false
    }
    return requiredRoles.includes(authState.user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
