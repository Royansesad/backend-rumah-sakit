import React from 'react';
import { Sidebar } from './sidebar';
import { Role } from '../types/simrs';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  role?: Role;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, role = 'admin' }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex font-sans">
      <Sidebar currentRole={role} user={user} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
