import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import type { Role } from '../types/simrs';
import { Sidebar } from './sidebar';

interface LayoutProps {
    children: React.ReactNode;
    user?: any;
    role?: Role;
    title?: string;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    user,
    role = 'admin',
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!sidebarOpen) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [sidebarOpen]);

    const userName = user?.nama_lengkap || user?.name || (role === 'dokter' ? 'Dr. Budi Santoso' : role === 'perawat' ? 'Ns. Ani Yudhoyono' : 'Dr. Budi Santoso');
    const userRoleTitle = role === 'admin' ? 'Chief Admin' : role === 'dokter' ? 'Dokter Spesialis' : role === 'perawat' ? 'Perawat Utama' : role === 'manajemen' ? 'Direktur Operasional' : 'Hospital Staff';

    return (
        <div className="flex min-h-screen bg-[#f7fcfb] font-sans text-gray-900">
            {/* Sidebar Component */}
            <Sidebar
                currentRole={role}
                user={user}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Top Navbar Header (Exact match to design mockup) */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-white px-6">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="-ml-2 rounded-lg p-2 text-[#145e5b] hover:bg-[#e4f6f2] md:hidden"
                            aria-label="Buka menu navigasi"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Global Search Input with Exact Design Placeholder */}
                        <div className="relative w-full">
                            <svg className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search patients, staff, or records..."
                                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Right User, Notification, Help & Grid Icons */}
                    <div className="flex items-center gap-3 sm:gap-4 ml-4">
                        {/* Notification Bell with Badge */}
                        <button 
                            type="button"
                            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-[#145e5b] transition-colors"
                            aria-label="Notifikasi"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>

                        {/* Help Circle Icon */}
                        <button
                            type="button"
                            className="hidden sm:flex rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-[#145e5b] transition-colors"
                            aria-label="Bantuan"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        {/* 9-dot Grid Icon */}
                        <button
                            type="button"
                            className="hidden sm:flex rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-[#145e5b] transition-colors"
                            aria-label="Menu Aplikasi"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 100 4 2 2 0 000-4zM5 8a2 2 0 100 4 2 2 0 000-4zM5 13a2 2 0 100 4 2 2 0 000-4zM10 3a2 2 0 100 4 2 2 0 000-4zM10 8a2 2 0 100 4 2 2 0 000-4zM10 13a2 2 0 100 4 2 2 0 000-4zM15 3a2 2 0 100 4 2 2 0 000-4zM15 8a2 2 0 100 4 2 2 0 000-4zM15 13a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                        </button>

                        {/* User Profile Avatar Section */}
                        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#145e5b] text-white font-bold text-xs shadow-xs overflow-hidden">
                                {userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="hidden md:block text-left">
                                <div className="text-xs font-bold text-gray-900 leading-tight">
                                    {userName}
                                </div>
                                <div className="text-[10px] font-medium text-gray-500">
                                    {userRoleTitle}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content View */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
