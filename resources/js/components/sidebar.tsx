import { Link, router } from '@inertiajs/react';
import React from 'react';
import type { Role } from '../types/simrs';
import { ROLE_LABELS } from '../types/simrs';

interface SidebarProps {
    currentRole: Role;
    user?: any;
    open?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentRole,
    user,
    open = false,
    onClose,
}) => {
    const accentColor = '#00faf2';
    const roleLabel = ROLE_LABELS[currentRole] || 'User';

    const menuItems = [
        {
            label: 'Dashboard',
            icon: 'DB',
            route: '/dashboard',
            roles: [
                'admin',
                'dokter',
                'perawat',
                'apoteker',
                'kasir',
                'resepsionis',
                'manajemen',
                'pasien',
            ],
        },
        {
            label: 'Manajemen User',
            icon: 'MU',
            route: '/users',
            roles: ['admin', 'manajemen'],
        },
        {
            label: 'Data Pasien',
            icon: 'DP',
            route: '/pasien',
            roles: [
                'admin',
                'dokter',
                'perawat',
                'apoteker',
                'kasir',
                'resepsionis',
                'manajemen',
            ],
        },
        {
            label: 'Hak Akses (RBAC)',
            icon: 'HA',
            route: '/rbac',
            roles: ['admin'],
        },
        {
            label: 'Audit Log',
            icon: 'AL',
            route: '/audit-logs',
            roles: ['admin', 'manajemen'],
        },
    ];

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900/40 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 md:transition-none ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    <div className="flex items-center justify-between border-b border-gray-100 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-teal-950">
                                RS
                            </div>
                            <div>
                                <h1 className="text-lg leading-none font-bold text-gray-900">
                                    SIMRS Portal
                                </h1>
                                <p className="mt-1 text-xs text-gray-500">
                                    Sistem Manajemen RS
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="-mr-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden"
                            aria-label="Tutup menu"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="mx-4 my-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-teal-950 shadow-sm"
                            style={{ backgroundColor: accentColor }}
                        >
                            {user?.nama_lengkap?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 overflow-hidden">
                            <h2 className="truncate text-sm font-semibold text-gray-900">
                                {user?.nama_lengkap || 'Pengguna'}
                            </h2>
                            <span
                                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-teal-950 uppercase"
                                style={{ backgroundColor: accentColor }}
                            >
                                {roleLabel}
                            </span>
                        </div>
                    </div>

                    <nav className="mt-2 space-y-1 px-3">
                        {menuItems
                            .filter((item) => item.roles.includes(currentRole))
                            .map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.route}
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-primary/30 hover:text-teal-900"
                                >
                                    <span className="w-6 text-center text-xs font-bold">
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                    </nav>
                </div>

                <div className="mt-auto border-t border-gray-200 p-4">
                    <form onSubmit={handleLogout}>
                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/20 px-4 py-2.5 text-sm font-medium text-teal-800 transition-all hover:bg-primary/40"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
};
