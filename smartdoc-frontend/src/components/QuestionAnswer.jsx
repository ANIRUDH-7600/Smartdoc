import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Bot, User, Loader2, RefreshCw, FileText, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import FeedbackForm from './FeedbackForm'

const QuestionAnswer = ({ documentId, documentIds }) => {
  const { API_BASE_URL } = useAuth()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState([])
  const [error, setError] = useState(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(null) // Stores the answer ID for which to show feedback form
  
  // Handle both single documentId and multiple documentIds
  const selectedDocumentIds = documentIds || (documentId ? [documentId] : [])

  const askQuestion = async () => {
    if (!question.trim()) return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('🤖 Asking question:', question)
      console.log('📄 Document ID:', documentId)
      console.log('📄 Document IDs:', documentIds)

      // Add user question to conversation first
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: question.trim(),
        timestamp: new Date()
      }
      setConversation(prev => [...prev, userMessage])

      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: question.trim(),
          document_id: documentId,
          document_ids: documentIds
        })
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Answer received:', result)

      if (result.answer) {
        const answerId = Date.now() + 1;
        const answerMessage = {
          id: answerId,
          type: 'answer',
          content: result.answer,
          confidence: result.confidence,
          sources: result.sources || [],
          contextChunks: result.context_chunks_used || 0,
          timestamp: new Date(),
          answerId: `answer-${answerId}` // Unique ID for the answer to use with feedback
        }
        setConversation(prev => [...prev, answerMessage])
        setQuestion('') // Clear question after successful answer
      } else {
        throw new Error('No answer received from server')
      }
    } catch (error) {
      console.error('❌ Error asking question:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.message || 'Failed to get answer. Please try again.',
        timestamp: new Date()
      }
      setConversation(prev => [...prev, errorMessage])
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askQuestion()
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Ask Questions
        </CardTitle>
        <CardDescription>
          Ask any question about your uploaded document and get AI-powered answers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Conversation History */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {conversation.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4" />
              <p>Ask a question about your document to get started!</p>
            </div>
          ) : (
            <AnimatePresence>
              {conversation.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'user' ? (
                    <div className="flex items-start gap-2">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <User className="h-5 w-5 mt-1 text-primary" />
                    </div>
                  ) : message.type === 'answer' ? (
                    <div className="flex items-start gap-2">
                      <Bot className="h-5 w-5 mt-1 text-primary" />
                      <div className="bg-muted px-4 py-3 rounded-lg max-w-xs lg:max-w-md">
                        <p className="text-sm whitespace-pre-wrap mb-2">{message.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Confidence: {message.confidence}</span>
                          {message.contextChunks > 0 && (
                            <span>• {message.contextChunks} chunks used</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFeedbackForm(message.answerId)}
                          className="mt-2 h-6 px-2 text-xs"
                        >
                          Rate Answer
                        </Button>
                      </div>
                    </div>
                  ) : message.type === 'error' ? (
                    <div className="flex items-start gap-2">
                      <Bot className="h-5 w-5 mt-1 text-red-500" />
                      <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg max-w-xs lg:max-w-md">
                        <p className="text-sm text-red-800">{message.content}</p>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}

        {/* Question Input */}
        <div className="flex gap-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your document..."
            className="flex-1 min-h-[60px] resize-none"
            disabled={loading}
          />
          <Button 
            onClick={askQuestion} 
            disabled={loading || !question.trim()}
            className="px-6"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Feedback Form */}
        {showFeedbackForm && (
          <div className="mt-4">
            <FeedbackForm
              answerId={showFeedbackForm}
              onFeedbackSubmitted={() => setShowFeedbackForm(null)}
              onClose={() => setShowFeedbackForm(null)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionAnswer


