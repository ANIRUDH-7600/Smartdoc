import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'

const FeedbackForm = ({ answerId, onFeedbackSubmitted, onClose }) => {
  const { API_BASE_URL } = useAuth()
  const [rating, setRating] = useState(null)
  const [feedbackType, setFeedbackType] = useState('helpful') // 'helpful' or 'not_helpful'
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!rating && !feedbackType) {
      toast.error('Please provide a rating or select if the answer was helpful')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('You must be logged in to submit feedback')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          answer_id: answerId,
          rating,
          feedback_type: feedbackType,
          comment: comment.trim() || null,
        }),
      })
      
      if (response.ok) {
        toast.success('Thank you for your feedback!')
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted()
        }
        // Reset form
        setRating(null)
        setFeedbackType('helpful')
        setComment('')
        setSubmitted(true)
      } else {
        const errorText = await response.text()
        let errorMessage = 'Failed to submit feedback'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          console.error('Error parsing error response:', errorText)
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('An error occurred while submitting feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="text-lg font-medium mb-4">Rate this answer</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">How would you rate this answer?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 rounded-md transition-colors ${rating >= star ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-400'}`}
              >
                <Star className="h-6 w-6" fill={rating >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        
        {/* Helpful/Not Helpful */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Was this answer helpful?</p>
          <RadioGroup value={feedbackType} onValueChange={setFeedbackType} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="helpful" id="helpful" />
              <Label htmlFor="helpful" className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" /> Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_helpful" id="not_helpful" />
              <Label htmlFor="not_helpful" className="flex items-center gap-1">
                <ThumbsDown className="h-4 w-4" /> No
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Comment */}
        <div className="mb-4">
          <Label htmlFor="comment" className="text-sm text-muted-foreground mb-2 block">
            Additional comments (optional)
          </Label>
          <Textarea
            id="comment"
            placeholder="What could be improved?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit Feedback
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}

export default FeedbackForm