import React from 'react';
import { useUserRoles } from '../hooks/useUserRoles';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import type { UserRole } from '../contexts/AuthContext';

const roles: UserRole[] = ['super_admin', 'admin', 'manager', 'staff', 'viewer'];

const UserRoles: React.FC = () => {
  const { users, isLoading, updateRole } = useUserRoles();
  const breadcrumbs = useBreadcrumbs();

  const handleChange = (id: string, role: UserRole) => {
    updateRole({ id, role });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="font-playfair text-2xl font-bold tracking-tight text-white">User Roles</h1>
      <div className="rounded-xl bg-zinc-900 p-4 shadow-lg overflow-x-auto">
        {isLoading ? (
          <p className="text-gray-400 p-4">Loading users...</p>
        ) : (
          <table className="min-w-full divide-y divide-zinc-700 text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-gray-300">Email</th>
                <th className="px-3 py-2 text-left text-gray-300">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td className="px-3 py-2 text-white">{u.email}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.role}
                      onChange={e => handleChange(u.id, e.target.value as UserRole)}
                      className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1"
                    >
                      {roles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserRoles;
