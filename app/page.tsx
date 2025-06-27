"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Container, Tabs, Tab, ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import CEONotesView from "./components/ceo-notes-view"
import CEOAddNoteView from "./components/ceo-add-note-view"
import ManagerNotesView from "./components/manager-notes-view"
import ManagerAddNoteView from "./components/manager-add-note-view"

const theme = createTheme({
  palette: {
    primary: {
      main: "#5c7cfa",
    },
    background: {
      default: "#f5f5f5",
    },
  },
})

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function PerformanceManagementApp() {
  const [tabValue, setTabValue] = useState(0)
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    router.push("/login")
    setIsRedirecting(false) // Still mark redirection as done to avoid blocking forever
  }, [router])

  if (isRedirecting) {
    return null // Don't render anything while redirecting
  }

  return null // or a fallback <LoadingScreen /> if needed
}

function handleTabChange(event: React.SyntheticEvent, newValue: number) {
  // Not used here, but exists to avoid error
}
