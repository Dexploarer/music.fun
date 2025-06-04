import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketingApi } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Ticket } from '../types';

export function useTickets(eventId?: string) {
  const queryClient = useQueryClient();

  const ticketsQuery = useQuery({
    queryKey: ['tickets', eventId],
    queryFn: () => ticketingApi.getTickets(eventId)
  });

  const createTicketMutation = useMutation({
    mutationFn: (ticket: Omit<Ticket, 'id'>) => ticketingApi.createTicket(ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Ticket created successfully!');
    },
    onError: (error) => {
      toast.error(`Error creating ticket: ${error.message}`);
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Ticket> }) => 
      ticketingApi.updateTicket(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Ticket updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error updating ticket: ${error.message}`);
    }
  });

  const scanTicketMutation = useMutation({
    mutationFn: (id: string) => ticketingApi.scanTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Ticket scanned successfully!');
    },
    onError: (error) => {
      toast.error(`Error scanning ticket: ${error.message}`);
    }
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (id: string) => ticketingApi.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Ticket deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting ticket: ${error.message}`);
    }
  });

  return {
    tickets: ticketsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    isError: ticketsQuery.isError,
    error: ticketsQuery.error,
    createTicket: createTicketMutation.mutate,
    updateTicket: updateTicketMutation.mutate,
    scanTicket: scanTicketMutation.mutate,
    deleteTicket: deleteTicketMutation.mutate,
    isCreating: createTicketMutation.isPending,
    isUpdating: updateTicketMutation.isPending,
    isScanning: scanTicketMutation.isPending,
    isDeleting: deleteTicketMutation.isPending
  };
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketingApi.getTicketById(id),
    enabled: !!id
  });
}