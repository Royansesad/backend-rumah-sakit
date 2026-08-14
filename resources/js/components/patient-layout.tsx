import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    CalendarCheck,
    Check,
    ChevronRight,
    ClipboardList,
    FolderHeart,
    Headphones,
    HelpCircle,
    History,
    Home,
    LogOut,
    MapPin,
    Menu,
    MessageCircle,
    Phone,
    Plus,
    QrCode,
    Settings,
    ShieldCheck,
    User as UserIcon,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface PatientLayoutProps {
    children: React.ReactNode;
    user?: any;
}

export const PatientLayout: React.FC<PatientLayoutProps> = ({
    children,
    user: propUser,
}) => {
    const pageProps = usePage().props as any;
    const user = propUser || pageProps.user || {};
    const { url } = usePage();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showNotificationPopover, setShowNotificationPopover] =
        useState(false);

    const flash = (pageProps.flash ?? {}) as {
        success?: string;
        error?: string;
    };
    const userName = user?.nama_lengkap || 'Siti Aminah';
    const nomorRm = user?.nomor_rekam_medis || 'RM-2026-0089';

    const initials = userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const navItems = [
        { label: 'Beranda', route: '/portal', icon: Home },
        { label: 'RME', route: '/portal/rekam-medis', icon: ClipboardList },
        { label: 'Riwayat Kunjungan', route: '/portal/riwayat', icon: History },
        {
            label: 'Booking Online',
            route: '/portal/booking',
            icon: CalendarCheck,
        },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-[#f3f8f6] font-sans text-slate-800 antialiased">
            {/* Mobile Header */}
            <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#d8e7e1] bg-white/95 px-4 backdrop-blur-md lg:hidden">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="rounded-lg p-2 text-[#145e5b] hover:bg-[#e7f4f1]"
                        aria-label="Buka Menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link href="/portal" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#145e5b] text-white shadow-xs">
                            <Plus className="h-5 w-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <div className="font-serif text-sm font-bold tracking-tight text-[#17524c]">
                                Sentosa Medika
                            </div>
                            <div className="text-[10px] font-medium text-[#598c89]">
                                Hospital Management
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/portal/booking"
                        className="rounded-full bg-[#e6f4f1] px-3 py-1 text-xs font-semibold text-[#145e5b] hover:bg-[#d6eae5]"
                    >
                        Buat Janji Temu
                    </Link>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#145e5b] text-xs font-bold text-white">
                        {initials}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-[#f0f6f4] p-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#d8e7e1] pb-4">
                            <Link
                                href="/portal"
                                className="flex items-center gap-3"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#145e5b] text-white shadow-xs">
                                    <Plus className="h-5 w-5 stroke-[2.5]" />
                                </div>
                                <div>
                                    <div className="font-serif text-base font-bold tracking-tight text-[#17524c]">
                                        Sentosa Medika
                                    </div>
                                    <div className="text-[11px] font-medium text-[#598c89]">
                                        Hospital Management
                                    </div>
                                </div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Navigation Items */}
                        <div className="mt-6 flex-1 space-y-1.5">
                            {navItems.map((item) => {
                                const isActive =
                                    item.route === '/portal'
                                        ? url === '/portal'
                                        : url.startsWith(item.route);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.route}
                                        href={item.route}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                                            isActive
                                                ? 'bg-[#cde8e1] font-bold text-[#145e5b] shadow-xs'
                                                : 'text-slate-600 hover:bg-[#e4efe9] hover:text-[#145e5b]'
                                        }`}
                                    >
                                        <Icon
                                            className={`h-5 w-5 ${isActive ? 'text-[#145e5b]' : 'text-slate-500'}`}
                                        />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Bottom Actions */}
                        <div className="space-y-3 border-t border-[#d8e7e1] pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileOpen(false);
                                    setShowHelpModal(true);
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#145e5b] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0f4a47]"
                            >
                                <HelpCircle className="h-4 w-4" />
                                <span>Bantuan 24/7</span>
                            </button>

                            <div className="space-y-1 pt-1 text-sm font-medium">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileOpen(false);
                                        setShowSettingsModal(true);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-[#e4efe9] hover:text-slate-900"
                                >
                                    <Settings className="h-4 w-4 text-slate-500" />
                                    <span>Pengaturan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Keluar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Layout (Fixed Sidebar + Main Content) */}
            <div className="flex min-h-screen">
                {/* Desktop Left Sidebar */}
                <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#dbe7e2] bg-[#f0f6f4] px-5 py-6 lg:flex">
                    {/* Header / Brand */}
                    <Link
                        href="/portal"
                        className="flex items-center gap-3 px-1"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#145e5b] text-white shadow-xs">
                            <Plus className="h-5 w-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <div className="font-serif text-[17px] font-bold tracking-tight text-[#17524c]">
                                Sentosa Medika
                            </div>
                            <div className="text-[11px] font-medium text-[#598c89]">
                                Hospital Management
                            </div>
                        </div>
                    </Link>

                    {/* Navigation Items */}
                    <nav className="mt-8 flex-1 space-y-1.5">
                        {navItems.map((item) => {
                            const isActive =
                                item.route === '/portal'
                                    ? url === '/portal'
                                    : url.startsWith(item.route);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.route}
                                    href={item.route}
                                    className={`flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                                        isActive
                                            ? 'bg-[#cde8e1] font-bold text-[#145e5b] shadow-xs'
                                            : 'text-slate-600 hover:bg-[#e4efe9] hover:text-[#145e5b]'
                                    }`}
                                >
                                    <Icon
                                        className={`h-4 w-4 ${isActive ? 'text-[#145e5b]' : 'text-slate-500'}`}
                                    />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Bottom */}
                    <div className="mt-auto space-y-3 pt-6">
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#145e5b] py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0f4a47] active:scale-[0.98]"
                        >
                            <HelpCircle className="h-4 w-4" />
                            <span>Bantuan 24/7</span>
                        </button>

                        <div className="space-y-1 border-t border-[#d8e7e1] pt-3 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setShowSettingsModal(true)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-[#e4efe9] hover:text-slate-900"
                            >
                                <Settings className="h-4 w-4 text-slate-500" />
                                <span>Pengaturan</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Keluar</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col lg:pl-64 print:pl-0 print:m-0">
                    {/* Desktop Top Header Bar */}
                    <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-[#e1ede8] bg-[#f3f8f6]/90 px-8 backdrop-blur-md lg:flex print:hidden">
                        <div className="text-xs font-medium text-slate-500">
                            Portal Pasien <span className="mx-1.5">•</span> RS
                            Sentosa Medika
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/portal/booking"
                                className="rounded-full bg-[#dbeef0] px-4 py-1.5 text-xs font-bold text-[#145e5b] transition-colors hover:bg-[#cee8ea]"
                            >
                                Buat Janji Temu
                            </Link>

                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNotificationPopover(
                                            !showNotificationPopover,
                                        )
                                    }
                                    className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-xs ring-1 ring-slate-200/60 hover:bg-slate-50"
                                    title="Notifikasi & Reminder"
                                >
                                    <Bell className="h-4 w-4" />
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
                                </button>

                                {showNotificationPopover && (
                                    <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <span className="text-xs font-bold text-slate-900">
                                                Notifikasi Terkini
                                            </span>
                                            <span className="text-[10px] font-semibold text-teal-600">
                                                2 Baru
                                            </span>
                                        </div>
                                        <div className="mt-3 space-y-2.5 text-xs">
                                            <div className="flex items-start gap-2.5 rounded-xl bg-teal-50/70 p-2.5">
                                                <div className="mt-0.5 rounded-full bg-teal-600 p-1 text-white">
                                                    <Bell className="h-3 w-3" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-teal-900">
                                                        Reminder Minum Obat
                                                    </p>
                                                    <p className="text-[11px] text-teal-700">
                                                        Aspirin 100mg - 07.00
                                                        Pagi
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5">
                                                <div className="mt-0.5 rounded-full bg-emerald-600 p-1 text-white">
                                                    <CalendarCheck className="h-3 w-3" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">
                                                        Booking Terkonfirmasi
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        dr. Ahmad Fauzi, Sp.PD
                                                        di Poli Penyakit Dalam
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Help Icon */}
                            <button
                                type="button"
                                onClick={() => setShowHelpModal(true)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-xs ring-1 ring-slate-200/60 hover:bg-slate-50"
                                title="Bantuan & Panduan"
                            >
                                <HelpCircle className="h-4 w-4" />
                            </button>

                            {/* User Avatar Circle & Dropdown */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowUserDropdown(!showUserDropdown)
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ccd8f0] text-xs font-bold text-[#2d4b82] shadow-xs ring-2 ring-white transition-transform hover:scale-105"
                                >
                                    {initials}
                                </button>

                                {showUserDropdown && (
                                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl ring-1 ring-black/5">
                                        <div className="border-b border-slate-100 px-4 py-2.5">
                                            <div className="truncate text-xs font-bold text-slate-900">
                                                {userName}
                                            </div>
                                            <div className="text-[10px] font-semibold text-[#145e5b]">
                                                No. RM: {nomorRm}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUserDropdown(false);
                                                setShowSettingsModal(true);
                                            }}
                                            className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                        >
                                            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                                            Profil & Pengaturan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                                        >
                                            <LogOut className="h-3.5 w-3.5" />
                                            Keluar / Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Flash Message */}
                    {(flash.success || flash.error) && (
                        <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:px-8">
                            <div
                                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xs ${
                                    flash.success
                                        ? 'border-[#a7d8cf] bg-[#e4f6f2] text-[#0f4a47]'
                                        : 'border-[#fca5a5] bg-[#fde8e8] text-[#c53030]'
                                }`}
                            >
                                {flash.success ? (
                                    <ShieldCheck className="h-5 w-5 shrink-0 text-teal-600" />
                                ) : (
                                    <HelpCircle className="h-5 w-5 shrink-0 text-rose-600" />
                                )}
                                <span>{flash.success || flash.error}</span>
                            </div>
                        </div>
                    )}

                    {/* Main Content Body */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0">
                        <div className="mx-auto max-w-6xl print:max-w-none print:w-full print:m-0 print:p-0">{children}</div>
                    </main>
                </div>
            </div>

            {/* Modal Bantuan 24/7 */}
            {showHelpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowHelpModal(false)}
                    />
                    <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <Headphones className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Bantuan & Layanan Darurat 24/7
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        RS Sentosa Medika siap melayani Anda
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowHelpModal(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-rose-900">
                                            IGD & Ambulans Darurat
                                        </div>
                                        <div className="text-rose-700">
                                            (021) 555-0199 / 119
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href="tel:0215550199"
                                    className="rounded-xl bg-rose-600 px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-rose-700"
                                >
                                    Panggil
                                </a>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                                        <MessageCircle className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-teal-900">
                                            WhatsApp Customer Care
                                        </div>
                                        <div className="text-teal-700">
                                            0812-3456-7890 (24 Jam)
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href="https://wa.me/6281234567890?text=Halo%20RS%20Sentosa%20Medika,%20saya%20membutuhkan%20informasi%20layanan"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-xl bg-[#145e5b] px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-[#0f4a47]"
                                >
                                    Chat WA
                                </a>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <div className="font-bold text-slate-800">
                                    Lokasi Rumah Sakit
                                </div>
                                <p className="mt-1 leading-relaxed text-slate-600">
                                    Jl. Jenderal Sudirman No. 45, Jakarta
                                    Selatan. Buka 24 Jam setiap hari.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setShowHelpModal(false)}
                                className="w-full rounded-xl bg-slate-100 py-2.5 font-bold text-slate-700 hover:bg-slate-200"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Pengaturan Sederhana */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowSettingsModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Pengaturan Akun Pasien
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Informasi kredensial dan preferensi
                                        portal
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSettingsModal(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3 text-xs">
                            <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Nama Lengkap
                                    </span>
                                    <span className="font-bold text-slate-800">
                                        {userName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Nomor Rekam Medis
                                    </span>
                                    <span className="font-bold text-[#145e5b]">
                                        {nomorRm}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Email Akun
                                    </span>
                                    <span className="font-bold text-slate-800">
                                        {user?.email ||
                                            'pasien@sentosamedika.id'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-500">
                                Untuk mengubah data kontak, alamat, atau alergi
                                medis, Anda dapat menggunakan tombol{' '}
                                <strong>Edit Profil</strong> pada panel Profil
                                Kesehatan di beranda.
                            </p>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowSettingsModal(false)}
                                className="w-full rounded-xl bg-[#145e5b] py-2.5 font-bold text-white hover:bg-[#0f4a47]"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
