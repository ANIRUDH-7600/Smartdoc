import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const TestComponent = ({ currentView, onNavigate }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Component - View: {currentView}</CardTitle>
        <CardDescription>
          This is a test component to verify routing is working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onNavigate('documents')}>
            Go to Documents
          </Button>
          <Button onClick={() => onNavigate('upload')}>
            Go to Upload
          </Button>
          <Button onClick={() => onNavigate('feedback')}>
            Go to Feedback
          </Button>
          <Button onClick={() => onNavigate('shared')}>
            Go to Shared
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Current view: <strong>{currentView}</strong>
        </div>
      </CardContent>
    </Card>
  )
}

export default TestComponent
