import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../lib/supabase';
import type { UserRole, SecuritySettings } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function useUserRoles() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['user_profiles'],
    queryFn: userApi.getUserProfiles
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_profiles'] });
      toast.success('Role updated');
    },
    onError: (error: any) => {
      toast.error(`Failed to update role: ${error.message}`);
    }
  });

  const updateSecurityMutation = useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: Partial<SecuritySettings> }) =>
      userApi.updateSecuritySettings(id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_profiles'] });
      toast.success('Security settings updated');
    },
    onError: (error: any) => {
      toast.error(`Failed to update security settings: ${error.message}`);
    }
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    updateRole: updateRoleMutation.mutateAsync,
    updateSecurity: updateSecurityMutation.mutateAsync
  };
}
