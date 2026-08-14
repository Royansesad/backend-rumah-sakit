import { Link, router, usePage } from '@inertiajs/react';
import React from 'react';
import type { Role } from '../types/simrs';

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
    const { url } = usePage();

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    const menuItems = [
        {
            label: 'Dashboard',
            icon: (
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
                        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                </svg>
            ),
            route: '/dashboard',
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
            label: 'Pendaftaran Pasien',
            icon: (
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            ),
            route: '/pendaftaran-pasien',
            roles: ['admin', 'resepsionis', 'perawat', 'manajemen'],
        },
        {
            label: 'Manajemen Pasien',
            icon: (
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
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                </svg>
            ),
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
            label: 'Jadwal Dokter (Admin)',
            icon: (
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
            ),
            route: '/jadwal-dokter-admin',
            roles: ['admin', 'manajemen'],
        },
        {
            label: 'Jadwal Praktik',
            icon: (
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
            route: '/jadwal-praktik',
            roles: ['dokter', 'admin'],
        },
        {
            label: 'Jadwal Shift',
            icon: (
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
            route: '/jadwal-shift',
            roles: ['perawat', 'admin'],
        },
        {
            label: 'Manajemen Antrian',
            icon: (
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            ),
            route: '/manajemen-antrian',
            roles: ['admin', 'resepsionis', 'dokter', 'perawat'],
        },
        {
            label: 'RME',
            icon: (
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
                        d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
            ),
            route: '/rme',
            roles: ['admin', 'dokter', 'perawat', 'apoteker'],
        },
        {
            label: 'Rawat Inap & Bed',
            icon: (
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            ),
            route: '/rawat-inap',
            roles: ['admin', 'dokter', 'perawat', 'resepsionis', 'manajemen'],
        },
        {
            label: 'Manajemen Inventaris',
            icon: (
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
            ),
            route: '/inventaris',
            roles: ['admin', 'manajemen', 'apoteker'],
        },
        {
            label: 'Manajemen Aset',
            icon: (
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                </svg>
            ),
            route: '/aset',
            roles: ['admin', 'manajemen'],
        },
        {
            label: 'Papan Antrian TV',
            icon: (
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
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
            ),
            route: '/papan-antrian',
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
            label: 'Hak Akses',
            icon: (
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            ),
            route: '/rbac',
            roles: ['admin'],
        },
        {
            label: 'Audit Log',
            icon: (
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
            route: '/audit-logs',
            roles: ['admin', 'manajemen'],
        },
    ];

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
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#d3ece7] bg-[#f0faf7] transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 md:transition-none ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-1 flex-col overflow-y-auto">
                    {/* Header Brand Logo (Matching Gambar 1) */}
                    <div className="flex items-center gap-3 p-6">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#145e5b] text-white shadow-xs">
                            <svg
                                className="h-6 w-6 fill-current"
                                viewBox="0 0 24 24"
                            >
                                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate font-serif text-base leading-tight font-bold text-[#145e5b]">
                                Sentosa Medika
                            </h1>
                            <p className="text-[11px] leading-none font-medium text-[#4f8380]">
                                Hospital Management
                            </p>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="mt-4 space-y-1 px-3">
                        {menuItems
                            .filter((item) => item.roles.includes(currentRole))
                            .map((item, idx) => {
                                const isActive = url.startsWith(item.route);

                                return (
                                    <Link
                                        key={idx}
                                        href={item.route}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                                            isActive
                                                ? 'bg-[#d7f2ee] text-[#145e5b] shadow-xs'
                                                : 'text-[#4f8380] hover:bg-[#e4f6f2] hover:text-[#145e5b]'
                                        }`}
                                    >
                                        <span
                                            className={
                                                isActive
                                                    ? 'text-[#145e5b]'
                                                    : 'text-[#598c89]'
                                            }
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="truncate">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                    </nav>
                </div>

                {/* Bottom Section with + New Admission button */}
                <div className="space-y-3 border-t border-[#e1f3ef] p-4">
                    <Link
                        href="/pendaftaran-pasien"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#145e5b] py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0f4a47]"
                    >
                        + New Admission
                    </Link>

                    <div className="space-y-1">
                        <Link
                            href="/settings"
                            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#4f8380] hover:bg-[#e4f6f2] hover:text-[#145e5b]"
                        >
                            <svg
                                className="h-4 w-4 text-[#598c89]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            Settings
                        </Link>

                        <form onSubmit={handleLogout}>
                            <button
                                type="submit"
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#4f8380] hover:bg-rose-50 hover:text-rose-700"
                            >
                                <svg
                                    className="h-4 w-4 text-[#598c89]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </aside>
        </>
    );
};
