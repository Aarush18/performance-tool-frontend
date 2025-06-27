import type React from "react"
import "./globals.css"
import { AuthProvider } from "./context/auth-context"
import { Orbitron } from "next/font/google"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})

export const metadata = {
  title: "Performance Dashboard",
  description: "Futuristic Performance Toolkit App",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={orbitron.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
