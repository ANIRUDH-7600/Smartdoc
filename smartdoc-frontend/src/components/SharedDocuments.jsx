import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { FileText, Loader2, RefreshCw, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const SharedDocuments = ({ onDocumentSelect }) => {
  const { API_BASE_URL } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSharedDocuments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/documents/shared-with-me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setDocuments(result.shared_documents || [])
        setError('')
      } else {
        setError(result.error || 'Failed to fetch shared documents')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSharedDocuments()
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    fetchSharedDocuments()
  }

  const getFileIcon = (fileType) => {
    return <FileText className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Shared With Me
          </CardTitle>
          <CardDescription>Documents shared by other users</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No documents have been shared with you yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {documents.map((doc) => (
                <motion.div
                  key={doc.document_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => onDocumentSelect(doc.document_id)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="text-muted-foreground">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{doc.filename}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{doc.file_type}</Badge>
                          <Badge variant="secondary">{doc.permission_level}</Badge>
                          <span className="text-xs text-muted-foreground">Shared by: {doc.owner}</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SharedDocuments