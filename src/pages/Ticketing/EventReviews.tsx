import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Star, 
  MessageSquare, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Filter,
  Search,
  Download,
  Calendar,
  BarChart
} from 'lucide-react';
import Breadcrumbs, { useBreadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useEvent } from '../../hooks/useEvents';
import { useEventReviews } from '../../hooks/useReviews';
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewsList from '../../components/reviews/ReviewsList';
import ReviewsOverview from '../../components/reviews/ReviewsOverview';
import CustomerFeedbackManager from '../../components/reviews/CustomerFeedbackManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const EventReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'form' | 'feedback-setup'>('overview');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch event data
  const { data: event, isLoading: isLoadingEvent } = useEvent(id || '');
  
  // Fetch reviews data
  const { reviews, isLoading: isLoadingReviews } = useEventReviews(id);
  
  // Filter reviews based on filter and search
  const filteredReviews = reviews
    .filter(review => filterRating === null || review.rating === filterRating)
    .filter(review => 
      searchTerm === '' || 
      review.reviewText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
  if (isLoadingEvent) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
        <p className="text-lg text-white">Loading event details...</p>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white">Event not found</h2>
        <p className="mt-2 text-gray-400">The event you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => navigate('/ticketing')}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Back to Events
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Header */}
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <button 
            onClick={() => navigate(`/ticketing/${id}`)}
            className="mb-2 flex items-center text-sm font-medium text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Event
          </button>
          <h1 className="font-playfair text-3xl font-bold tracking-tight text-white">
            {event.title} - Reviews
          </h1>
          <p className="text-sm text-gray-400">
            <Calendar size={14} className="inline-block mr-1" />
            {new Date(event.date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none">
            <Download size={16} className="mr-2" />
            Export
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none"
          >
            <Star size={16} className="mr-2" />
            Add Review
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart size={14} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center">
            <MessageSquare size={14} className="mr-2" />
            All Reviews
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center">
            <Star size={14} className="mr-2" />
            Add Review
          </TabsTrigger>
          <TabsTrigger value="feedback-setup" className="flex items-center">
            <ThumbsUp size={14} className="mr-2" />
            Questions Setup
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ReviewsOverview reviews={reviews} isLoading={isLoadingReviews} />
        </TabsContent>
        
        <TabsContent value="reviews">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-white">
                  <span className="font-medium">Filter:</span>
                  <button
                    onClick={() => setFilterRating(null)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      filterRating === null ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilterRating(rating === filterRating ? null : rating)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        filterRating === rating ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-gray-300'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="relative w-full sm:w-auto">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={12} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full sm:w-64 rounded-lg border-0 bg-zinc-800 py-1.5 pl-8 pr-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <ReviewsList
              reviews={filteredReviews}
              isLoading={isLoadingReviews}
              onSelect={(review) => console.log('Selected review:', review.id)}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="form">
          <ReviewForm eventId={id || ''} onSuccess={() => setActiveTab('reviews')} />
        </TabsContent>
        
        <TabsContent value="feedback-setup">
          <CustomerFeedbackManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventReviews;