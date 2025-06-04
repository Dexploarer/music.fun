import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Document } from '../types';

export function useDocuments(type?: string) {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents', type],
    queryFn: () => type ? documentsApi.getTemplates(type) : documentsApi.getDocuments()
  });

  const createDocumentMutation = useMutation({
    mutationFn: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => documentsApi.createDocument(document),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document created successfully!');
    },
    onError: (error) => {
      toast.error(`Error creating document: ${error.message}`);
    }
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Document> }) => 
      documentsApi.updateDocument(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error updating document: ${error.message}`);
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting document: ${error.message}`);
    }
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    createDocument: createDocumentMutation.mutate,
    updateDocument: updateDocumentMutation.mutate,
    deleteDocument: deleteDocumentMutation.mutate,
    isCreating: createDocumentMutation.isPending,
    isUpdating: updateDocumentMutation.isPending,
    isDeleting: deleteDocumentMutation.isPending
  };
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.getDocumentById(id),
    enabled: !!id
  });
}

export function useTemplateDocuments(type?: string) {
  return useQuery({
    queryKey: ['documents', 'templates', type],
    queryFn: () => documentsApi.getTemplates(type)
  });
}