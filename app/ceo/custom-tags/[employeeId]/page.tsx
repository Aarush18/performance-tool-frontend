"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import CustomTagsForm from "@/app/components/CustomTagsForm"

export default function CustomTagPage() {
  const params = useParams()
  const [employeeId, setEmployeeId] = useState<string | null>(null)

  useEffect(() => {
    if (params?.employeeId) {
      setEmployeeId(params.employeeId as string)
    }
  }, [params])

  if (!employeeId) {
    return <div>Loading employee data...</div>
  }

  return <CustomTagsForm employeeId={employeeId} />
}
