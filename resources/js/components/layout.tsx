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

    const userName = user?.nama_lengkap || user?.name || (role === 'dokter' ? 'Dr. Aris Setiawan' : role === 'perawat' ? 'Siti N.' : 'Admin Panel');

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
                {/* Top Navbar Header (Matching Gambar 1, 2, 3) */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#d3ece7] bg-[#f0faf7] px-6">
                    <div className="flex items-center gap-6">
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

                        <h2 className="text-xl font-bold text-[#145e5b] font-serif tracking-tight">
                            MediCare Admin
                        </h2>

                        {/* Top Nav Tabs */}
                        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
                            <Link href="/dashboard" className="text-gray-500 hover:text-[#145e5b] transition">
                                Home
                            </Link>
                            <Link href="/pasien" className="relative py-4 text-[#145e5b] font-bold border-b-2 border-[#145e5b]">
                                Patients
                            </Link>
                        </nav>
                    </div>

                    {/* Right User, Search & Notification Area */}
                    <div className="flex items-center gap-4">
                        {/* Global Search Input */}
                        <div className="relative hidden md:block w-64">
                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Global Search..."
                                className="w-full rounded-lg border border-[#c3e5df] bg-white pl-9 pr-3 py-1.5 text-xs text-gray-800 focus:border-[#145e5b] focus:outline-none"
                            />
                        </div>

                        {/* Notification Bell */}
                        <div className="relative cursor-pointer p-1 text-[#4f8380] hover:text-[#145e5b] transition">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal-600"></span>
                        </div>

                        {/* Settings Icon */}
                        <Link href="/settings" className="p-1 text-[#4f8380] hover:text-[#145e5b] transition">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>

                        {/* User Profile Avatar Frame */}
                        <div className="flex items-center gap-2 border-l border-[#d3ece7] pl-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#145e5b] text-white font-bold text-xs shadow-xs overflow-hidden">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content View */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
