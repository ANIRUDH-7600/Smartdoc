import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Star, ThumbsUp, ThumbsDown, BarChart3, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'

const FeedbackDashboard = () => {
  const { API_BASE_URL } = useAuth()
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeedbackStats = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('Using token:', token) // Debug token
        
        const response = await fetch(`${API_BASE_URL}/feedback/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response error:', response.status, errorText)
          throw new Error(`Failed to fetch feedback statistics: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text()
          console.error('Non-JSON response:', text)
          throw new Error('Server returned non-JSON response')
        }

        const data = await response.json()
        setFeedbackData(data)
      } catch (err) {
        console.error('Error fetching feedback stats:', err)
        setError(err.message)
        toast.error('Failed to load feedback statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbackStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Dashboard</CardTitle>
          <CardDescription>Loading feedback statistics...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Dashboard</CardTitle>
          <CardDescription>Error loading feedback data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // If no feedback data yet
  if (!feedbackData || !feedbackData.stats || feedbackData.stats.total_feedback === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Dashboard</CardTitle>
          <CardDescription>No feedback data available yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Start rating answers to see feedback statistics here.</p>
        </CardContent>
      </Card>
    )
  }

  const { stats, recent_feedback } = feedbackData
  const helpfulPercentage = stats.total_feedback > 0 
    ? Math.round((stats.helpful_count / stats.total_feedback) * 100) 
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Dashboard</CardTitle>
        <CardDescription>View feedback statistics and improve your Q&A experience</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent Feedback</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Rating Overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${star <= Math.round(stats.average_rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.average_rating ? stats.average_rating.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on {stats.total_feedback} ratings
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Helpfulness Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Helpful</span>
                      </div>
                      <span className="text-sm font-medium">{stats.helpful_count || 0}</span>
                    </div>
                    
                    <Progress value={helpfulPercentage} className="h-2" />
                    
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Not Helpful</span>
                      </div>
                      <span className="text-sm font-medium">{stats.not_helpful_count || 0}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {helpfulPercentage}% of answers marked as helpful
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* System Improvement */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Your feedback helps us improve the AI's answers. Based on your ratings, we're continuously enhancing:
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>Answer accuracy and relevance</li>
                    <li>Context understanding</li>
                    <li>Response formatting and clarity</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent">
            {recent_feedback && recent_feedback.length > 0 ? (
              <div className="space-y-4">
                {recent_feedback.map((feedback) => (
                  <Card key={feedback.feedback_id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">
                            Answer ID: {feedback.answer_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(feedback.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {feedback.rating && (
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                                />
                              ))}
                            </div>
                          )}
                          {feedback.feedback_type && (
                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${feedback.feedback_type === 'helpful' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {feedback.feedback_type === 'helpful' ? (
                                <>
                                  <ThumbsUp className="h-3 w-3" />
                                  Helpful
                                </>
                              ) : (
                                <>
                                  <ThumbsDown className="h-3 w-3" />
                                  Not Helpful
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {feedback.comment && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <p className="italic">{feedback.comment}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No recent feedback available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default FeedbackDashboard