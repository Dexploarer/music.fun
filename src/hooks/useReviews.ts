import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { EventReview, FeedbackQuestion, FeedbackResponse } from '../types';

export function useEventReviews(eventId?: string) {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['event_reviews', eventId],
    queryFn: () => reviewsApi.getEventReviews(eventId)
  });

  const createReviewMutation = useMutation({
    mutationFn: ({ review, responses }: { 
      review: Omit<EventReview, 'id' | 'createdAt' | 'updatedAt'>, 
      responses?: Omit<FeedbackResponse, 'id' | 'reviewId' | 'createdAt'>[] 
    }) => 
      reviewsApi.createEventReview(review, responses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_reviews'] });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['event_reviews', eventId] });
      }
      toast.success('Review submitted successfully!');
    },
    onError: (error) => {
      toast.error(`Error submitting review: ${error.message}`);
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<EventReview> }) => 
      reviewsApi.updateEventReview(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_reviews'] });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['event_reviews', eventId] });
      }
      toast.success('Review updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error updating review: ${error.message}`);
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.deleteEventReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_reviews'] });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['event_reviews', eventId] });
      }
      toast.success('Review deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting review: ${error.message}`);
    }
  });

  return {
    reviews: reviewsQuery.data || [],
    isLoading: reviewsQuery.isLoading,
    isError: reviewsQuery.isError,
    error: reviewsQuery.error,
    createReview: createReviewMutation.mutate,
    updateReview: updateReviewMutation.mutate,
    deleteReview: deleteReviewMutation.mutate,
    isCreating: createReviewMutation.isPending,
    isUpdating: updateReviewMutation.isPending,
    isDeleting: deleteReviewMutation.isPending
  };
}

export function useReviewDetails(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['review_details', id],
    queryFn: () => reviewsApi.getReviewById(id),
    enabled: !!id
  });
}

export function useFeedbackQuestions() {
  const queryClient = useQueryClient();

  const questionsQuery = useQuery({
    queryKey: ['feedback_questions'],
    queryFn: reviewsApi.getFeedbackQuestions
  });

  const createQuestionMutation = useMutation({
    mutationFn: (question: Omit<FeedbackQuestion, 'id' | 'createdAt' | 'updatedAt'>) => 
      reviewsApi.createFeedbackQuestion(question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback_questions'] });
      toast.success('Question added successfully!');
    },
    onError: (error) => {
      toast.error(`Error adding question: ${error.message}`);
    }
  });

  return {
    questions: questionsQuery.data || [],
    isLoading: questionsQuery.isLoading,
    isError: questionsQuery.isError,
    error: questionsQuery.error,
    createQuestion: createQuestionMutation.mutate,
    isCreating: createQuestionMutation.isPending
  };
}