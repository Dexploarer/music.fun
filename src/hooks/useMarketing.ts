import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingApi } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { MarketingCampaign } from '../types';

export function useMarketing() {
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ['marketing_campaigns'],
    queryFn: marketingApi.getCampaigns
  });

  const createCampaignMutation = useMutation({
    mutationFn: (campaign: Omit<MarketingCampaign, 'id'>) => marketingApi.createCampaign(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_campaigns'] });
      toast.success('Campaign created successfully!');
    },
    onError: (error) => {
      toast.error(`Error creating campaign: ${error.message}`);
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<MarketingCampaign> }) => 
      marketingApi.updateCampaign(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_campaigns'] });
      toast.success('Campaign updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error updating campaign: ${error.message}`);
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => marketingApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_campaigns'] });
      toast.success('Campaign deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting campaign: ${error.message}`);
    }
  });

  return {
    campaigns: campaignsQuery.data || [],
    isLoading: campaignsQuery.isLoading,
    isError: campaignsQuery.isError,
    error: campaignsQuery.error,
    createCampaign: createCampaignMutation.mutate,
    updateCampaign: updateCampaignMutation.mutate,
    deleteCampaign: deleteCampaignMutation.mutate,
    isCreating: createCampaignMutation.isPending,
    isUpdating: updateCampaignMutation.isPending,
    isDeleting: deleteCampaignMutation.isPending
  };
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['marketing_campaigns', id],
    queryFn: () => marketingApi.getCampaignById(id),
    enabled: !!id
  });
}