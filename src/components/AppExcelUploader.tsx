import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Upload, LogIn } from "lucide-react"

// Mock authentication function
const mockAuth = (username: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you'd validate against a backend service
      resolve(username === 'admin' && password === 'password')
    }, 1000)
  })
}

function LoginForm({ onLogin }: { onLogin: (username: string, password: string) => Promise<void> }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onLogin(username, password)
    } catch (err) {
      setError('Invalid username or password')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-900 focus:border-blue-900"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-900 focus:border-blue-900"
        />
      </div>
      {error && (
        <div className="p-2 bg-red-100 border border-red-600 rounded flex items-center">
          <AlertCircle className="text-red-600 mr-2 h-5 w-5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white">
        Log In <LogIn className="ml-2 h-4 w-4" />
      </Button>
    </form>
  )
}

function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile)
      setError(null)
    } else {
      setFile(null)
      setError('Please select a valid .xlsx file')
    }
  }

  const convertToCSV = (data: any[][]): string => {
    return data.map(row => row.join(',')).join('\n')
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setProgress(0)
    setError(null)
    setSuccess(false)

    try {
      // Read the Excel file
      setProgress(20)
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // Convert to CSV
      setProgress(40)
      const csvData = convertToCSV(jsonData as any[][])

      // Simulate API call to upload CSV data to PostgreSQL
      setProgress(60)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

      setProgress(100)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800"
        />
      </div>
      {file && (
        <p className="text-sm text-gray-600">
          Selected file: {file.name}
        </p>
      )}
      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-900 hover:bg-blue-800 text-white"
      >
        {loading ? 'Processing...' : 'Upload and Process'}
        {!loading && <Upload className="ml-2 h-4 w-4" />}
      </Button>
      {loading && (
        <div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            {progress < 100 ? 'Processing...' : 'Finalizing...'}
          </p>
        </div>
      )}
      {error && (
        <div className="p-2 bg-red-100 border border-red-600 rounded flex items-center">
          <AlertCircle className="text-red-600 mr-2 h-5 w-5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-2 bg-green-100 border border-green-600 rounded flex items-center">
          <CheckCircle2 className="text-green-600 mr-2 h-5 w-5" />
          <p className="text-sm text-green-600">
            File successfully processed and uploaded to the database!
          </p>
        </div>
      )}
    </div>
  )
}

export default function Component() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = async (username: string, password: string) => {
    const success = await mockAuth(username, password)
    if (success) {
      setIsAuthenticated(true)
    } else {
      throw new Error('Authentication failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-blue-900">
            {isAuthenticated ? 'Upload Excel File' : 'Log in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isAuthenticated ? 'Upload your Excel file to process' : 'Enter your credentials to access the system'}
          </p>
        </div>
        {isAuthenticated ? (
          <FileUploader />
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
      </div>
    </div>
  )
}