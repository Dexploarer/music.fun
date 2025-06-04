import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Task } from '../types';

export function useTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getTasks
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => tasksApi.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
    },
    onError: (error) => {
      toast.error(`Error creating task: ${error.message}`);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Task> }) => 
      tasksApi.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error updating task: ${error.message}`);
    }
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ id, newStatus, newPosition }: { id: string, newStatus: string, newPosition: number }) => 
      tasksApi.moveTask(id, newStatus, newPosition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error(`Error moving task: ${error.message}`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const reorderTasksMutation = useMutation({
    mutationFn: (tasks: { id: string, position: number }[]) => 
      tasksApi.reorderTasks(tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error(`Error reordering tasks: ${error.message}`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting task: ${error.message}`);
    }
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    moveTask: moveTaskMutation.mutate,
    reorderTasks: reorderTasksMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isMoving: moveTaskMutation.isPending,
    isReordering: reorderTasksMutation.isPending,
    isDeleting: deleteTaskMutation.isPending
  };
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getTaskById(id),
    enabled: !!id
  });
}