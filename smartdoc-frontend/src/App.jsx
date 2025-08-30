import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Brain, Sparkles, User, LogOut, Settings, Upload, MessageSquare, Menu, X, BarChart2, Share2, Users, ChevronLeft } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './components/ThemeToggle'
import DocumentUpload from './components/DocumentUpload'
import DocumentList from './components/DocumentList'
import FeedbackDashboard from './components/FeedbackDashboard'
import DocumentShare from './components/DocumentShare'
import SharedDocuments from './components/SharedDocuments'
import QuestionAnswer from './components/QuestionAnswer'
import DocumentPreview from './components/DocumentPreview'
import Login from './components/Login'
import Signup from './components/Signup'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import './App.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

const AppContent = () => {
  const { isAuthenticated, currentUser, logout } = useAuth()
  const [currentView, setCurrentView] = useState('upload') // 'documents', 'upload', 'feedback', 'shared'
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [selectedDocumentName, setSelectedDocumentName] = useState('')
  const [selectedDocuments, setSelectedDocuments] = useState([]) // For multiple document selection
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authView, setAuthView] = useState('login') // 'login' or 'signup'

  const handleDocumentSelect = (document) => {
    if (typeof document === 'object' && document !== null) {
      setSelectedDocument(document.document_id)
      setSelectedDocumentName(document.filename)
      setSelectedDocuments([document.document_id])
    } else {
      setSelectedDocument(document)
      setSelectedDocuments(document ? [document] : [])
    }
    // Change this from 'upload' to 'qa' to go to chat
    setCurrentView('qa')
  }
  
  const handleMultipleDocumentsSelect = (documentIds) => {
    setSelectedDocuments(documentIds)
  }
  
  const handleLoginSuccess = () => {
    setCurrentView('documents')
  }
  
  const handleLogout = () => {
    logout()
    setCurrentView('upload')
  }

  // Add function to handle chat button click
  const handleChatClick = () => {
    if (selectedDocument || selectedDocuments.length > 0) {
      setCurrentView('qa')
    }
  }

  // If not authenticated, show login/signup
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {authView === 'login' ? (
            <Login 
              key="login"
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignup={() => setAuthView('signup')}
            />
          ) : (
            <Signup 
              key="signup"
              onSignupSuccess={handleLoginSuccess}
              onSwitchToLogin={() => setAuthView('login')}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">SmartDoc</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant={currentView === 'documents' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('documents')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Documents
            </Button>
            <Button
              variant={currentView === 'shared' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('shared')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Shared With Me
            </Button>
            <Button
              variant={currentView === 'upload' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('upload')}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button
              variant={currentView === 'feedback' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('feedback')}
              className="flex items-center gap-2"
            >
              <BarChart2 className="h-4 w-4" />
              Feedback
            </Button>
          </nav>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>{currentUser?.username || 'User'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-6 mt-6">
                  <Button
                    variant={currentView === 'documents' ? 'default' : 'ghost'}
                    onClick={() => {
                      setCurrentView('documents')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-start gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Documents
                  </Button>
                  <Button
                    variant={currentView === 'shared' ? 'default' : 'ghost'}
                    onClick={() => {
                      setCurrentView('shared')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-start gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Shared With Me
                  </Button>
                  <Button
                    variant={currentView === 'upload' ? 'default' : 'ghost'}
                    onClick={() => {
                      setCurrentView('upload')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-start gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                  <Button
                    variant={currentView === 'feedback' ? 'default' : 'ghost'}
                    onClick={() => {
                      setCurrentView('feedback')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-start gap-2"
                  >
                    <BarChart2 className="h-4 w-4" />
                    Feedback
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        <AnimatePresence mode="wait">
          {currentView === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <DocumentList 
                  onDocumentSelect={handleDocumentSelect} 
                  selectedDocumentId={selectedDocument}
                  onMultipleDocumentsSelect={handleMultipleDocumentsSelect}
                  selectedDocumentIds={selectedDocuments}
                  setCurrentView={setCurrentView}
                />
                </div>
                <div className="space-y-4">
                  {/* Chat Button - Show when documents are selected */}
                  {(selectedDocument || selectedDocuments.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Chat with Documents
                        </CardTitle>
                        <CardDescription>
                          Ask questions about your selected documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={handleChatClick}
                          className="w-full"
                          size="lg"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Start Chat
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  
                  <DocumentShare 
                    documentId={selectedDocument} 
                    documentName={selectedDocumentName} 
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          {currentView === 'shared' && (
            <motion.div
              key="shared"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SharedDocuments onDocumentSelect={handleDocumentSelect} />
            </motion.div>
          )}
          
          {currentView === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentUpload selectedDocument={selectedDocument} />
            </motion.div>
          )}
          
          {currentView === 'qa' && (
            <motion.div
              key="qa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('documents')}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Documents
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {selectedDocuments.length > 1 ? (
                      <span>Asking about: <span className="font-medium">{selectedDocuments.length} documents</span></span>
                    ) : (
                      <span>Asking about: <span className="font-medium">{selectedDocumentName || 'selected document'}</span></span>
                    )}
                  </div>
                </div>
                <QuestionAnswer documentId={selectedDocument} documentIds={selectedDocuments} />
              </div>
            </motion.div>
          )}
          
          {currentView === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentPreview 
                documentId={selectedDocument}
                filename={selectedDocumentName}
                onBack={() => setCurrentView('documents')}
              />
            </motion.div>
          )}
          
          {currentView === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <FeedbackDashboard />
            </motion.div>
          )}
          
          {currentView === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TestComponent 
                currentView={currentView} 
                onNavigate={setCurrentView} 
              />
            </motion.div>
          )}
          
          {/* Fallback for unknown views */}
          {!['documents', 'shared', 'upload', 'qa', 'preview', 'feedback', 'test'].includes(currentView) && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center py-8"
            >
              <h2 className="text-2xl font-bold mb-4">Unknown View: {currentView}</h2>
              <p className="text-muted-foreground mb-4">This view is not implemented yet.</p>
              <div className="space-y-2">
                <Button onClick={() => setCurrentView('documents')} className="mr-2">
                  Go to Documents
                </Button>
                <Button onClick={() => setCurrentView('test')} variant="outline">
                  Test Routing
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}

export default App
