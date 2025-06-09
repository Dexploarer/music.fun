import React, { useState } from 'react';
import { Star, Send, Loader } from 'lucide-react';
import { useEventReviews, useFeedbackQuestions } from '../../hooks/useReviews';
import type { EventReview, FeedbackResponse } from '../../types';
import { toast } from 'react-hot-toast';

interface ReviewFormProps {
  eventId: string;
  onSuccess?: () => void;
  customerId?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  eventId,
  onSuccess,
  customerId
}) => {
  const { createReview, isCreating } = useEventReviews(eventId);
  const { questions, isLoading: isLoadingQuestions } = useFeedbackQuestions();
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [step, setStep] = useState<'rating' | 'review' | 'questions'>('rating');
  
  const commonTags = [
    'Sound Quality', 'Staff', 'Venue', 'Value', 
    'Drinks', 'Atmosphere', 'Accessibility', 'Seating'
  ];
  
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };
  
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };
  
  const handleHoverRating = (rating: number) => {
    setHoverRating(rating);
  };
  
  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    
    try {
      // Prepare review data
      const reviewData: Omit<EventReview, 'id' | 'createdAt' | 'updatedAt'> = {
        eventId: eventId,
        customerId: customerId || null,
        rating: rating,
        reviewText: reviewText || null,
        attendanceConfirmed: true,
        reviewDate: new Date().toISOString(),
        sentiment: rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral',
        tags: tags
      };
      
      // Prepare feedback responses if questions exist
      const feedbackResponses: Omit<FeedbackResponse, 'id' | 'reviewId' | 'createdAt'>[] = [];
      
      if (questions && questions.length > 0) {
        questions.forEach(question => {
          if (responses[question.id] !== undefined) {
            const response: Omit<FeedbackResponse, 'id' | 'reviewId' | 'createdAt'> = {
              questionId: question.id,
              responseText: null,
              responseRating: null,
              responseOption: null
            };
            
            switch (question.questionType) {
              case 'rating':
                response.responseRating = responses[question.id];
                break;
              case 'text':
                response.responseText = responses[question.id];
                break;
              case 'multiple_choice':
                response.responseOption = responses[question.id];
                break;
            }
            
            feedbackResponses.push(response);
          }
        });
      }
      
      // Submit review with responses
      await createReview({
        review: reviewData,
        responses: feedbackResponses
      });
      
      // Reset form
      setRating(0);
      setReviewText('');
      setResponses({});
      setTags([]);
      setStep('rating');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };
  
  const getActiveQuestions = () => {
    return questions.filter(q => q.active);
  };
  
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-4">
      <div className="flex space-x-1">
        <div className={`h-2 w-8 rounded-full ${step === 'rating' ? 'bg-amber-500' : 'bg-zinc-700'}`}></div>
        <div className={`h-2 w-8 rounded-full ${step === 'review' ? 'bg-amber-500' : 'bg-zinc-700'}`}></div>
        <div className={`h-2 w-8 rounded-full ${step === 'questions' ? 'bg-amber-500' : 'bg-zinc-700'}`}></div>
      </div>
    </div>
  );
  
  const renderRatingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-white">How would you rate your experience?</h3>
        <p className="text-sm text-gray-400">Tap a star to rate</p>
      </div>
      
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            onMouseEnter={() => handleHoverRating(star)}
            onMouseLeave={() => handleHoverRating(0)}
            className="p-1 focus:outline-none"
          >
            <Star
              size={32}
              className={`${
                (hoverRating || rating) >= star
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-zinc-600'
              }`}
            />
          </button>
        ))}
      </div>
      
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setStep('review')}
          disabled={rating === 0}
          className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
  
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="reviewText" className="block text-sm font-medium text-gray-300">
          Share your thoughts about the event
        </label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
          placeholder="Tell us about your experience..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          What aspects would you like to highlight?
        </label>
        <div className="flex flex-wrap gap-2">
          {commonTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                tags.includes(tag)
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep('rating')}
          className="inline-flex items-center rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600 focus:outline-none"
        >
          Back
        </button>
        
        {isLoadingQuestions || getActiveQuestions().length > 0 ? (
          <button
            type="button"
            onClick={() => setStep('questions')}
            className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
            className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Submit Review
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
  
  const renderQuestionsStep = () => {
    if (isLoadingQuestions) {
      return (
        <div className="flex justify-center py-8">
          <Loader size={24} className="animate-spin text-amber-500" />
        </div>
      );
    }
    
    const activeQuestions = getActiveQuestions();
    
    if (activeQuestions.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">No additional questions available</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white">Additional Feedback</h3>
          <p className="text-sm text-gray-400">Please answer a few more questions</p>
        </div>
        
        <div className="space-y-6">
          {activeQuestions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {question.questionText} {question.isRequired && <span className="text-red-500">*</span>}
              </label>
              
              {question.questionType === 'rating' && (
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => handleResponseChange(question.id, starValue)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={`${
                          (responses[question.id] || 0) >= starValue
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {question.questionType === 'text' && (
                <textarea
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Your answer..."
                  required={question.isRequired}
                />
              )}
              
              {question.questionType === 'multiple_choice' && (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        id={`${question.id}-option-${index}`}
                        type="radio"
                        value={option}
                        checked={responses[question.id] === option}
                        onChange={() => handleResponseChange(question.id, option)}
                        className="h-4 w-4 border-zinc-600 bg-zinc-800 text-amber-600 focus:ring-amber-600"
                        required={question.isRequired}
                      />
                      <label
                        htmlFor={`${question.id}-option-${index}`}
                        className="ml-2 text-sm text-gray-300"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep('review')}
            className="inline-flex items-center rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600 focus:outline-none"
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating || activeQuestions.some(q => q.isRequired && !responses[q.id])}
            className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6">
      {renderStepIndicator()}
      
      {step === 'rating' && renderRatingStep()}
      {step === 'review' && renderReviewStep()}
      {step === 'questions' && renderQuestionsStep()}
    </div>
  );
};

export default ReviewForm;