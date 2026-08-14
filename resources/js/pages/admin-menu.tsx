import React from 'react';
import { AuditLogsView } from '../components/menus/audit-logs-view';
import { UsersView } from '../components/menus/users-view';
import { RbacView } from '../components/menus/rbac-view';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';

interface AdminMenuProps {
    user: any;
    role: Role;
    menu: string;
    users?: any[];
    selectedRole?: string;
    logs?: any;
    filters?: any;
    aksiOptions?: string[];
    roleOptions?: string[];
    staffList?: string[];
    staffByRole?: Record<
        string,
        Array<{ id: string; nama_lengkap: string; email?: string }>
    >;
    lastUpdatedInfo?: string;
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

export default function AdminMenu({
    user,
    role = 'admin',
    menu = '',
    users = [],
    selectedRole = 'admin',
    logs,
    filters,
    aksiOptions,
    roleOptions,
    staffList,
    staffByRole,
    lastUpdatedInfo,
}: AdminMenuProps) {
    const renderMenu = () => {
        switch (menu) {
            case 'users':
                return <UsersView users={users} selectedRole={selectedRole} />;
            case 'audit-logs':
                return (
                    <AuditLogsView
                        logs={logs || []}
                        filters={filters}
                        aksiOptions={aksiOptions}
                        roleOptions={roleOptions}
                    />
                );
            case 'rbac':
                return (
                    <RbacView
                        staffList={staffList}
                        staffByRole={staffByRole}
                        initialRole={
                            selectedRole === 'admin' ? 'dokter' : selectedRole
                        }
                        lastUpdatedInfo={lastUpdatedInfo}
                    />
                );
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
