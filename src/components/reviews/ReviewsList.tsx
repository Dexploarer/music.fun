import React from 'react';
import { Star, ThumbsUp, ThumbsDown, Calendar, User, Check, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { EventReview } from '../../types';

interface ReviewsListProps {
  reviews: EventReview[];
  isLoading: boolean;
  onSelect?: (review: EventReview) => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, isLoading, onSelect }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
        <span className="ml-2 text-white">Loading reviews...</span>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-lg bg-zinc-800 p-6 text-center">
        <p className="text-gray-300">No reviews yet</p>
        <p className="mt-1 text-sm text-gray-400">Be the first to leave a review!</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              rating >= star 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-zinc-600'
            }`}
          />
        ))}
        <span className="ml-2 text-white">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getSentimentIcon = (sentiment: string | null) => {
    if (!sentiment) return null;
    
    switch(sentiment) {
      case 'positive':
        return <ThumbsUp size={14} className="text-green-500" />;
      case 'negative':
        return <ThumbsDown size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div 
          key={review.id} 
          className="rounded-lg bg-zinc-800 p-4 hover:bg-zinc-700 cursor-pointer"
          onClick={() => onSelect && onSelect(review)}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              {renderStars(review.rating)}
              
              {review.reviewText && (
                <p className="text-gray-300 mt-2">{review.reviewText}</p>
              )}
              
              <div className="flex flex-wrap gap-1 mt-2">
                {review.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {review.sentiment && (
              <div className="flex items-center">
                {getSentimentIcon(review.sentiment)}
              </div>
            )}
          </div>
          
          <div className="mt-3 flex items-center justify-between border-t border-zinc-700 pt-2 text-xs text-gray-400">
            <div className="flex items-center">
              {review.customerName ? (
                <div className="flex items-center">
                  <User size={12} className="mr-1" />
                  <span>{review.customerName}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <User size={12} className="mr-1" />
                  <span>Anonymous</span>
                </div>
              )}
              
              {review.attendanceConfirmed && (
                <div className="ml-3 flex items-center text-green-500">
                  <Check size={12} className="mr-1" />
                  <span>Verified Attendee</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>{format(new Date(review.reviewDate), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;