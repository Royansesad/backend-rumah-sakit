import React from 'react';
import { AuditLogsView } from '../components/menus/audit-logs-view';
import { UsersView } from '../components/menus/users-view';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';
import { ROLE_LABELS } from '../types/simrs';

interface AdminMenuProps {
    user: any;
    role: Role;
    menu: string;
    users?: any[];
    selectedRole?: string;
    logs?: any[];
}

const ROLES: Role[] = [
    'admin',
    'dokter',
    'perawat',
    'apoteker',
    'kasir',
    'resepsionis',
    'manajemen',
    'pasien',
];

const MODULES = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'user_management', label: 'Manajemen User' },
    { key: 'patient_management', label: 'Manajemen Pasien' },
    { key: 'medical_records', label: 'Rekam Medis' },
    { key: 'pharmacy', label: 'Farmasi' },
    { key: 'billing', label: 'Billing & Kasir' },
    { key: 'registration', label: 'Pendaftaran' },
    { key: 'reports', label: 'Laporan' },
    { key: 'audit_log', label: 'Audit Log' },
];

function RbacView() {
    return (
        <>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Matriks Hak Akses (RBAC)
                </h1>
                <p className="text-xs text-gray-500">
                    Konfigurasi izin modul berdasarkan peran pengguna
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                        <tr>
                            <th className="sticky left-0 min-w-[160px] bg-gray-50 p-4">
                                Modul
                            </th>
                            {ROLES.map((r) => (
                                <th
                                    key={r}
                                    className="min-w-[100px] p-4 text-center text-primary-deep"
                                >
                                    {ROLE_LABELS[r]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MODULES.map((m) => (
                            <tr key={m.key} className="hover:bg-gray-50">
                                <td className="sticky left-0 bg-white p-4 font-semibold text-gray-900">
                                    {m.label}
                                </td>
                                {ROLES.map((r) => {
                                    const allowed =
                                        r === 'admin' ||
                                        (r === 'dokter' &&
                                            [
                                                'dashboard',
                                                'patient_management',
                                                'medical_records',
                                            ].includes(m.key)) ||
                                        (r === 'perawat' &&
                                            [
                                                'dashboard',
                                                'medical_records',
                                            ].includes(m.key)) ||
                                        (r === 'apoteker' &&
                                            ['dashboard', 'pharmacy'].includes(
                                                m.key,
                                            )) ||
                                        (r === 'kasir' &&
                                            ['dashboard', 'billing'].includes(
                                                m.key,
                                            )) ||
                                        (r === 'resepsionis' &&
                                            [
                                                'dashboard',
                                                'registration',
                                            ].includes(m.key)) ||
                                        (r === 'manajemen' &&
                                            [
                                                'dashboard',
                                                'reports',
                                                'audit_log',
                                            ].includes(m.key));

                                    return (
                                        <td key={r} className="p-4 text-center">
                                            <span
                                                className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                                    allowed
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-red-50 text-red-400'
                                                }`}
                                            >
                                                {allowed ? 'Akses' : 'Tidak'}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
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
    logs = [],
}: AdminMenuProps) {
    const renderMenu = () => {
        switch (menu) {
            case 'users':
                return <UsersView users={users} selectedRole={selectedRole} />;
            case 'audit-logs':
                return <AuditLogsView logs={logs} />;
            case 'rbac':
                return <RbacView />;
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
