import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Eye, Download, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const DocumentPreview = ({ documentId, filename }) => {
  const { API_BASE_URL } = useAuth()
  const [loading, setLoading] = useState(true)
  const [previewData, setPreviewData] = useState(null)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (documentId) {
      fetchDocumentPreview()
    }
  }, [documentId])
  
  const fetchDocumentPreview = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/preview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch preview: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response')
      }
      
      const result = await response.json()
      setPreviewData(result)
    } catch (error) {
      console.error('Error fetching document preview:', error)
      setError(error.message || 'Failed to load document preview')
    } finally {
      setLoading(false)
    }
  }
  
  const downloadDocument = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
      
      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob()
        
        // Create a link element to trigger the download
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename || `document-${documentId}.pdf`
        document.body.appendChild(a)
        a.click()
        
        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to download document')
      }
    } catch (error) {
      setError('Network error during download. Please try again.')
    }
  }
  
  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-4">
        <CardContent className="pt-6 flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading document preview...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-4">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Preview</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
              <Button 
                onClick={() => fetchDocumentPreview()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!previewData) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-4">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-muted-foreground mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
            <p className="text-muted-foreground mb-4">
              This document doesn't have a preview available.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {previewData.filename || 'Document Preview'}
            </CardTitle>
            <CardDescription>
              Document ID: {previewData.document_id}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={downloadDocument}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Document Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">File Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filename:</span>
                    <span>{previewData.filename || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Type:</span>
                    <span>{previewData.file_type || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Size:</span>
                    <span>{previewData.file_size || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{previewData.status || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Upload Date:</span>
                    <span>{previewData.upload_date ? new Date(previewData.upload_date).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">Content Preview</h4>
              <p className="text-muted-foreground">
                Content preview is not available for this document type.
                Use the chat feature to ask questions about the document.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default DocumentPreview