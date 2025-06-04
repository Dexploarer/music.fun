import React from 'react';
import { Star, BarChart } from 'lucide-react';
import { EventReview } from '../../types';

interface ReviewsOverviewProps {
  reviews: EventReview[];
  isLoading: boolean;
}

interface RatingSummary {
  average: number;
  count: number;
  distribution: Record<number, number>;
  tags: Record<string, number>;
}

const ReviewsOverview: React.FC<ReviewsOverviewProps> = ({ reviews, isLoading }) => {
  // Calculate rating summary
  const calculateSummary = (): RatingSummary => {
    if (!reviews || reviews.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        tags: {}
      };
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    
    // Calculate distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    
    // Calculate tag frequency
    const tags: Record<string, number> = {};
    reviews.forEach(review => {
      review.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });
    
    return {
      average: sum / reviews.length,
      count: reviews.length,
      distribution,
      tags
    };
  };
  
  const summary = calculateSummary();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
        <span className="ml-2 text-white">Loading reviews...</span>
      </div>
    );
  }
  
  // Sort tags by frequency (descending)
  const sortedTags = Object.entries(summary.tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 tags

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-medium text-white">Reviews Overview</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Average Rating */}
        <div className="rounded-lg bg-zinc-800 p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Average Rating</p>
          <div className="flex items-center justify-center">
            <Star size={20} className="text-amber-400 fill-amber-400 mr-1" />
            <span className="text-2xl font-bold text-white">
              {summary.count > 0 ? summary.average.toFixed(1) : '-'}
            </span>
            <span className="text-sm text-gray-400 ml-1">/ 5</span>
          </div>
        </div>
        
        {/* Total Reviews */}
        <div className="rounded-lg bg-zinc-800 p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-white">{summary.count}</p>
        </div>
        
        {/* Recommendation Rate */}
        <div className="rounded-lg bg-zinc-800 p-4 text-center">
          <p className="text-sm text-gray-400 mb-1">Recommendation Rate</p>
          <p className="text-2xl font-bold text-white">
            {summary.count > 0
              ? `${Math.round((
                  (summary.distribution[4] || 0) + 
                  (summary.distribution[5] || 0)
                ) / summary.count * 100)}%`
              : '-'}
          </p>
        </div>
      </div>
      
      {/* Rating Distribution */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-white flex items-center">
          <BarChart size={16} className="mr-2 text-amber-500" />
          Rating Distribution
        </h4>
        
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = summary.distribution[rating] || 0;
            const percentage = summary.count > 0 
              ? (count / summary.count * 100)
              : 0;
            
            return (
              <div key={rating} className="flex items-center">
                <div className="w-12 text-gray-300 text-sm">{rating} star</div>
                <div className="flex-1 mx-2">
                  <div className="h-2 w-full bg-zinc-700 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        rating >= 4 ? 'bg-green-500' :
                        rating === 3 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="text-xs text-gray-300">{count}</span>
                  <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Top Mentioned Tags */}
      {sortedTags.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-white">Most Mentioned</h4>
          <div className="flex flex-wrap gap-2">
            {sortedTags.map(([tag, count]) => (
              <div 
                key={tag}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs"
              >
                <span className="text-gray-300">{tag}</span>
                <span className="ml-1 text-amber-500">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsOverview;