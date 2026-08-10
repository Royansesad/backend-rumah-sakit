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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
            route: '/dashboard',
            roles: ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis', 'manajemen', 'pasien'],
        },
        {
            label: 'Jadwal Praktik',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            route: '/jadwal-praktik',
            roles: ['dokter', 'admin'],
        },
        {
            label: 'Jadwal Shift',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            route: '/jadwal-shift',
            roles: ['perawat', 'admin'],
        },
        {
            label: 'Jadwal Dokter (Admin)',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            route: '/jadwal-dokter-admin',
            roles: ['admin'],
        },
        {
            label: 'Daftar Pasien',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            route: '/pasien',
            roles: ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis', 'manajemen'],
        },
        {
            label: 'Pendaftaran Pasien',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            route: '/pendaftaran-pasien',
            roles: ['admin', 'dokter', 'perawat', 'resepsionis', 'manajemen'],
        },
        {
            label: 'Catatan Perawatan / RME',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            route: '/rme',
            roles: ['admin', 'dokter', 'perawat', 'apoteker'],
        },
        {
            label: 'Papan Antrian TV',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            route: '/papan-antrian',
            roles: ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis', 'manajemen', 'pasien'],
        },
        {
            label: 'Manajemen User',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            route: '/users',
            roles: ['admin', 'manajemen'],
        },
        {
            label: 'Hak Akses (RBAC)',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            ),
            route: '/rbac',
            roles: ['admin'],
        },
        {
            label: 'Audit Log',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <div className="flex flex-col flex-1 overflow-y-auto">
                    {/* Header Brand Logo (Matching Gambar 1) */}
                    <div className="flex items-center gap-3 p-6 border-b border-[#e1f3ef]">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#145e5b] text-white shadow-xs">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base font-bold text-[#145e5b] font-serif leading-tight truncate">
                                Sentosa Medika
                            </h1>
                            <p className="text-[11px] text-[#4f8380] font-medium leading-none">
                                Hospital Management
                            </p>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="mt-4 px-3 space-y-1">
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
                                        <span className={isActive ? 'text-[#145e5b]' : 'text-[#598c89]'}>
                                            {item.icon}
                                        </span>
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                );
                            })}
                    </nav>
                </div>

                {/* Bottom Section with + New Admission button */}
                <div className="p-4 border-t border-[#e1f3ef] space-y-3">
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
                            <svg className="w-4 h-4 text-[#598c89]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </Link>

                        <form onSubmit={handleLogout}>
                            <button
                                type="submit"
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#4f8380] hover:bg-rose-50 hover:text-rose-700"
                            >
                                <svg className="w-4 h-4 text-[#598c89]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
