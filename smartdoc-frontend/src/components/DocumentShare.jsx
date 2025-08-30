import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Share2, UserPlus, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '../contexts/AuthContext'

const DocumentShare = ({ documentId, documentName }) => {
  const { API_BASE_URL } = useAuth()
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('view')
  const [loading, setLoading] = useState(false)
  const [shares, setShares] = useState([])
  const [loadingShares, setLoadingShares] = useState(false)
  const [error, setError] = useState('')

  // Fetch existing shares for this document
  const fetchShares = async () => {
    if (!documentId) return
    
    setLoadingShares(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/shares`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setShares(result.shares || [])
      } else {
        setError(result.error || 'Failed to fetch shares')
      }
    } catch (error) {
      console.error('Error fetching shares:', error)
      setError('Network error. Please try again.')
      // Add retry mechanism
      setTimeout(() => {
        setError('')
        fetchShares() // Auto retry after error clears
      }, 5000) // Clear error after 5 seconds and retry
    } finally {
      setLoadingShares(false)
    }
  }

  useEffect(() => {
    fetchShares()
  }, [documentId])

  const handleShareDocument = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/documents/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          document_id: documentId,
          shared_with_email: email,
          permission_level: permission
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Document shared',
          description: `${documentName} has been shared with ${email}`,
        })
        setEmail('')  // Reset form
        fetchShares() // Refresh shares list
      } else {
        setError(result.error || 'Failed to share document')
      }
    } catch (error) {
      console.error('Error sharing document:', error)
      setError('Network error. Please try again.')
      // Add retry mechanism
      setTimeout(() => {
        setError('')
      }, 5000) // Clear error after 5 seconds to allow retry
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveShare = async (shareId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/documents/shares/${shareId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Share removed',
          description: 'User access has been revoked',
        })
        fetchShares() // Refresh shares list
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to remove share')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  if (!documentId) {
    return <p className="text-sm text-muted-foreground">Select a document to share</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Document
        </CardTitle>
        <CardDescription>
          Share "{documentName}" with other users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleShareDocument} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="permission">Permission Level</Label>
            <Select
              value={permission}
              onValueChange={setPermission}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Share Document
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Shared With</h3>
          {loadingShares ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading shares...</span>
            </div>
          ) : shares.length > 0 ? (
            <div className="space-y-2">
              {shares.map((share) => (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium">{share.username}</p>
                    <p className="text-xs text-muted-foreground">{share.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={share.permission_level === 'admin' ? 'default' : 
                                  share.permission_level === 'edit' ? 'outline' : 'secondary'}>
                      {share.permission_level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveShare(share.id)}
                      title="Remove share"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">This document hasn't been shared with anyone yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DocumentShare