import React from 'react';
import { AuditLogsView } from '../components/menus/audit-logs-view';
import { UsersView } from '../components/menus/users-view';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';

interface ManajemenMenuProps {
    user: any;
    role: Role;
    menu: string;
    users?: any[];
    selectedRole?: string;
    logs?: any[];
}

function FallbackView({ menu }: { menu: string }) {
    return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
                Menu Belum Tersedia
            </h1>
            <p className="mt-2 text-sm text-gray-500">
                Modul <span className="font-semibold">{menu}</span> sedang dalam
                pengembangan.
            </p>
        </div>
    );
}

export default function ManajemenMenu({
    user,
    role = 'manajemen',
    menu = '',
    users = [],
    selectedRole = 'admin',
    logs = [],
}: ManajemenMenuProps) {
    const renderMenu = () => {
        switch (menu) {
            case 'users':
                return <UsersView users={users} selectedRole={selectedRole} />;
            case 'audit-logs':
                return <AuditLogsView logs={logs} />;
            default:
                return <FallbackView menu={menu} />;
        }
    };

    return (
        <Layout user={user} role={role}>
            {renderMenu()}
        </Layout>
    );
}
