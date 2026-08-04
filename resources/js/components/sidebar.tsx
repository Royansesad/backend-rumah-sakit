import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Role, ROLE_COLORS, ROLE_LABELS } from '../types/simrs';

interface SidebarProps {
  currentRole: Role;
  user?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, user }) => {
  const accentColor = ROLE_COLORS[currentRole] || '#4f46e5';
  const roleLabel = ROLE_LABELS[currentRole] || 'User';

  const menuItems = [
    { label: 'Dashboard', icon: 'DB', route: '/dashboard', roles: ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis', 'manajemen', 'pasien'] },
    { label: 'Manajemen User', icon: 'MU', route: '/users', roles: ['admin', 'manajemen'] },
    { label: 'Data Pasien', icon: 'DP', route: '/pasien', roles: ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis', 'manajemen'] },
    { label: 'Hak Akses (RBAC)', icon: 'HA', route: '/rbac', roles: ['admin'] },
    { label: 'Audit Log', icon: 'AL', route: '/audit-logs', roles: ['admin', 'manajemen'] },
  ];

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/logout');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0">
      <div>
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">RS</div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-none">SIMRS Portal</h1>
            <p className="text-xs text-gray-500 mt-1">Sistem Manajemen RS</p>
          </div>
        </div>

        <div className="p-4 mx-4 my-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            {user?.nama_lengkap?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-semibold text-sm text-gray-900 truncate">{user?.nama_lengkap || 'Pengguna'}</h2>
            <span 
              className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 text-white"
              style={{ backgroundColor: accentColor }}
            >
              {roleLabel}
            </span>
          </div>
        </div>

        <nav className="px-3 space-y-1 mt-2">
          {menuItems
            .filter(item => item.roles.includes(currentRole))
            .map((item, idx) => (
              <Link
                key={idx}
                href={item.route}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <span className="w-6 text-center text-xs font-bold">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleLogout}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium border border-red-200 transition-all"
          >
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
};
