import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import type { Role } from '../types/simrs';
import { ROLE_LABELS } from '../types/simrs';
import { Sidebar } from './sidebar';

interface LayoutProps {
    children: React.ReactNode;
    user?: any;
    role?: Role;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    user,
    role = 'admin',
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const unlisten = router.on('start', () => setSidebarOpen(false));

        return unlisten;
    }, []);

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

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-900">
            <Sidebar
                currentRole={role}
                user={user}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="-ml-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                            aria-label="Buka menu navigasi"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                        <span className="font-bold text-gray-900">
                            SIMRS Portal
                        </span>
                    </div>
                    <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold whitespace-nowrap text-teal-950 uppercase">
                        {ROLE_LABELS[role]}
                    </span>
                </header>

                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
