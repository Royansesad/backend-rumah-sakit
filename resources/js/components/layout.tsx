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
    title = 'Medical Portal',
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
                {/* Top Navbar Header (Matching Gambar 2 & 3 100%) */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#d3ece7] bg-[#f0faf7] px-6">
                    <div className="flex items-center gap-3">
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

                        <h2 className="text-lg font-bold text-[#145e5b] font-serif tracking-tight">
                            {title}
                        </h2>
                    </div>

                    {/* Right User & Notification Area */}
                    <div className="flex items-center gap-4">
                        {/* Notification Bell with Red Badge */}
                        <div className="relative cursor-pointer p-1 text-[#4f8380] hover:text-[#145e5b]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-[#f0faf7]"></span>
                        </div>

                        {/* User Profile Avatar Frame */}
                        <div className="flex items-center gap-2.5 border-l border-[#d3ece7] pl-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7f2ee] text-[#145e5b] font-bold text-sm ring-2 ring-[#b5e2db] shadow-xs overflow-hidden">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden sm:inline-block text-xs font-semibold text-[#145e5b]">
                                {userName}
                            </span>
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
