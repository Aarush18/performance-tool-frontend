"use client"

import { useState } from "react"

import type React from "react"
import { useEffect } from "react"
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

  useEffect(() => {
    router.push("/login")
  }, [router])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="CEO Notes View" />
            <Tab label="CEO Add Note" />
            <Tab label="Manager Notes View" />
            <Tab label="Manager Add Note" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <CEONotesView />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <CEOAddNoteView />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <ManagerNotesView />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <ManagerAddNoteView />
        </TabPanel>
      </Container>
    </ThemeProvider>
  )
}

function handleTabChange(event: React.SyntheticEvent, newValue: number) {
  // This function is intentionally left empty as it is not needed for the redirection logic
}
