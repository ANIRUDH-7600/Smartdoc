import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { FileText, Trash2, MessageSquare, Calendar, Loader2, RefreshCw, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const DocumentList = ({ onDocumentSelect, selectedDocumentId, onMultipleDocumentsSelect, selectedDocumentIds = [], setCurrentView }) => {
  const { API_BASE_URL } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState(selectedDocumentIds || [])
  const [selectMode, setSelectMode] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    if (selectedDocumentIds) {
      setSelectedDocuments(selectedDocumentIds)
    }
  }, [selectedDocumentIds])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (documentId) => {
    setDeletingId(documentId)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.document_id !== documentId))
        // If the deleted document was selected, clear selection
        if (selectedDocumentId === documentId) {
          onDocumentSelect(null)
        }
      } else {
        setError(result.error || 'Failed to delete document')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileTypeColor = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-800'
      case 'docx':
      case 'doc':
        return 'bg-blue-100 text-blue-800'
      case 'txt':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading documents...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Documents
            </CardTitle>
            <CardDescription>
              {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
              {multiSelectMode && selectedDocumentIds.length > 0 && (
                <span className="ml-2 text-primary">
                  ({selectedDocumentIds.length} selected)
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={multiSelectMode ? "default" : "outline"}
              size="sm"
              onClick={() => setMultiSelectMode(!multiSelectMode)}
            >
              {multiSelectMode ? "Single Select" : "Multi Select"}
            </Button>
            {multiSelectMode && selectedDocumentIds.length > 0 && (
               <Button
                 variant="default"
                 size="sm"
                 onClick={() => {
                   if (onMultipleDocumentsSelect) {
                     onMultipleDocumentsSelect(selectedDocumentIds);
                   }
                   onDocumentSelect({ document_id: selectedDocumentIds.join(','), filename: `${selectedDocumentIds.length} documents` });
                   if (setCurrentView) {
                     setCurrentView('qa');
                   }
                 }}
                 className="flex items-center gap-2"
               >
                 <MessageSquare className="h-4 w-4" />
                 Chat
               </Button>
             )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocuments}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {multiSelectMode && selectedDocumentIds.length > 0 && (
          <div className="mb-4 flex justify-end">
            <Button 
              onClick={() => {
                onDocumentSelect({ document_id: selectedDocumentIds[0], filename: `${selectedDocumentIds.length} documents` });
              }}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Ask Questions About Selected Documents
            </Button>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet.</p>
            <p className="text-sm">Upload your first document to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {documents.map((document) => (
                <motion.div
                    key={document.document_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                      multiSelectMode
                        ? selectedDocumentIds.includes(document.document_id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        : selectedDocumentId === document.document_id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      if (multiSelectMode) {
                        // Handle multi-select mode
                        const isSelected = selectedDocumentIds.includes(document.document_id);
                        const newSelectedIds = isSelected
                          ? selectedDocumentIds.filter(id => id !== document.document_id)
                          : [...selectedDocumentIds, document.document_id];
                        onMultipleDocumentsSelect(newSelectedIds);
                      } else {
                        // Handle single-select mode
                        onDocumentSelect(document);
                      }
                    }}
                    data-document-id={document.document_id}
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-medium truncate">{document.filename}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getFileTypeColor(document.file_type)}`}
                        >
                          {document.file_type.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{document.chunks_processed} chunks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(document.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Preview Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentView('preview')
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* Chat Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDocumentSelect(document)
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      
                      {/* Delete Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === document.document_id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {deletingId === document.document_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{document.filename}"? 
                              This action cannot be undone and will remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(document.document_id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DocumentList


