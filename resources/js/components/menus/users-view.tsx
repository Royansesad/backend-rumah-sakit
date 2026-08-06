import { router } from '@inertiajs/react';
import React, { useState } from 'react';
import type { Role } from '../../types/simrs';
import { ROLE_LABELS } from '../../types/simrs';

interface UsersViewProps {
    users: any[];
    selectedRole?: string;
}

const ROLES_LIST = [
    'admin',
    'dokter',
    'perawat',
    'apoteker',
    'kasir',
    'resepsionis',
    'manajemen',
];

export const UsersView: React.FC<UsersViewProps> = ({
    users = [],
    selectedRole = 'admin',
}) => {
    const [activeTab, setActiveTab] = useState(selectedRole);

    const handleTab = (r: string) => {
        setActiveTab(r);
        router.get(
            '/users',
            { role: r },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Manajemen User Staff
                    </h1>
                    <p className="text-xs text-gray-500">
                        Kelola akun dan status hak akses petugas rumah sakit
                    </p>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
                {ROLES_LIST.map((r) => (
                    <button
                        key={r}
                        onClick={() => handleTab(r)}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase transition-all ${
                            activeTab === r
                                ? 'border border-primary bg-primary text-teal-950'
                                : 'border border-gray-200 bg-white text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        {ROLE_LABELS[r as Role] || r}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-[560px] text-left text-xs text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">Nama Lengkap</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">No HP</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-4 text-center text-gray-400"
                                >
                                    Tidak ada data.
                                </td>
                            </tr>
                        ) : (
                            users.map((u: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-4 font-semibold text-gray-900">
                                        {u.nama_lengkap}
                                    </td>
                                    <td className="p-4">{u.email}</td>
                                    <td className="p-4">{u.no_hp || '-'}</td>
                                    <td className="p-4">
                                        <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 uppercase">
                                            {u.status_akun || 'aktif'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};
