import { Link, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAppGrid, setShowAppGrid] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const appGridRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchDropdown(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
            if (appGridRef.current && !appGridRef.current.contains(e.target as Node)) {
                setShowAppGrid(false);
            }
            if (userRef.current && !userRef.current.contains(e.target as Node)) {
                setShowUserDropdown(false);
            }
        };

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSidebarOpen(false);
                setShowSearchDropdown(false);
                setShowNotifications(false);
                setShowAppGrid(false);
                setShowHelpModal(false);
                setShowUserDropdown(false);
            }
            // Hotkey '/' to focus search
            if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                e.preventDefault();
                const input = searchRef.current?.querySelector('input');
                if (input) input.focus();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', onKey);
        };
    }, []);

    const userName = user?.nama_lengkap || user?.name || (role === 'dokter' ? 'Dr. Budi Santoso' : role === 'perawat' ? 'Ns. Ani Yudhoyono' : 'Dr. Budi Santoso');
    const userRoleTitle = role === 'admin' ? 'Chief Admin' : role === 'dokter' ? 'Dokter Spesialis' : role === 'perawat' ? 'Perawat Utama' : role === 'manajemen' ? 'Direktur Operasional' : 'Hospital Staff';

    const searchablePages = [
        { title: 'Dashboard Utama', desc: 'Ringkasan operasional harian RS', url: '/dashboard', category: 'Navigasi' },
        { title: 'Pendaftaran Pasien', desc: 'Pendaftaran rawat jalan, inap & IGD', url: '/pendaftaran-pasien', category: 'Pasien' },
        { title: 'Manajemen Data Pasien', desc: 'Daftar rekam medis & riwayat pasien', url: '/pasien', category: 'Pasien' },
        { title: 'RME (Rekam Medis Elektronik)', desc: 'Diagnosis ICD-10 & SOAP dokter', url: '/rme', category: 'Medis' },
        { title: 'Hak Akses (RBAC)', desc: 'Pengaturan izin pengguna sistem', url: '/rbac', category: 'Admin' },
        { title: 'Audit Log & Keamanan', desc: 'Riwayat jejak aktivitas pengguna', url: '/audit-logs', category: 'Keamanan' },
        { title: 'Papan Antrian TV', desc: 'Tampilan antrian live poliklinik', url: '/papan-antrian', category: 'Layanan' },
    ];

    const filteredSearch = searchQuery.trim() === ''
        ? []
        : searchablePages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (filteredSearch.length > 0) {
            router.visit(filteredSearch[0].url);
            setShowSearchDropdown(false);
            setSearchQuery('');
        } else if (searchQuery.trim()) {
            router.visit(`/pasien?search=${encodeURIComponent(searchQuery)}`);
            setShowSearchDropdown(false);
        }
    };

    const notifications = [
        { id: 1, title: 'Stok Obat Menipis', desc: 'Paracetamol 500mg sisa 2 Box di Farmasi Pusat.', time: '10 mnt lalu', unread: true },
        { id: 2, title: 'Perubahan Jadwal Dokter', desc: 'Dr. Siti Nurhaliza menambahkan jadwal poli Gigi.', time: '45 mnt lalu', unread: true },
        { id: 3, title: 'Pasien IGD Masuk', desc: 'Pasien darurat NIK 3201*** membutuhkan penanganan.', time: '1 jam lalu', unread: false },
    ];

    const appModules = [
        { name: 'Dashboard', icon: 'fa-chart-pie', color: 'bg-teal-50 text-teal-700', url: '/dashboard' },
        { name: 'Pendaftaran', icon: 'fa-user-plus', color: 'bg-emerald-50 text-emerald-700', url: '/pendaftaran-pasien' },
        { name: 'Data Pasien', icon: 'fa-address-card', color: 'bg-blue-50 text-blue-700', url: '/pasien' },
        { name: 'RME & SOAP', icon: 'fa-stethoscope', color: 'bg-indigo-50 text-indigo-700', url: '/rme' },
        { name: 'Papan Antrian', icon: 'fa-tv', color: 'bg-amber-50 text-amber-700', url: '/papan-antrian' },
        { name: 'Audit Log', icon: 'fa-clock-rotate-left', color: 'bg-rose-50 text-rose-700', url: '/audit-logs' },
    ];

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
                        <div ref={searchRef} className="relative w-full">
                            <form onSubmit={handleSearchSubmit}>
                                <svg className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSearchDropdown(true);
                                    }}
                                    onFocus={() => setShowSearchDropdown(true)}
                                    placeholder="Search patients, staff, or records..."
                                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-12 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none transition-all"
                                />
                                <span className="absolute right-3 top-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-gray-200">
                                    /
                                </span>
                            </form>

                            {/* Search Results Dropdown */}
                            {showSearchDropdown && searchQuery.trim().length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-gray-200 bg-white p-2 shadow-xl z-50">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">
                                        Hasil Pencarian
                                    </div>
                                    {filteredSearch.length > 0 ? (
                                        filteredSearch.map((res, i) => (
                                            <Link
                                                key={i}
                                                href={res.url}
                                                onClick={() => {
                                                    setShowSearchDropdown(false);
                                                    setSearchQuery('');
                                                }}
                                                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-[#f0faf7] transition-colors"
                                            >
                                                <div>
                                                    <div className="font-semibold text-gray-800">{res.title}</div>
                                                    <div className="text-[11px] text-gray-400">{res.desc}</div>
                                                </div>
                                                <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                                                    {res.category}
                                                </span>
                                            </Link>
                                        ))
                                    ) : (
                                        <Link
                                            href={`/pasien?search=${encodeURIComponent(searchQuery)}`}
                                            onClick={() => setShowSearchDropdown(false)}
                                            className="block rounded-lg px-3 py-2 text-xs text-[#145e5b] hover:bg-[#f0faf7] font-medium"
                                        >
                                            🔍 Cari pasien &quot;{searchQuery}&quot; di Manajemen Pasien...
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right User, Notification, Help & Grid Icons */}
                    <div className="flex items-center gap-3 sm:gap-4 ml-4">
                        {/* Notification Bell with Badge & Popover */}
                        <div ref={notifRef} className="relative">
                            <button 
                                type="button"
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-[#145e5b] transition-colors"
                                aria-label="Notifikasi"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl z-50">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 px-1">
                                        <h4 className="text-xs font-bold text-gray-800">Notifikasi Sistem</h4>
                                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">2 Baru</span>
                                    </div>
                                    <div className="divide-y divide-gray-50 py-1 max-h-64 overflow-y-auto">
                                        {notifications.map((n) => (
                                            <div key={n.id} className={`p-2 rounded-lg text-xs transition-colors ${n.unread ? 'bg-teal-50/50' : 'hover:bg-gray-50'}`}>
                                                <div className="font-semibold text-gray-900">{n.title}</div>
                                                <div className="text-[11px] text-gray-500 mt-0.5">{n.desc}</div>
                                                <div className="text-[10px] text-teal-700 mt-1 font-medium">{n.time}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <Link
                                        href="/audit-logs"
                                        onClick={() => setShowNotifications(false)}
                                        className="block text-center text-xs font-semibold text-[#145e5b] pt-2 border-t border-gray-100 hover:underline"
                                    >
                                        Lihat Semua Audit & Log
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Help Circle Icon & Modal */}
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(true)}
                            className="hidden sm:flex rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-[#145e5b] transition-colors"
                            aria-label="Bantuan"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        {/* 9-dot Grid Icon & Module Switcher */}
                        <div ref={appGridRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setShowAppGrid(!showAppGrid)}
                                className="hidden sm:flex rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-[#145e5b] transition-colors"
                                aria-label="Menu Aplikasi"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 100 4 2 2 0 000-4zM5 8a2 2 0 100 4 2 2 0 000-4zM5 13a2 2 0 100 4 2 2 0 000-4zM10 3a2 2 0 100 4 2 2 0 000-4zM10 8a2 2 0 100 4 2 2 0 000-4zM10 13a2 2 0 100 4 2 2 0 000-4zM15 3a2 2 0 100 4 2 2 0 000-4zM15 8a2 2 0 100 4 2 2 0 000-4zM15 13a2 2 0 100 4 2 2 0 000-4z" />
                                </svg>
                            </button>

                            {showAppGrid && (
                                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl z-50">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pb-2">
                                        Modul Rumah Sakit
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {appModules.map((m, idx) => (
                                            <Link
                                                key={idx}
                                                href={m.url}
                                                onClick={() => setShowAppGrid(false)}
                                                className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-center group"
                                            >
                                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.color} mb-1.5 shadow-xs`}>
                                                    <i className={`fa-solid ${m.icon} text-sm`}></i>
                                                </div>
                                                <span className="text-[10px] font-semibold text-gray-700 group-hover:text-teal-800 leading-tight truncate w-full">
                                                    {m.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Avatar Section with Dropdown */}
                        <div ref={userRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200 hover:opacity-90 transition-opacity"
                            >
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
                            </button>

                            {showUserDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <div className="text-xs font-bold text-gray-900 truncate">{userName}</div>
                                        <div className="text-[10px] text-teal-700 font-semibold">{userRoleTitle}</div>
                                    </div>
                                    <Link
                                        href="/users"
                                        onClick={() => setShowUserDropdown(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                    >
                                        <i className="fa-solid fa-gear text-gray-400"></i> Pengaturan Akun
                                    </Link>
                                    <Link
                                        href="/rbac"
                                        onClick={() => setShowUserDropdown(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                    >
                                        <i className="fa-solid fa-shield-halved text-gray-400"></i> Izin Akses
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => router.post('/logout')}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-gray-100"
                                    >
                                        <i className="fa-solid fa-right-from-bracket"></i> Keluar / Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Help Modal */}
                {showHelpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="text-base font-bold text-gray-900 font-serif">
                                    Pusat Bantuan RS Sentosa Medika
                                </h3>
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="mt-4 space-y-3 text-xs text-gray-600">
                                <div className="rounded-xl bg-teal-50 p-3 text-teal-800">
                                    <p className="font-semibold">Hotline IT & SIMRS 24/7</p>
                                    <p className="mt-1">Ext: 104 / WhatsApp: +62 812-3456-7890</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Pintasan Keyboard:</p>
                                    <ul className="mt-1 space-y-1 list-disc list-inside text-gray-500">
                                        <li><kbd className="px-1 py-0.5 bg-gray-100 rounded border">/</kbd> - Fokus ke pencarian global</li>
                                        <li><kbd className="px-1 py-0.5 bg-gray-100 rounded border">Esc</kbd> - Tutup modal atau menu aktif</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowHelpModal(false)}
                                    className="rounded-xl bg-[#145e5b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f4a47]"
                                >
                                    Mengerti
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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

