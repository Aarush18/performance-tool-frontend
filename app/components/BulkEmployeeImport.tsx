import { useState } from "react"

export default function BulkEmployeeImport({ apiUrl, onSuccess }: { apiUrl: string, onSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ message: string, errors?: any[] } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      } as any)
      const data = await res.json()
      setResult(data)
      if (onSuccess) onSuccess()
    } catch (err) {
      setResult({ message: "Upload failed", errors: [err] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="my-4 p-4 border rounded bg-slate-800">
      <label className="block mb-2 font-semibold">Bulk Import Employees (CSV)</label>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {result && (
        <div className="mt-2 text-sm">
          <div>{result.message}</div>
          {result.errors && result.errors.length > 0 && (
            <details>
              <summary>Errors</summary>
              <ul className="text-red-400">
                {result.errors.map((err, i) => (
                  <li key={i}>{JSON.stringify(err)}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
      <div className="text-xs text-gray-400 mt-2">
        CSV format: <code>name,email</code>
      </div>
    </div>
  )
} 