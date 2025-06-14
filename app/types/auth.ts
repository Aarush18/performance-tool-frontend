export type UserRole = "ceo" | "manager" | "hr"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}
