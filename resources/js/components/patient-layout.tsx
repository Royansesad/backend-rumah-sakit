import { Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

interface PatientLayoutProps {
    children: React.ReactNode;
    user?: any;
}

const NAV_ITEMS = [
    { label: 'Beranda', route: '/portal' },
    { label: 'Rekam Medis', route: '/portal/rekam-medis' },
    { label: 'Riwayat Kunjungan', route: '/portal/riwayat' },
    { label: 'Booking Online', route: '/portal/booking' },
];

export const PatientLayout: React.FC<PatientLayoutProps> = ({ children, user: propUser }) => {
    const pageProps = usePage().props as any;
    const user = propUser || pageProps.user;
    const { url } = usePage();
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const flash = (pageProps.flash ?? {}) as { success?: string; error?: string };
    const userName = user?.nama_lengkap || 'Pasien';
    const nomorRm = user?.nomor_rekam_medis;

    const initials = userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f2f9f7] font-sans text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-[#dbe8e2] bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Link href="/portal" className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#145e5b] text-white shadow-xs">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <div className="font-serif text-base font-bold text-[#17524c]">
                                    RS Sentosa Medika
                                </div>
                                <div className="text-[11px] font-medium text-[#598c89]">
                                    Portal Pasien
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_ITEMS.map((item) => {
                            const isActive = url === item.route || (item.route !== '/portal' && url.startsWith(item.route));
                            return (
                                <Link
                                    key={item.route}
                                    href={item.route}
                                    className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
                                        isActive
                                            ? 'bg-[#e4f6f2] text-[#145e5b]'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#145e5b]'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right: user dropdown */}
                    <div className="relative flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="rounded-lg p-2 text-[#145e5b] hover:bg-[#e4f6f2] md:hidden"
                            aria-label="Menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#145e5b] text-[11px] font-bold text-white">
                                {initials}
                            </div>
                            <div className="hidden text-left sm:block">
                                <div className="max-w-[140px] truncate text-xs font-bold text-gray-900">{userName}</div>
                                <div className="text-[10px] font-medium text-gray-500">{nomorRm || 'Pasien'}</div>
                            </div>
                        </button>

                        {showUserDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                                <div className="border-b border-gray-100 px-4 py-2">
                                    <div className="truncate text-xs font-bold text-gray-900">{userName}</div>
                                    <div className="text-[10px] font-semibold text-[#145e5b]">{nomorRm || 'Pasien'}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Keluar / Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <nav className="border-t border-gray-100 bg-white px-4 py-2 md:hidden">
                        {NAV_ITEMS.map((item) => {
                            const isActive = url === item.route || (item.route !== '/portal' && url.startsWith(item.route));
                            return (
                                <Link
                                    key={item.route}
                                    href={item.route}
                                    onClick={() => setMobileOpen(false)}
                                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                                        isActive ? 'bg-[#e4f6f2] text-[#145e5b]' : 'text-gray-700'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </header>

            {/* Flash Message */}
            {(flash.success || flash.error) && (
                <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6">
                    <div
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
                            flash.success
                                ? 'border-[#a7d8cf] bg-[#e4f6f2] text-[#0f4a47]'
                                : 'border-[#fca5a5] bg-[#fde8e8] text-[#c53030]'
                        }`}
                    >
                        <span>{flash.success || flash.error}</span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#dbe8e2] bg-[#e2efe9]">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-gray-600 sm:flex-row sm:px-6">
                    <div className="font-serif text-sm font-bold text-[#17524c]">RS Sentosa Medika</div>
                    <div className="text-gray-500">© 2026 RS Sentosa Medika. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
};
