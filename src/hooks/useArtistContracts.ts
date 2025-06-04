import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artistContractsApi } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { ArtistContract, ArtistPayment, RoyaltyReport } from '../types';

export function useArtistContracts(artistId?: string) {
  const queryClient = useQueryClient();

  const contractsQuery = useQuery({
    queryKey: ['artist_contracts', artistId],
    queryFn: () => artistContractsApi.getArtistContracts(artistId),
    enabled: true
  });

  const createContractMutation = useMutation({
    mutationFn: (contract: Omit<ArtistContract, 'id' | 'createdAt' | 'updatedAt'>) => 
      artistContractsApi.createArtistContract(contract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist_contracts'] });
      if (artistId) {
        queryClient.invalidateQueries({ queryKey: ['artist_contracts', artistId] });
        queryClient.invalidateQueries({ queryKey: ['artists', artistId] });
      }
      toast.success('Contract created successfully!');
    },
    onError: (error) => {
      toast.error(`Error creating contract: ${error.message}`);
    }
  });

  const updateContractMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<ArtistContract> }) => 
      artistContractsApi.updateArtistContract(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist_contracts'] });
      if (artistId) {
        queryClient.invalidateQueries({ queryKey: ['artist_contracts', artistId] });
      }
      toast.success('Contract updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error updating contract: ${error.message}`);
    }
  });

  const deleteContractMutation = useMutation({
    mutationFn: (id: string) => artistContractsApi.deleteArtistContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist_contracts'] });
      if (artistId) {
        queryClient.invalidateQueries({ queryKey: ['artist_contracts', artistId] });
      }
      toast.success('Contract deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting contract: ${error.message}`);
    }
  });

  return {
    contracts: contractsQuery.data || [],
    isLoading: contractsQuery.isLoading,
    isError: contractsQuery.isError,
    error: contractsQuery.error,
    createContract: createContractMutation.mutate,
    updateContract: updateContractMutation.mutate,
    deleteContract: deleteContractMutation.mutate,
    isCreating: createContractMutation.isPending,
    isUpdating: updateContractMutation.isPending,
    isDeleting: deleteContractMutation.isPending
  };
}

export function useArtistContract(id: string) {
  return useQuery({
    queryKey: ['artist_contracts', id],
    queryFn: () => artistContractsApi.getContractById(id),
    enabled: !!id
  });
}

export function useArtistPayments(artistId?: string, contractId?: string, eventId?: string) {
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ['artist_payments', artistId, contractId, eventId],
    queryFn: () => artistContractsApi.getArtistPayments(artistId, contractId, eventId),
    enabled: true
  });

  const createPaymentMutation = useMutation({
    mutationFn: (payment: Omit<ArtistPayment, 'id' | 'createdAt' | 'updatedAt'>) => 
      artistContractsApi.createArtistPayment(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist_payments'] });
      if (artistId) {
        queryClient.invalidateQueries({ queryKey: ['artist_payments', artistId] });
      }
      if (contractId) {
        queryClient.invalidateQueries({ queryKey: ['artist_payments', artistId, contractId] });
      }
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['artist_payments', artistId, contractId, eventId] });
      }
      toast.success('Payment recorded successfully!');
    },
    onError: (error) => {
      toast.error(`Error recording payment: ${error.message}`);
    }
  });

  return {
    payments: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading,
    isError: paymentsQuery.isError,
    error: paymentsQuery.error,
    createPayment: createPaymentMutation.mutate,
    isCreating: createPaymentMutation.isPending
  };
}

export function useRoyaltyReports(artistId?: string, eventId?: string) {
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ['royalty_reports', artistId, eventId],
    queryFn: () => artistContractsApi.getRoyaltyReports(artistId, eventId),
    enabled: true
  });

  const createReportMutation = useMutation({
    mutationFn: (report: Omit<RoyaltyReport, 'id' | 'createdAt' | 'updatedAt'>) => 
      artistContractsApi.createRoyaltyReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['royalty_reports'] });
      if (artistId) {
        queryClient.invalidateQueries({ queryKey: ['royalty_reports', artistId] });
      }
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['royalty_reports', artistId, eventId] });
      }
      toast.success('Royalty report created successfully!');
    },
    onError: (error) => {
      toast.error(`Error creating royalty report: ${error.message}`);
    }
  });

  return {
    reports: reportsQuery.data || [],
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    error: reportsQuery.error,
    createReport: createReportMutation.mutate,
    isCreating: createReportMutation.isPending
  };
}