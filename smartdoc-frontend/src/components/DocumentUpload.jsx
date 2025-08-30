import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import QuestionAnswer from './QuestionAnswer'
import DocumentPreview from './DocumentPreview'
import { useAuth } from '../contexts/AuthContext'

const DocumentUpload = ({ onUploadSuccess, selectedDocument }) => {
  const { API_BASE_URL } = useAuth()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState(null)

  // If a document is selected elsewhere, show chat for it under this component
  useEffect(() => {
    if (selectedDocument && selectedDocument.document_id) {
      setUploadedDocument(selectedDocument)
    }
  }, [selectedDocument])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setValidationError(null)
      setUploadStatus(null)
    }
  }
  
  const resetUpload = () => {
    setFile(null)
    setUploadStatus(null)
    setUploadProgress(0)
    setValidationError(null)
  }

  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationError, setValidationError] = useState(null)

  const validateFile = (file) => {
    // Check file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    if (!allowedTypes.includes(file.type) && !['pdf', 'docx', 'txt'].includes(fileExtension)) {
      return 'Only PDF, DOCX, and TXT files are supported.'
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size exceeds 10MB limit.'
    }
    
    return null
  }

  const uploadDocument = async () => {
    if (!file) return

    // Validate file before uploading
    const error = validateFile(file)
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)
    setUploading(true)
    setUploadStatus(null)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token')
      
      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      })
      
      // Create a promise to handle the XHR request
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText)
              resolve(result)
            } catch (e) {
              reject(new Error('Invalid response format'))
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText)
              reject(new Error(errorData.error || `HTTP Error: ${xhr.status}`))
            } catch (e) {
              reject(new Error(`HTTP Error: ${xhr.status}`))
            }
          }
        }
        
        xhr.onerror = function() {
          reject(new Error('Network Error'))
        }
        
        xhr.open('POST', `${API_BASE_URL}/upload`, true)
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.send(formData)
      })
      
      const result = await uploadPromise
      
      const docInfo = {
        document_id: result.document_id,
        filename: result.filename,
        chunks_processed: result.chunks_processed
      }
      setUploadStatus({
        type: 'success',
        message: `Document uploaded successfully! Processed ${result.chunks_processed} chunks.`,
        data: result
      })
      setUploadedDocument(docInfo)
      onUploadSuccess && onUploadSuccess(result)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus({
        type: 'error',
        message: error.message || 'Upload failed'
      })
    } finally {
      setUploading(false)
    }
  }

  // resetUpload function is already defined above

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload a PDF, DOCX, or TXT file (max 10MB) to start asking questions about its content. 
          The document will be processed and indexed for quick retrieval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <motion.div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drag and drop your document here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                Remove
              </Button>
            </div>
            
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg flex items-center gap-3 bg-amber-50 text-amber-800 border border-amber-200"
              >
                <AlertCircle className="h-5 w-5" />
                <p>{validationError}</p>
              </motion.div>
            )}
            
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {uploadStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  uploadStatus.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {uploadStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <p className="text-sm">{uploadStatus.message}</p>
              </motion.div>
            )}

            <Button 
              onClick={uploadDocument} 
              disabled={uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </motion.div>
        )}
      </CardContent>
      {uploadedDocument?.document_id && (
        <div className="px-6 pb-6 space-y-6">
          <DocumentPreview documentId={uploadedDocument.document_id} filename={uploadedDocument.filename} />
          <QuestionAnswer documentId={uploadedDocument.document_id} />
        </div>
      )}
    </Card>
  )
}

export default DocumentUpload


