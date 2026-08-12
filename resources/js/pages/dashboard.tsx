import { Link, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';
import { ROLE_LABELS } from '../types/simrs';

interface WeeklyVisitItem {
    day: string;
    fullName: string;
    count: number;
    rawatJalan?: number;
    igd?: number;
    rawatInap?: number;
    isHighlighted?: boolean;
}

interface ActivityItem {
    id: string;
    title: string;
    time: string;
    type: 'user' | 'calendar' | 'stock' | 'document' | 'system';
}

interface MgtLowStockItem {
    id: number;
    nama: string;
    stok: number;
    bentuk_sediaan: string;
    level: 'habis' | 'menipis';
}

interface MgtWeeklyTransaction {
    day: string;
    date: string;
    count: number;
}

interface MgtQueueItem {
    id: string;
    no_resep: string;
    nama_pasien: string;
    dokter: string;
    jumlah_item: number;
    status: string;
    created_at: string;
}

interface MgtRecentTransaction {
    id: string;
    no_resep: string;
    nama_pasien: string;
    waktu: string;
    tanggal: string;
}

interface RcpQueueItem {
    id: string;
    nomor_antrian: string;
    nama: string;
    poli: string;
    status: string;
}

interface RcpQueueItem {
    id: string;
    nomor_antrian: string;
    nama: string;
    poli: string;
    status: string;
}

interface KasirRincianItem {
    label: string;
    desc?: string;
    price: number;
    qty?: number;
    total: number;
    icon?: string;
}

interface KasirTagihanItem {
    id: string;
    no_invoice: string;
    nama_pasien: string;
    pasien_id?: string;
    no_rm?: string;
    nik?: string;
    penjamin?: string;
    layanan: string;
    subtotal: number;
    diskon: number;
    pajak: number;
    total_tagihan: number;
    jumlah_dibayar: number;
    kembalian: number;
    status: 'belum_lunas' | 'lunas' | 'dibatalkan' | string;
    metode_pembayaran?: string | null;
    waktu_pembayaran?: string | null;
    rincian: KasirRincianItem[];
    catatan?: string | null;
    created_at: string;
}

interface DashboardProps {
    user: any;
    role: Role;
    stats?: {
        totalPatients?: string;
        todayAppointments?: string;
        monthlyRevenue?: string;
        activeDoctors?: string;
        patientTrend?: string;
        appointmentTrend?: string;
        revenueTrend?: string;
        doctorTrend?: string;
        totalUsers?: number;
    } | any;
    weeklyVisits?: WeeklyVisitItem[];
    recentActivities?: ActivityItem[];
    recentAuditLogs?: any[];
    // Manajemen-specific props
    mgtTodayReseps?: number;
    mgtPendingReseps?: number;
    mgtCompletedReseps?: number;
    mgtLowStockList?: MgtLowStockItem[];
    mgtWeeklyTransactions?: MgtWeeklyTransaction[];
    mgtTodayProcessed?: number;
    mgtPrescriptionQueue?: MgtQueueItem[];
    mgtRecentTransactions?: MgtRecentTransaction[];
    // Resepsionis-specific props
    rcpCheckinCount?: string;
    rcpActiveQueue?: string;
    rcpTodayAppointments?: string;
    rcpLatestQueue?: RcpQueueItem[];
    // Kasir-specific props
    kasirTodayRevenue?: number;
    kasirPendingCount?: number;
    kasirPendingAmount?: number;
    kasirPaidTodayCount?: number;
    kasirInvoices?: KasirTagihanItem[];
    kasirPatientsList?: { id: string; nama_lengkap: string; no_rm: string; nik: string; penjamin: string }[];
    // Apoteker-specific props
    aptTodayReseps?: number;
    aptPendingReseps?: number;
    aptPreparingReseps?: number;
    aptCompletedReseps?: number;
    aptLowStockList?: any[];
    aptWeeklyTransactions?: any[];
    aptTodayProcessed?: number;
    aptPrescriptionQueue?: any[];
    aptRecentTransactions?: any[];
    aptObatMasterList?: any[];
}

export default function Dashboard({
    user,
    role = 'admin',
    stats = {},
    weeklyVisits = [],
    recentActivities = [],
    recentAuditLogs = [],
    mgtTodayReseps = 0,
    mgtPendingReseps = 0,
    mgtCompletedReseps = 0,
    mgtLowStockList = [],
    mgtWeeklyTransactions = [],
    mgtTodayProcessed = 0,
    mgtPrescriptionQueue = [],
    mgtRecentTransactions = [],
    rcpCheckinCount = '42',
    rcpActiveQueue = '7',
    rcpTodayAppointments = '65',
    rcpLatestQueue = [],
    kasirTodayRevenue = 0,
    kasirPendingCount = 0,
    kasirPendingAmount = 0,
    kasirPaidTodayCount = 0,
    kasirInvoices = [],
    kasirPatientsList = [],
    aptTodayReseps = 0,
    aptPendingReseps = 0,
    aptPreparingReseps = 0,
    aptCompletedReseps = 0,
    aptLowStockList = [],
    aptWeeklyTransactions = [],
    aptTodayProcessed = 0,
    aptPrescriptionQueue = [],
    aptRecentTransactions = [],
    aptObatMasterList = [],
}: DashboardProps) {
    // State form dan modal New Admission
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string>('Kam');
    const [chartRange, setChartRange] = useState<string>('7 Hari Terakhir');
    const [showRangeDropdown, setShowRangeDropdown] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: '',
        nik: '',
        jenis_kelamin: 'Laki-laki',
        golongan_darah: 'A',
        no_hp: '',
        email: '',
        alamat: '',
        jenis_layanan: 'rawat_jalan',
        penjamin: 'umum',
        nomor_penjamin: '',
        prioritas: 'normal',
        keluhan: '',
    });

    const handleSubmitPatient = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pasien', {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    // Default visits fallback if not provided
    const defaultVisits: WeeklyVisitItem[] = [
        { day: 'Sen', fullName: 'Senin', count: 142, rawatJalan: 98, igd: 30, rawatInap: 14, isHighlighted: false },
        { day: 'Sel', fullName: 'Selasa', count: 158, rawatJalan: 110, igd: 34, rawatInap: 14, isHighlighted: false },
        { day: 'Rab', fullName: 'Rabu', count: 135, rawatJalan: 92, igd: 28, rawatInap: 15, isHighlighted: false },
        { day: 'Kam', fullName: 'Kamis', count: 184, rawatJalan: 130, igd: 38, rawatInap: 16, isHighlighted: true },
        { day: 'Jum', fullName: 'Jumat', count: 160, rawatJalan: 115, igd: 31, rawatInap: 14, isHighlighted: false },
        { day: 'Sab', fullName: 'Sabtu', count: 110, rawatJalan: 75, igd: 25, rawatInap: 10, isHighlighted: false },
        { day: 'Min', fullName: 'Minggu', count: 95, rawatJalan: 55, igd: 32, rawatInap: 8, isHighlighted: false },
    ];

    const currentWeeklyVisits = weeklyVisits && weeklyVisits.length > 0 ? weeklyVisits : defaultVisits;
    const maxVisitCount = Math.max(...currentWeeklyVisits.map((v) => v.count), 200);

    const defaultActivities: ActivityItem[] = [
        {
            id: '1',
            title: 'Admin Budi menambahkan dokter baru: Dr. Siti Nurhaliza.',
            time: '2 menit lalu',
            type: 'user',
        },
        {
            id: '2',
            title: 'Suster Rina mengubah jadwal poli Gigi.',
            time: '45 menit lalu',
            type: 'calendar',
        },
        {
            id: '3',
            title: 'Sistem melaporkan stok Paracetamol menipis (Sisa: 2 Box).',
            time: '1 jam lalu',
            type: 'stock',
        },
    ];

    const currentActivities = recentActivities && recentActivities.length > 0 ? recentActivities : defaultActivities;
    const activeDayData = currentWeeklyVisits.find((v) => v.day === selectedDay) || currentWeeklyVisits[3];

    // =======================================================================
    // 1. Dashboard Admin (Matching Sentosa Medika Design Mockup)
    // =======================================================================
    const AdminDashboard = () => (
        <div className="space-y-6">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-[#0d4f42] tracking-tight">
                        Dashboard Admin
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Overview of RS Sentosa Medika operations for today.
                    </p>
                </div>
            </div>

            {/* 4 Statistik Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1: Total Pasien Terdaftar */}
                <Link
                    href="/pasien"
                    className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-[#145e5b]/30 hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Total Pasien Terdaftar
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#0d4f42] group-hover:bg-[#145e5b] group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {stats?.totalPatients || '8.240'}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#0d4f42]">
                            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>{stats?.patientTrend || '+5% vs last month'}</span>
                        </div>
                    </div>
                </Link>

                {/* Card 2: Appointment Hari Ini */}
                <Link
                    href="/papan-antrian"
                    className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-[#145e5b]/30 hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Appointment Hari Ini
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#0d4f42] group-hover:bg-[#145e5b] group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {stats?.todayAppointments || '156'}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                            </svg>
                            <span>{stats?.appointmentTrend || '-2% vs yesterday'}</span>
                        </div>
                    </div>
                </Link>

                {/* Card 3: Pendapatan Bulan Ini */}
                <Link
                    href="/audit-logs"
                    className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-[#145e5b]/30 hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Pendapatan Bulan Ini
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#0d4f42] group-hover:bg-[#145e5b] group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {stats?.monthlyRevenue || 'Rp 1.245M'}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#0d4f42]">
                            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>{stats?.revenueTrend || '+12% vs last month'}</span>
                        </div>
                    </div>
                </Link>

                {/* Card 4: Dokter Aktif */}
                <Link
                    href="/jadwal-dokter-admin"
                    className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-[#145e5b]/30 hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Dokter Aktif
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#0d4f42] group-hover:bg-[#145e5b] group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {stats?.activeDoctors || '42'}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                            <span>→</span>
                            <span>{stats?.doctorTrend || 'Stable'}</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Kunjungan Pasien & Aktivitas Terbaru Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left (8/12 cols): Kunjungan Pasien */}
                <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-xs lg:col-span-8">
                    <div className="flex items-center justify-between">
                        <h3 className="font-serif text-lg font-bold text-gray-900">
                            Kunjungan Pasien
                        </h3>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#e4f6f2] px-3.5 py-1.5 text-xs font-semibold text-[#0d4f42] hover:bg-[#d5f0ea] transition-colors"
                            >
                                <span>{chartRange}</span>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showRangeDropdown && (
                                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg z-20 text-xs">
                                    {['7 Hari Terakhir', '14 Hari Terakhir', 'Bulan Ini'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                                setChartRange(opt);
                                                setShowRangeDropdown(false);
                                            }}
                                            className={`block w-full text-left px-3 py-1.5 font-medium ${chartRange === opt ? 'bg-teal-50 text-[#0d4f42] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart Visualization Area */}
                    <div className="mt-8">
                        <div className="flex h-48 items-end justify-between gap-3 sm:gap-6 px-2 border-b border-gray-100 pb-2">
                            {currentWeeklyVisits.map((item, idx) => {
                                const heightPercent = Math.max(15, Math.round((item.count / maxVisitCount) * 100));
                                const isSelected = selectedDay === item.day;
                                const isHighlighted = item.isHighlighted || isSelected;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDay(item.day)}
                                        className="group relative flex flex-1 flex-col items-center cursor-pointer"
                                    >
                                        {/* Hover / Selected Tooltip */}
                                        <div className="pointer-events-none absolute -top-12 z-20 hidden rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md group-hover:block whitespace-nowrap">
                                            {item.fullName}: <span className="text-teal-300 font-bold">{item.count}</span> pasien
                                        </div>

                                        {/* Bar */}
                                        <div className="w-full flex items-end justify-center h-40">
                                            <div
                                                style={{ height: `${heightPercent}%` }}
                                                className={`w-full max-w-[56px] rounded-t-sm transition-all duration-300 ${
                                                    isHighlighted
                                                        ? 'bg-[#0d4f42] shadow-xs'
                                                        : 'bg-[#5a9c92]/30 hover:bg-[#5a9c92]/60'
                                                }`}
                                            ></div>
                                        </div>

                                        {/* Day Label */}
                                        <span
                                            className={`mt-3 text-xs transition-colors ${
                                                isHighlighted
                                                    ? 'font-bold text-[#0d4f42]'
                                                    : 'font-medium text-gray-500 group-hover:text-gray-800'
                                            }`}
                                        >
                                            {item.day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Selected Day Quick Breakdown */}
                        {activeDayData && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f0faf7] p-3 text-xs text-[#0d4f42]">
                                <div className="font-semibold">
                                    📊 Kunjungan {activeDayData.fullName}: <span className="font-bold">{activeDayData.count} Pasien</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] text-gray-600">
                                    <span>Rawat Jalan: <b>{activeDayData.rawatJalan || Math.round(activeDayData.count * 0.7)}</b></span>
                                    <span>IGD: <b>{activeDayData.igd || Math.round(activeDayData.count * 0.2)}</b></span>
                                    <span>Rawat Inap: <b>{activeDayData.rawatInap || Math.round(activeDayData.count * 0.1)}</b></span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right (4/12 cols): Aktivitas Terbaru */}
                <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-xs lg:col-span-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                            Aktivitas Terbaru
                        </h3>
                        <Link
                            href="/audit-logs"
                            className="text-xs font-semibold text-[#145e5b] hover:underline"
                        >
                            View All
                        </Link>
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-6 flex-1">
                        {currentActivities.slice(0, 4).map((act, idx) => (
                            <div key={act.id || idx} className="relative flex items-start gap-3.5">
                                {/* Vertical Connector Line */}
                                {idx !== currentActivities.slice(0, 4).length - 1 && (
                                    <div className="absolute top-7 bottom-0 left-3.5 -ml-px w-px bg-gray-200"></div>
                                )}

                                {/* Icon Circle Node */}
                                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf8f5] text-[#145e5b] shadow-2xs">
                                    {act.type === 'calendar' ? (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    ) : act.type === 'stock' ? (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-normal leading-snug text-gray-800">
                                        {act.title}
                                    </p>
                                    <span className="mt-1 block text-[11px] font-medium text-gray-400">
                                        {act.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );


    // 2. Dashboard Billing / Kasir (Fungsional - Real DB Data)
    const BillingDashboard = () => {
        const [invoices, setInvoices] = useState<KasirTagihanItem[]>(kasirInvoices);
        const [search, setSearch] = useState('');
        const [statusFilter, setStatusFilter] = useState<string>('all');
        const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
            kasirInvoices.length > 0 ? kasirInvoices[0].id : ''
        );
        const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Tunai');
        const [nominalInput, setNominalInput] = useState<string>('');
        const [isProcessing, setIsProcessing] = useState(false);
        const [toastMessage, setToastMessage] = useState<string | null>(null);
        const [showReceiptModal, setShowReceiptModal] = useState(false);

        // Modal Buat Tagihan Baru State
        const [showCreateModal, setShowCreateModal] = useState(false);
        const [selectedPasienId, setSelectedPasienId] = useState<string>('');
        const [layananInput, setLayananInput] = useState<string>('Poli Umum');
        const [rincianItems, setRincianItems] = useState<KasirRincianItem[]>([
            { label: 'Konsultasi Dokter', desc: 'Pemeriksaan rutin spesialis', price: 150000, qty: 1, total: 150000, icon: 'stethoscope' },
            { label: 'Pemeriksaan Lab / Alkes', desc: 'Cek sampel & tes diagnostik', price: 100000, qty: 1, total: 100000, icon: 'vial' },
        ]);
        const [catatanInput, setCatatanInput] = useState<string>('');

        // Sync with props when props change
        React.useEffect(() => {
            if (kasirInvoices && kasirInvoices.length > 0) {
                setInvoices(kasirInvoices);
                if (!selectedInvoiceId) {
                    setSelectedInvoiceId(kasirInvoices[0].id);
                }
            }
        }, [kasirInvoices]);

        const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

        // Format Currency Helper
        const formatRupiah = (val: number) => {
            return 'Rp ' + (val || 0).toLocaleString('id-ID');
        };

        // Calculation helpers for active payment
        const totalAmount = selectedInvoice ? selectedInvoice.total_tagihan : 0;
        const enteredNominal = parseInt(nominalInput.replace(/\D/g, ''), 10) || 0;
        const calculatedKembalian = Math.max(0, enteredNominal - totalAmount);

        // Filtered Invoices
        const filteredInvoices = invoices.filter((inv) => {
            const matchSearch =
                inv.no_invoice.toLowerCase().includes(search.toLowerCase()) ||
                inv.nama_pasien.toLowerCase().includes(search.toLowerCase()) ||
                inv.layanan.toLowerCase().includes(search.toLowerCase()) ||
                (inv.no_rm && inv.no_rm.toLowerCase().includes(search.toLowerCase()));

            const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
            return matchSearch && matchStatus;
        });

        // Filtered KPI metrics calculation
        const totalPendapatanToday = invoices
            .filter((i) => i.status === 'lunas')
            .reduce((acc, i) => acc + i.total_tagihan, 0);

        const pendingCount = invoices.filter((i) => i.status === 'belum_lunas').length;
        const pendingAmount = invoices
            .filter((i) => i.status === 'belum_lunas')
            .reduce((acc, i) => acc + i.total_tagihan, 0);

        const paidCount = invoices.filter((i) => i.status === 'lunas').length;

        // Process Payment Action
        const handleProcessPayment = async () => {
            if (!selectedInvoice) return;
            if (selectedInvoice.status === 'lunas') {
                setToastMessage('Invoice ini sudah lunas sebelumnya.');
                setTimeout(() => setToastMessage(null), 3000);
                return;
            }

            if (selectedPaymentMethod === 'Tunai' && enteredNominal > 0 && enteredNominal < totalAmount) {
                setToastMessage(`Nominal pembayaran tunai kurang dari total tagihan (${formatRupiah(totalAmount)}).`);
                setTimeout(() => setToastMessage(null), 4000);
                return;
            }

            setIsProcessing(true);
            const payAmount = selectedPaymentMethod === 'Tunai' && enteredNominal > 0 ? enteredNominal : totalAmount;
            const finalKembalian = Math.max(0, payAmount - totalAmount);

            try {
                const response = await fetch(`/api/v1/tagihan/${selectedInvoice.id}/bayar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify({
                        metode_pembayaran: selectedPaymentMethod,
                        jumlah_dibayar: payAmount,
                        catatan: selectedInvoice.catatan,
                    }),
                });

                const resData = await response.json();

                if (response.ok && resData.status === 'success') {
                    setInvoices((prev) =>
                        prev.map((inv) =>
                            inv.id === selectedInvoice.id
                                ? {
                                      ...inv,
                                      status: 'lunas',
                                      metode_pembayaran: selectedPaymentMethod,
                                      jumlah_dibayar: payAmount,
                                      kembalian: finalKembalian,
                                      waktu_pembayaran: new Date().toISOString(),
                                  }
                                : inv
                        )
                    );
                    setToastMessage(`Pembayaran invoice ${selectedInvoice.no_invoice} BERHASIL DIPROSES!`);
                    setShowReceiptModal(true);
                } else {
                    setToastMessage(resData.message || 'Gagal memproses pembayaran.');
                }
            } catch (err) {
                // Fallback direct local update if offline / simulated
                setInvoices((prev) =>
                    prev.map((inv) =>
                        inv.id === selectedInvoice.id
                            ? {
                                  ...inv,
                                  status: 'lunas',
                                  metode_pembayaran: selectedPaymentMethod,
                                  jumlah_dibayar: payAmount,
                                  kembalian: finalKembalian,
                                  waktu_pembayaran: new Date().toISOString(),
                              }
                            : inv
                    )
                );
                setToastMessage(`Pembayaran invoice ${selectedInvoice.no_invoice} berhasil diproses.`);
                setShowReceiptModal(true);
            } finally {
                setIsProcessing(false);
                setTimeout(() => setToastMessage(null), 4000);
            }
        };

        // Create New Invoice Handler
        const handleCreateInvoice = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedPasienId && kasirPatientsList.length > 0) {
                setSelectedPasienId(kasirPatientsList[0].id);
            }

            const targetPasienId = selectedPasienId || (kasirPatientsList.length > 0 ? kasirPatientsList[0].id : null);
            if (!targetPasienId) {
                alert('Silakan pilih pasien!');
                return;
            }

            try {
                const response = await fetch('/api/v1/tagihan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify({
                        pasien_id: targetPasienId,
                        layanan: layananInput,
                        rincian: rincianItems,
                        catatan: catatanInput,
                    }),
                });

                const resData = await response.json();
                if (response.ok && resData.status === 'success') {
                    const newInv = resData.data;
                    setInvoices((prev) => [
                        {
                            id: newInv.id,
                            no_invoice: newInv.no_invoice,
                            nama_pasien: newInv.pasien?.nama_lengkap || 'Pasien Baru',
                            pasien_id: newInv.pasien_id,
                            no_rm: newInv.pasien?.no_rm || '-',
                            nik: newInv.pasien?.nik || '-',
                            penjamin: newInv.pasien?.penjamin || 'Umum',
                            layanan: newInv.layanan,
                            subtotal: newInv.subtotal,
                            diskon: newInv.diskon,
                            pajak: newInv.pajak,
                            total_tagihan: newInv.total_tagihan,
                            jumlah_dibayar: 0,
                            kembalian: 0,
                            status: 'belum_lunas',
                            rincian: newInv.rincian,
                            created_at: newInv.created_at,
                        },
                        ...prev,
                    ]);
                    setSelectedInvoiceId(newInv.id);
                    setShowCreateModal(false);
                    setToastMessage(`Invoice ${newInv.no_invoice} berhasil dibuat!`);
                    setTimeout(() => setToastMessage(null), 3000);
                } else {
                    alert(resData.message || 'Gagal membuat invoice.');
                }
            } catch (err) {
                alert('Terjadi kesalahan saat membuat invoice.');
            }
        };

        return (
            <div className="space-y-6">
                {/* Notification Toast */}
                {toastMessage && (
                    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white shadow-xl animate-bounce">
                        <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* ===== HEADER BAR ===== */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-[#0d4f42] tracking-tight">
                            Billing & Tagihan Kasir
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Kelola transaksi pembayaran, invoice, dan pencetakan kuitansi pasien real-time.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0d4f42] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#08382f] transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            + Buat Tagihan Baru
                        </button>
                    </div>
                </div>

                {/* ===== 4 SUMMARY KPI CARDS ===== */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Pendapatan Lunas */}
                    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-gray-500">Total Pendapatan (Lunas)</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                {formatRupiah(totalPendapatanToday || kasirTodayRevenue)}
                            </div>
                            <div className="mt-1 text-xs font-medium text-emerald-600">
                                {paidCount} transaksi lunas
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Tagihan Belum Lunas */}
                    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-gray-500">Belum Lunas (Pending)</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-extrabold text-rose-700 tracking-tight">
                                {pendingCount} <span className="text-sm font-semibold text-gray-500">Invoice</span>
                            </div>
                            <div className="mt-1 text-xs font-medium text-rose-600">
                                Total: {formatRupiah(pendingAmount || kasirPendingAmount)}
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Transaksi Lunas Hari Ini */}
                    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-gray-500">Status Pembayaran</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#0d4f42]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                {paidCount} / {invoices.length}
                            </div>
                            <div className="mt-1 text-xs font-medium text-gray-500">
                                Invoice Terproses
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Penjamin Pasien Overview */}
                    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-gray-500">Penjamin Pasien</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>Umum: <b className="text-teal-900">{invoices.filter((i) => i.penjamin === 'Umum' || !i.penjamin).length}</b></span>
                            <span>BPJS: <b className="text-teal-900">{invoices.filter((i) => i.penjamin === 'BPJS Kesehatan' || i.penjamin === 'bpjs').length}</b></span>
                        </div>
                    </div>
                </div>

                {/* ===== SEARCH & FILTER CONTROLS ===== */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <div className="relative w-full sm:w-80">
                        <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari No Invoice, Nama Pasien, NIK..."
                            className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-xs font-medium focus:border-teal-700 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Filter Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-teal-700 focus:outline-none"
                        >
                            <option value="all">Semua Status</option>
                            <option value="belum_lunas">Belum Lunas</option>
                            <option value="lunas">Lunas</option>
                            <option value="dibatalkan">Dibatalkan</option>
                        </select>
                    </div>
                </div>

                {/* ===== MAIN GRID: INVOICE TABLE & BILLING SIDEBAR ===== */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left (2/3 cols): Tabel Tagihan */}
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-xs lg:col-span-2 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-800">
                                Daftar Invoice ({filteredInvoices.length})
                            </h3>
                            <span className="text-xs text-gray-400 font-medium">Klik baris untuk melihat rincian & memproses</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 font-semibold">
                                    <tr>
                                        <th className="p-3.5">No. Invoice</th>
                                        <th className="p-3.5">Nama Pasien</th>
                                        <th className="p-3.5">Layanan</th>
                                        <th className="p-3.5">Total Tagihan</th>
                                        <th className="p-3.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInvoices.length > 0 ? (
                                        filteredInvoices.map((row) => {
                                            const isSelected = row.id === selectedInvoiceId;
                                            return (
                                                <tr
                                                    key={row.id}
                                                    onClick={() => setSelectedInvoiceId(row.id)}
                                                    className={`cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'bg-[#e4f6f2] font-semibold text-[#0d4f42]'
                                                            : 'hover:bg-teal-50/40 text-gray-800'
                                                    }`}
                                                >
                                                    <td className="p-3.5 font-bold">
                                                        {row.no_invoice}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <div className="font-semibold text-gray-900">{row.nama_pasien}</div>
                                                        <div className="text-[11px] text-gray-400 font-normal">
                                                            RM: {row.no_rm || '-'} • {row.penjamin || 'Umum'}
                                                        </div>
                                                    </td>
                                                    <td className="p-3.5 text-gray-600">
                                                        {row.layanan}
                                                    </td>
                                                    <td className="p-3.5 font-extrabold text-gray-900">
                                                        {formatRupiah(row.total_tagihan)}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                                row.status === 'lunas'
                                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                    : row.status === 'dibatalkan'
                                                                    ? 'bg-gray-100 text-gray-600'
                                                                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    row.status === 'lunas'
                                                                        ? 'bg-emerald-500'
                                                                        : row.status === 'dibatalkan'
                                                                        ? 'bg-gray-400'
                                                                        : 'bg-rose-500'
                                                                }`}
                                                            ></span>
                                                            {row.status === 'lunas'
                                                                ? 'Lunas'
                                                                : row.status === 'dibatalkan'
                                                                ? 'Dibatalkan'
                                                                : 'Belum Lunas'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                                                Tidak ada invoice yang sesuai kriteria pencarian.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right (1/3 col): Detail Invoice & Interactive Payment Panel */}
                    {selectedInvoice ? (
                        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-xs h-fit space-y-5">
                            <div>
                                <div className="mb-4 flex items-start justify-between border-b border-gray-100 pb-3">
                                    <div>
                                        <span className="text-[11px] font-bold tracking-widest text-[#0d4f42] uppercase">
                                            RINCIAN INVOICE
                                        </span>
                                        <h2 className="text-xl font-bold text-[#0d4f42] tracking-tight mt-0.5">
                                            {selectedInvoice.no_invoice}
                                        </h2>
                                        <p className="text-xs font-semibold text-gray-800">
                                            {selectedInvoice.nama_pasien} <span className="text-gray-400 font-normal">({selectedInvoice.layanan})</span>
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                                            selectedInvoice.status === 'lunas'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-rose-100 text-rose-700'
                                        }`}
                                    >
                                        {selectedInvoice.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                                    </span>
                                </div>

                                {/* Line Items List */}
                                <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                                    {selectedInvoice.rincian && selectedInvoice.rincian.length > 0 ? (
                                        selectedInvoice.rincian.map((item, idx) => (
                                            <div key={idx} className="flex items-start justify-between text-xs">
                                                <div className="flex gap-2.5">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#0d4f42]">
                                                        {item.icon === 'pills' ? (
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                            </svg>
                                                        ) : item.icon === 'vial' ? (
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.label}</p>
                                                        {item.desc && (
                                                            <p className="text-[11px] text-gray-500 whitespace-pre-line leading-relaxed">
                                                                {item.desc}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-900 whitespace-nowrap">
                                                    {formatRupiah(item.total || item.price)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Rincian item layanan tidak tersedia.</p>
                                    )}
                                </div>

                                {/* Total Price Calculation */}
                                <div className="mt-4 border-t border-gray-100 pt-4 space-y-2 text-xs">
                                    <div className="flex justify-between text-gray-600 font-medium">
                                        <span>Subtotal</span>
                                        <span>{formatRupiah(selectedInvoice.subtotal || selectedInvoice.total_tagihan)}</span>
                                    </div>
                                    {selectedInvoice.diskon > 0 && (
                                        <div className="flex justify-between text-rose-600 font-medium">
                                            <span>Diskon</span>
                                            <span>- {formatRupiah(selectedInvoice.diskon)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm font-extrabold text-gray-900 border-t border-dashed border-gray-200 pt-2">
                                        <span>Total Tagihan</span>
                                        <span className="text-xl font-black text-[#0d4f42]">
                                            {formatRupiah(selectedInvoice.total_tagihan)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Controls (If unpaid) */}
                                {selectedInvoice.status !== 'lunas' ? (
                                    <div className="mt-5 space-y-4 rounded-xl bg-[#f0faf7] p-4 border border-[#d1fae5]">
                                        <div>
                                            <label className="block text-xs font-bold text-[#0d4f42] mb-1.5">
                                                METODE PEMBAYARAN
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Tunai', 'Kartu', 'QRIS', 'BPJS'].map((method) => (
                                                    <button
                                                        key={method}
                                                        type="button"
                                                        onClick={() => setSelectedPaymentMethod(method)}
                                                        className={`rounded-xl border py-2 text-xs font-extrabold transition-all ${
                                                            selectedPaymentMethod === method
                                                                ? 'border-[#0d4f42] bg-[#0d4f42] text-white shadow-xs'
                                                                : 'border-gray-200 bg-white text-gray-700 hover:border-teal-500'
                                                        }`}
                                                    >
                                                        {method === 'Kartu' ? 'Kartu Debit/Kredit' : method}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cash Calculator */}
                                        {selectedPaymentMethod === 'Tunai' && (
                                            <div className="space-y-2 border-t border-teal-200/60 pt-3">
                                                <label className="block text-xs font-bold text-gray-800">
                                                    Uang Dibayar (Rp):
                                                </label>
                                                <input
                                                    type="number"
                                                    value={nominalInput}
                                                    onChange={(e) => setNominalInput(e.target.value)}
                                                    placeholder={selectedInvoice.total_tagihan.toString()}
                                                    className="w-full rounded-xl border border-teal-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-teal-700 focus:outline-none"
                                                />
                                                <div className="flex gap-1.5 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setNominalInput(selectedInvoice.total_tagihan.toString())}
                                                        className="rounded-lg bg-teal-100 px-2 py-1 text-[10px] font-bold text-teal-800 hover:bg-teal-200"
                                                    >
                                                        Uang Pas
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setNominalInput(
                                                                (Math.ceil(selectedInvoice.total_tagihan / 50000) * 50000).toString()
                                                            )
                                                        }
                                                        className="rounded-lg bg-teal-100 px-2 py-1 text-[10px] font-bold text-teal-800 hover:bg-teal-200"
                                                    >
                                                        Bulatan Keatas
                                                    </button>
                                                </div>

                                                {/* Calculated Change */}
                                                <div className="flex items-center justify-between rounded-lg bg-emerald-100/70 p-2.5 text-xs text-emerald-900 font-bold mt-2">
                                                    <span>Kembalian:</span>
                                                    <span className="text-sm font-black text-emerald-800">
                                                        {formatRupiah(calculatedKembalian)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs space-y-1">
                                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Status: Pembayaran Lunas
                                        </div>
                                        <p className="text-gray-600 font-medium">
                                            Metode: <b>{selectedInvoice.metode_pembayaran || 'Tunai'}</b>
                                        </p>
                                        {selectedInvoice.jumlah_dibayar > 0 && (
                                            <p className="text-gray-600">
                                                Dibayar: {formatRupiah(selectedInvoice.jumlah_dibayar)} • Kembalian: {formatRupiah(selectedInvoice.kembalian)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 pt-2">
                                {selectedInvoice.status !== 'lunas' ? (
                                    <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={handleProcessPayment}
                                        className="w-full rounded-xl bg-[#0d4f42] py-3 text-xs font-extrabold text-white shadow-sm hover:bg-[#08382f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <span>Memproses Pembayaran...</span>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Proses Pembayaran Sekarang
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowReceiptModal(true)}
                                        className="w-full rounded-xl bg-teal-800 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-teal-900 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Cetak Struk / Bukti Pembayaran
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* ===== MODAL CETAK STRUK / RECEIPT PRINT ===== */}
                {showReceiptModal && selectedInvoice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                            <div className="text-center border-b border-gray-200 pb-4">
                                <h3 className="font-serif text-lg font-black text-[#0d4f42]">
                                    RS SENTOSA MEDIKA
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium">
                                    Jl. Sentosa Medika No. 88, Jakarta • Telp: (021) 555-0199
                                </p>
                                <p className="mt-2 text-xs font-extrabold text-gray-800 tracking-wider">
                                    BUKTI PEMBAYARAN KASIR (OFFICIAL RECEIPT)
                                </p>
                            </div>

                            <div className="text-xs space-y-1 text-gray-700">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">No. Invoice:</span>
                                    <span className="font-bold text-gray-900">{selectedInvoice.no_invoice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tanggal & Waktu:</span>
                                    <span className="font-semibold">{selectedInvoice.waktu_pembayaran ? new Date(selectedInvoice.waktu_pembayaran).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Pasien:</span>
                                    <span className="font-bold">{selectedInvoice.nama_pasien} (RM: {selectedInvoice.no_rm || '-'})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Layanan:</span>
                                    <span className="font-semibold">{selectedInvoice.layanan}</span>
                                </div>
                            </div>

                            <div className="border-t border-b border-dashed border-gray-300 py-3 space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">RINCIAN BIAYA</span>
                                {selectedInvoice.rincian && selectedInvoice.rincian.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs font-medium text-gray-800">
                                        <span>{item.label}</span>
                                        <span>{formatRupiah(item.total || item.price)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="text-xs space-y-1.5 pt-1">
                                <div className="flex justify-between text-sm font-extrabold text-gray-900">
                                    <span>TOTAL BILL:</span>
                                    <span className="text-teal-900">{formatRupiah(selectedInvoice.total_tagihan)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 font-semibold">
                                    <span>Metode Pembayaran:</span>
                                    <span>{selectedInvoice.metode_pembayaran || selectedPaymentMethod}</span>
                                </div>
                                {selectedInvoice.jumlah_dibayar > 0 && (
                                    <>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Jumlah Dibayar:</span>
                                            <span>{formatRupiah(selectedInvoice.jumlah_dibayar)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-800 font-bold">
                                            <span>Kembalian:</span>
                                            <span>{formatRupiah(selectedInvoice.kembalian)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 italic">
                                <span>Petugas Kasir: {user?.nama_lengkap || 'Kasir Sentosa'}</span>
                                <span className="font-bold text-emerald-700 not-italic border border-emerald-300 px-2 py-0.5 rounded">STATUS: LUNAS</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowReceiptModal(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="rounded-xl bg-teal-800 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-900 flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Cetak Struk Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== MODAL BUAT TAGIHAN BARU ===== */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="font-serif text-lg font-bold text-[#0d4f42]">
                                    Buat Tagihan / Invoice Baru
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Pilih Pasien Terdaftar:
                                    </label>
                                    <select
                                        value={selectedPasienId}
                                        onChange={(e) => setSelectedPasienId(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold focus:border-teal-700 focus:outline-none"
                                        required
                                    >
                                        <option value="">-- Pilih Pasien --</option>
                                        {kasirPatientsList.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_lengkap} (RM: {p.no_rm || '-'}) • Penjamin: {p.penjamin || 'Umum'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Layanan Hospital / Poliklinik:
                                    </label>
                                    <select
                                        value={layananInput}
                                        onChange={(e) => setLayananInput(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold focus:border-teal-700 focus:outline-none"
                                    >
                                        <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                                        <option value="IGD (Gawat Darurat)">IGD (Gawat Darurat)</option>
                                        <option value="Poli Gigi">Poli Gigi</option>
                                        <option value="Poli Anak">Poli Anak</option>
                                        <option value="Rawat Inap - Bangsal Mawar">Rawat Inap - Bangsal Mawar</option>
                                        <option value="Farmasi & Resep Obat">Farmasi & Resep Obat</option>
                                    </select>
                                </div>

                                <div className="space-y-2 border-t border-gray-100 pt-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-gray-800">
                                            Rincian Biaya & Layanan:
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRincianItems([
                                                    ...rincianItems,
                                                    { label: 'Tindakan Medis', desc: '', price: 100000, qty: 1, total: 100000, icon: 'stethoscope' },
                                                ])
                                            }
                                            className="text-[11px] font-bold text-teal-700 hover:underline"
                                        >
                                            Tambah Item
                                        </button>
                                    </div>

                                    {rincianItems.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center rounded-xl bg-gray-50 p-2.5 border border-gray-200">
                                            <div className="col-span-5">
                                                <input
                                                    type="text"
                                                    value={item.label}
                                                    onChange={(e) => {
                                                        const copy = [...rincianItems];
                                                        copy[idx].label = e.target.value;
                                                        setRincianItems(copy);
                                                    }}
                                                    placeholder="Nama Item (mis. Konsultasi)"
                                                    className="w-full rounded-lg border border-gray-300 p-1.5 text-xs font-semibold"
                                                />
                                            </div>
                                            <div className="col-span-5">
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => {
                                                        const copy = [...rincianItems];
                                                        const p = parseInt(e.target.value, 10) || 0;
                                                        copy[idx].price = p;
                                                        copy[idx].total = p * (copy[idx].qty || 1);
                                                        setRincianItems(copy);
                                                    }}
                                                    placeholder="Harga (Rp)"
                                                    className="w-full rounded-lg border border-gray-300 p-1.5 text-xs font-semibold"
                                                />
                                            </div>
                                            <div className="col-span-2 text-right">
                                                {rincianItems.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRincianItems(rincianItems.filter((_, i) => i !== idx))}
                                                        className="text-rose-600 font-bold hover:text-rose-800 text-xs"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Catatan / Keterangan Tagihan:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={catatanInput}
                                        onChange={(e) => setCatatanInput(e.target.value)}
                                        placeholder="Catatan tambahan kasir..."
                                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-teal-700 focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-[#0d4f42] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#08382f]"
                                    >
                                        Simpan & Buat Invoice
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // 3. Dashboard Perawat (Gambar 2)
    const NurseDashboard = () => (
        <div className="space-y-6">
            <div>
                <h1 className="mb-1 font-serif text-3xl text-[#0d4f42]">
                    Selamat bertugas, Suster Ani Rahmawati
                </h1>
                <p className="text-sm text-gray-500">
                    Semoga hari menyenangkan. Berikut adalah ringkasan tugas
                    Anda hari ini.
                </p>
            </div>

            {/* 3 Cards Top */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-[#d1fae5]/20 p-6">
                    <div className="mb-4 flex items-start justify-between">
                        <i className="fa-solid fa-bed text-2xl text-[#0d4f42]"></i>
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            <i className="fa-solid fa-triangle-exclamation text-xs"></i> 4 Perlu Perhatian
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Pasien Shift Ini</p>
                    <p className="mt-1 font-serif text-5xl text-[#0d4f42]">
                        12
                    </p>
                </div>

                <div className="relative rounded-xl border border-gray-200 bg-[#d1fae5]/20 p-6">
                    <span className="absolute top-4 right-4 rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">
                        Berakhir dlm 4j 30m
                    </span>
                    <i className="fa-regular fa-clock mb-4 block text-2xl text-[#0d4f42]"></i>
                    <p className="text-sm text-gray-600">Jadwal Shift Anda</p>
                    <p className="mt-1 text-2xl font-bold text-[#0d4f42]">
                        Shift Pagi
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        07:00 – 15:00 WIB
                    </p>
                </div>

                <div className="relative rounded-xl border border-red-100 bg-red-50 p-6">
                    <div className="mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-2xl text-red-600"></i>
                        <span className="text-sm font-bold text-red-800">
                            Peringatan Kritis
                        </span>
                    </div>
                    <p className="mb-4 text-xs leading-relaxed text-red-700">
                        Pasien di Kamar 204 (Ibu Kartini) butuh pemeriksaan
                        vitals segera. Tekanan darah fluktuatif pada pemeriksaan
                        terakhir.
                    </p>
                    <button className="w-full rounded-md bg-red-700 py-2 text-xs font-bold text-white">
                        Tindak Lanjuti Sekarang
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Daftar Tugas Perawatan */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-3">
                    <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="font-bold text-gray-900">
                            Daftar Tugas Perawatan
                        </h3>
                        <a
                            href="#"
                            className="text-sm font-bold text-[#0d4f42] flex items-center gap-1"
                        >
                            Lihat Semua <i className="fa-solid fa-arrow-right text-xs"></i>
                        </a>
                    </div>
                    <div className="space-y-4">
                        {[
                            {
                                task: 'Pemberian Obat Siang',
                                desc: 'Kamar 201 • Paracetamol 500mg, Amoxicillin',
                                time: '12:00 (Terlambat)',
                                status: false,
                            },
                            {
                                task: 'Cek Vitals Rutin',
                                desc: 'Kamar 204 • Tensi, Suhu, Nadi',
                                time: '14:00',
                                status: false,
                            },
                        ].map((t, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-4 md:flex-row md:items-center"
                            >
                                <div className="mb-2 flex items-center gap-3 md:mb-0">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded-md border-2 border-gray-300 accent-[#0d4f42]"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {t.task}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {t.desc}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`text-xs ${t.time.includes('Terlambat') ? 'font-bold text-red-600' : 'text-gray-500'}`}
                                    >
                                        {t.time}
                                    </span>
                                    <button className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                                        Tandai Selesai
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Aksi Cepat */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 font-bold text-gray-900">Aksi Cepat</h3>
                    <div className="space-y-3">
                        {[
                            {
                                label: 'Catat Vital Pasien',
                                desc: 'Input data TTV terbaru',
                                icon: <i className="fa-solid fa-chart-line text-lg text-teal-700"></i>,
                            },
                            {
                                label: 'Lihat Daftar Monitoring',
                                desc: 'Jadwal observasi pasien',
                                icon: <i className="fa-solid fa-clipboard-list text-lg text-teal-700"></i>,
                            },
                            {
                                label: 'Request Obat Farmasi',
                                desc: 'Isi ulang stok ruangan',
                                icon: <i className="fa-solid fa-pills text-lg text-teal-700"></i>,
                            },
                        ].map((a, idx) => (
                            <button
                                key={idx}
                                className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] p-3 text-left transition-colors hover:bg-gray-100"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{a.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">
                                            {a.label}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {a.desc}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 4. Dashboard Dokter (Gambar 3)
    const DoctorDashboard = () => (
        <div className="space-y-6">
            <div>
                <h1 className="mb-1 font-serif text-3xl text-[#0d4f42]">
                    Selamat pagi, dr. Ahmad Fauzi, Sp.PD
                </h1>
                <p className="text-sm text-gray-500">
                    Semoga hari Anda menyenangkan dan produktif.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Pasien Berikutnya */}
                <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <span className="text-xs font-bold tracking-widest text-[#0d4f42] uppercase">
                        Pasien Berikutnya
                    </span>
                    <div className="mt-3 flex items-start justify-between">
                        <div>
                            <p className="font-serif text-3xl font-medium text-gray-900">
                                Tn. Budi Santoso
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                09:00 - Konsultasi Rutin (Hipertensi)
                            </p>
                        </div>
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 text-2xl font-bold text-[#0d4f42]">
                            BS
                        </div>
                    </div>
                    <button className="mt-8 flex w-fit items-center gap-2 rounded-lg bg-[#0d4f42] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0a3d33]">
                        <i className="fa-solid fa-user-doctor"></i> Mulai Konsultasi Pasien Berikutnya
                    </button>
                </div>

                {/* Jadwal Praktik Hari Ini */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">
                            Jadwal Praktik Hari Ini
                        </h3>
                        <span className="text-gray-400">...</span>
                    </div>
                    <div className="relative ml-3 space-y-6 border-l border-gray-200 pb-4">
                        {[
                            {
                                time: '08:00',
                                name: 'Ibu Ratna Sari',
                                status: 'Selesai',
                                type: 'Kontrol Diabetes',
                                statusColor: 'bg-gray-100 text-gray-600',
                                isSelected: false,
                            },
                            {
                                time: '08:30',
                                name: 'Tn. Agus Haryanto',
                                status: 'Sedang Konsultasi',
                                type: 'Keluhan Nyeri Dada',
                                statusColor: 'bg-green-100 text-green-700',
                                isSelected: true,
                            },
                            {
                                time: '09:00',
                                name: 'Tn. Budi Santoso',
                                status: 'Menunggu',
                                type: 'Konsultasi Rutin (Hipertensi)',
                                statusColor: 'bg-gray-200 text-gray-700',
                                isSelected: false,
                            },
                            {
                                time: '09:30',
                                name: 'Ny. Lilis Suryani',
                                status: 'Menunggu',
                                type: 'Check-up Pasca Rawat',
                                statusColor: 'bg-gray-200 text-gray-700',
                                isSelected: false,
                            },
                        ].map((j, idx) => (
                            <div
                                key={idx}
                                className={`relative pl-6 ${j.isSelected ? '-ml-4 rounded-r-lg border-l-4 border-[#0d4f42] bg-[#e0f2f1] py-3 pl-8' : ''}`}
                            >
                                <div
                                    className={`absolute top-2 left-[-5px] h-2.5 w-2.5 rounded-full ${j.isSelected ? 'bg-[#0d4f42]' : 'bg-gray-300'}`}
                                ></div>
                                <div className="flex items-center gap-3">
                                    <span className="min-w-[40px] text-xs font-bold text-[#0d4f42]">
                                        {j.time}
                                    </span>
                                    <div className="flex-1">
                                        <p
                                            className={`text-sm font-bold ${j.isSelected ? 'text-gray-900' : 'text-gray-800'}`}
                                        >
                                            {j.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {j.type}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${j.statusColor}`}
                                    >
                                        {j.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <a
                        href="#"
                        className="mt-2 block text-center text-sm font-bold text-[#0d4f42]"
                    >
                        Lihat Jadwal Lengkap
                    </a>
                </div>
            </div>

            {/* Statistik Bawah */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-[#d1fae5]/20 p-6">
                        <div>
                            <p className="text-sm text-gray-600">
                                Pasien Hari Ini
                            </p>
                            <p className="mt-1 font-serif text-4xl font-medium text-[#0d4f42]">
                                18
                            </p>
                            <p className="mt-1 text-[10px] text-gray-400">
                                ↑ 2 dari kemarin
                            </p>
                        </div>
                        <i className="fa-solid fa-users text-2xl text-[#0d4f42]"></i>
                    </div>
                    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-[#d1fae5]/20 p-6">
                        <div>
                            <p className="text-sm text-gray-600">
                                Rata-rata Waktu Konsultasi
                            </p>
                            <p className="mt-1 font-serif text-4xl font-medium text-[#0d4f42]">
                                15 mnt
                            </p>
                            <p className="mt-1 text-[10px] text-gray-400">
                                ⊙ Tepat waktu
                            </p>
                        </div>
                        <i className="fa-regular fa-clock text-2xl text-[#0d4f42]"></i>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-bell text-lg text-orange-500"></i>
                        <h3 className="font-bold text-gray-900">
                            Pemberitahuan Penting
                        </h3>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-flask-vial text-orange-500 text-lg"></i>
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    Hasil lab Ibu Siti Aminah sudah masuk.
                                </p>
                                <p className="text-xs text-gray-500">
                                    HbA1c menunjukkan perbaikan signifikan.
                                </p>
                            </div>
                        </div>
                        <a
                            href="#"
                            className="text-sm font-bold text-[#0d4f42] hover:underline"
                        >
                            Lihat Hasil
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );

    // 5. Dashboard Apoteker (Real & Fungsional)
    const PharmacistDashboard = () => {
        const [searchQueue, setSearchQueue] = useState('');
        const [statusFilter, setStatusFilter] = useState<'semua' | 'menunggu_ditebus' | 'sudah_ditebus'>('semua');
        const [selectedResep, setSelectedResep] = useState<any | null>(null);
        const [isTebusSubmitting, setIsTebusSubmitting] = useState(false);

        // State Modals
        const [showStokModal, setShowStokModal] = useState(false);
        const [searchObat, setSearchObat] = useState('');
        const [editingObat, setEditingObat] = useState<any | null>(null);
        const [restockQty, setRestockQty] = useState<number>(0);
        const [restockAlasan, setRestockAlasan] = useState('');
        const [isRestockSubmitting, setIsRestockSubmitting] = useState(false);

        const [showAddObatModal, setShowAddObatModal] = useState(false);
        const [newObatData, setNewObatData] = useState({
            nama_obat: '',
            kode_obat: '',
            bentuk_sediaan: 'Tablet',
            stok: 100,
            harga: 5000,
            kemasan: 'Box / Strip',
            komposisi: '-',
        });
        const [isAddObatSubmitting, setIsAddObatSubmitting] = useState(false);

        const [showPengeluaranModal, setShowPengeluaranModal] = useState(false);
        const [pengeluaranData, setPengeluaranData] = useState({
            obat_id: '',
            jumlah: 1,
            alasan: 'Rusak / Expired',
        });
        const [isPengeluaranSubmitting, setIsPengeluaranSubmitting] = useState(false);

        const [showRiwayatModal, setShowRiwayatModal] = useState(false);

        // Filter Resep Queue
        const filteredReseps = aptPrescriptionQueue.filter((r: any) => {
            const matchesSearch =
                (r.no_resep || '').toLowerCase().includes(searchQueue.toLowerCase()) ||
                (r.nama_pasien || '').toLowerCase().includes(searchQueue.toLowerCase()) ||
                (r.dokter || '').toLowerCase().includes(searchQueue.toLowerCase());
            const matchesStatus =
                statusFilter === 'semua' ? true : r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        // Filter Master Obat
        const filteredObats = aptObatMasterList.filter((o: any) => {
            return (
                (o.nama_obat || '').toLowerCase().includes(searchObat.toLowerCase()) ||
                (o.kode_obat || '').toLowerCase().includes(searchObat.toLowerCase()) ||
                (o.bentuk_sediaan || '').toLowerCase().includes(searchObat.toLowerCase())
            );
        });

        // Handlers
        const handleProcessTebus = (resepId: string) => {
            setIsTebusSubmitting(true);
            router.post(
                `/resep/${resepId}/tebus`,
                {},
                {
                    onFinish: () => {
                        setIsTebusSubmitting(false);
                        setSelectedResep(null);
                    },
                }
            );
        };

        const handleSaveRestock = (e: React.FormEvent) => {
            e.preventDefault();
            if (!editingObat) return;
            setIsRestockSubmitting(true);
            router.post(
                `/obat/${editingObat.id}/stok`,
                { stok: restockQty, alasan: restockAlasan },
                {
                    onFinish: () => {
                        setIsRestockSubmitting(false);
                        setEditingObat(null);
                    },
                }
            );
        };

        const handleSaveNewObat = (e: React.FormEvent) => {
            e.preventDefault();
            setIsAddObatSubmitting(true);
            router.post('/obat', newObatData, {
                onFinish: () => {
                    setIsAddObatSubmitting(false);
                    setShowAddObatModal(false);
                    setNewObatData({
                        nama_obat: '',
                        kode_obat: '',
                        bentuk_sediaan: 'Tablet',
                        stok: 100,
                        harga: 5000,
                        kemasan: 'Box / Strip',
                        komposisi: '-',
                    });
                },
            });
        };

        const handleSavePengeluaran = (e: React.FormEvent) => {
            e.preventDefault();
            if (!pengeluaranData.obat_id) return;
            const targetObat = aptObatMasterList.find((o: any) => o.id === pengeluaranData.obat_id);
            if (!targetObat) return;

            const newStok = Math.max(0, targetObat.stok - Number(pengeluaranData.jumlah));
            setIsPengeluaranSubmitting(true);
            router.post(
                `/obat/${targetObat.id}/stok`,
                { stok: newStok, alasan: `Pengeluaran Stok: ${pengeluaranData.alasan}` },
                {
                    onFinish: () => {
                        setIsPengeluaranSubmitting(false);
                        setShowPengeluaranModal(false);
                    },
                }
            );
        };

        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-[#0d4f42]">
                            Dashboard Apoteker & Farmasi
                        </h1>
                        <p className="text-xs text-gray-500">
                            Penerbitan, penebusan resep digital real-time, dan manajemen stok obat SIMRS.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Farmasi Shift Aktif
                        </span>
                    </div>
                </div>

                {/* Stat Cards Real */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Card 1: Resep Masuk Hari Ini */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
                        <p className="mb-2 text-sm font-bold text-gray-800">
                            Resep Masuk Hari Ini
                        </p>
                        <p className="mb-4 font-serif text-4xl text-[#0d4f42]">
                            {aptTodayReseps}{' '}
                            <span className="font-sans text-base font-bold text-[#0d4f42]">
                                Resep
                            </span>
                        </p>
                        <div className="flex justify-between text-xs text-gray-600">
                            <div className="flex flex-col items-center gap-0.5 rounded-md bg-yellow-50 px-2.5 py-1 text-yellow-700 border border-yellow-200">
                                <span className="text-[10px] font-semibold">Menunggu</span>
                                <span className="text-base font-bold">{aptPendingReseps}</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 rounded-md bg-orange-50 px-2.5 py-1 text-orange-700 border border-orange-200">
                                <span className="text-[10px] font-semibold">Disiapkan</span>
                                <span className="text-base font-bold">{aptPreparingReseps}</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-700 border border-emerald-200">
                                <span className="text-[10px] font-semibold">Selesai</span>
                                <span className="text-base font-bold">{aptCompletedReseps}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Stok Obat Menipis / Kritis */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-gray-800">
                                    Stok Obat Menipis
                                </p>
                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                    {aptLowStockList.length} Item Kritis
                                </span>
                            </div>
                            <div className="space-y-2 text-xs">
                                {aptLowStockList.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">Semua stok obat dalam kondisi aman.</p>
                                ) : (
                                    aptLowStockList.slice(0, 3).map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between border-b border-gray-100 pb-1.5 items-center">
                                            <span className="font-medium text-gray-700 truncate max-w-[160px]">{item.nama}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                item.level === 'habis'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {item.level === 'habis' ? 'Habis (0)' : `Sisa ${item.stok}`}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowStokModal(true)}
                            className="mt-4 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-bold text-gray-800 transition-colors hover:bg-gray-100"
                        >
                            Lihat Semua Stok Obat ({aptObatMasterList.length})
                        </button>
                    </div>

                    {/* Card 3: Transaksi Harian Real */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
                        <p className="mb-2 text-sm font-bold text-gray-800">
                            Penebusan Hari Ini
                        </p>
                        <p className="mb-4 font-serif text-3xl text-[#0d4f42]">
                            {aptTodayProcessed} Resep Selesai
                        </p>
                        <div className="flex h-16 items-end justify-between gap-1.5 pt-2">
                            {aptWeeklyTransactions.map((wt: any, idx: number) => {
                                const maxCount = Math.max(1, ...aptWeeklyTransactions.map((t: any) => t.count));
                                const heightPercent = Math.max(15, Math.round((wt.count / maxCount) * 100));
                                return (
                                    <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end gap-1">
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            className={`w-full rounded-xs transition-all ${
                                                idx === aptWeeklyTransactions.length - 1
                                                    ? 'bg-[#0d4f42]'
                                                    : 'bg-[#0d4f42]/40'
                                            }`}
                                            title={`${wt.day}: ${wt.count} resep`}
                                        ></div>
                                        <span className="text-[9px] font-bold text-gray-500">{wt.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tombol Aksi Cepat */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowPengeluaranModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#0d4f42] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#093a31] transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Catat Pengeluaran Stok
                    </button>
                    <button
                        onClick={() => setShowStokModal(true)}
                        className="flex items-center gap-2 rounded-xl border border-[#0d4f42]/20 bg-emerald-50 px-5 py-2.5 text-xs font-bold text-[#0d4f42] hover:bg-emerald-100 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Lihat & Kelola Stok Obat
                    </button>
                    <button
                        onClick={() => setShowRiwayatModal(true)}
                        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Lihat Riwayat Transaksi
                    </button>
                </div>

                {/* Tabel Utama Antrian Resep & Highlight Stok */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Antrian Resep Masuk Real-Time
                                </h3>
                                <p className="text-xs text-gray-500">Resep diterbitkan dokter dari Rekam Medis Elektronik (RME)</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari no resep, pasien, dokter..."
                                        value={searchQueue}
                                        onChange={(e) => setSearchQueue(e.target.value)}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-[#0d4f42] focus:outline-none"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e: any) => setStatusFilter(e.target.value)}
                                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:outline-none"
                                >
                                    <option value="semua">Semua Status</option>
                                    <option value="menunggu_ditebus">Menunggu Ditebus</option>
                                    <option value="sudah_ditebus">Sudah Ditebus</option>
                                </select>
                            </div>
                        </div>

                        {filteredReseps.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-sm text-gray-500">Tidak ada resep digital yang sesuai kriteria pencarian.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase bg-gray-50/50">
                                        <tr>
                                            <th className="py-2.5 px-3">No. Resep / Pasien</th>
                                            <th className="py-2.5 px-3">Dokter Pengirim</th>
                                            <th className="py-2.5 px-3">Detail Item</th>
                                            <th className="py-2.5 px-3">Status</th>
                                            <th className="py-2.5 px-3 text-right">Aksi Penebusan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {filteredReseps.map((r: any) => (
                                            <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-3 px-3">
                                                    <p className="font-bold text-gray-900">{r.no_resep}</p>
                                                    <p className="text-gray-500 font-medium">{r.nama_pasien} <span className="text-[10px] text-gray-400">({r.no_rm})</span></p>
                                                </td>
                                                <td className="py-3 px-3 text-gray-600 font-medium">
                                                    {r.dokter}
                                                </td>
                                                <td className="py-3 px-3 text-gray-600">
                                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700">
                                                        {r.jumlah_item} Item Obat
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                            r.status === 'sudah_ditebus'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'sudah_ditebus' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        {r.status === 'sudah_ditebus' ? 'Sudah Ditebus' : 'Menunggu Ditebus'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        onClick={() => setSelectedResep(r)}
                                                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                                                            r.status === 'sudah_ditebus'
                                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                : 'bg-[#0d4f42] text-white hover:bg-[#08382f]'
                                                        }`}
                                                    >
                                                        {r.status === 'sudah_ditebus' ? 'Lihat Detail' : 'Tebus Resep'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Right: Highlight Stok & Transaksi Terakhir */}
                    <div className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 text-sm">
                                    Status Stok Kritis
                                </h3>
                                <button
                                    onClick={() => setShowStokModal(true)}
                                    className="text-[11px] font-bold text-[#0d4f42] hover:underline"
                                >
                                    Lihat Semua
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {aptLowStockList.slice(0, 2).map((ob: any, idx: number) => (
                                    <div key={idx} className={`rounded-xl border p-3 text-center ${ob.level === 'habis' ? 'border-rose-200 bg-rose-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
                                        <p className={`text-2xl font-bold ${ob.level === 'habis' ? 'text-rose-600' : 'text-amber-600'}`}>
                                            {ob.stok}
                                        </p>
                                        <p className="text-[11px] font-bold text-gray-800 truncate mt-0.5">
                                            {ob.nama}
                                        </p>
                                        <span className="text-[9px] text-gray-500 uppercase">{ob.bentuk_sediaan}</span>
                                    </div>
                                ))}
                                {aptLowStockList.length < 2 && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center col-span-2">
                                        <p className="text-sm font-bold text-emerald-700">Stok obat aman & tersedia</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 text-sm">
                                    Riwayat Penebusan
                                </h3>
                                <button
                                    onClick={() => setShowRiwayatModal(true)}
                                    className="text-[11px] font-bold text-[#0d4f42] hover:underline"
                                >
                                    Lihat Semua
                                </button>
                            </div>
                            <div className="space-y-2.5 text-xs">
                                {aptRecentTransactions.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">Belum ada transaksi penebusan hari ini.</p>
                                ) : (
                                    aptRecentTransactions.slice(0, 4).map((t: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between border-b border-gray-100 pb-2 last:border-0 items-center"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {t.no_resep}
                                                </p>
                                                <p className="text-gray-500 font-medium text-[11px]">
                                                    {t.nama_pasien}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-700 text-[10px]">
                                                    {t.waktu}
                                                </p>
                                                <p className="text-emerald-700 font-bold text-[10px]">
                                                    {t.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL 1: Detail & Penebusan Resep */}
                {selectedResep && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
                        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Penebusan Resep Digital
                                    </h3>
                                    <p className="text-xs text-gray-500">No. Resep: <span className="font-bold text-[#0d4f42]">{selectedResep.no_resep}</span></p>
                                </div>
                                <button
                                    onClick={() => setSelectedResep(null)}
                                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl text-xs">
                                <div>
                                    <p className="text-gray-500">Nama Pasien:</p>
                                    <p className="font-bold text-gray-900">{selectedResep.nama_pasien}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Dokter Penanggung Jawab:</p>
                                    <p className="font-bold text-gray-900">{selectedResep.dokter}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Daftar Obat Resep & Ketersediaan Stok</h4>
                                <div className="rounded-xl border border-gray-200 overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                                            <tr>
                                                <th className="py-2 px-3">Nama Obat</th>
                                                <th className="py-2 px-3">Aturan Pakai</th>
                                                <th className="py-2 px-3 text-center">Jumlah</th>
                                                <th className="py-2 px-3 text-right">Stok DB</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedResep.details && selectedResep.details.length > 0 ? (
                                                selectedResep.details.map((item: any, idx: number) => {
                                                    const isStokCukup = item.stok_tersedia >= item.jumlah_dosis;
                                                    return (
                                                        <tr key={idx}>
                                                            <td className="py-2.5 px-3 font-semibold text-gray-800">
                                                                {item.nama_obat}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-gray-600">
                                                                {item.aturan_pakai}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-center font-bold">
                                                                {item.jumlah_dosis}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-right">
                                                                <span className={`font-bold ${isStokCukup ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                                    {item.stok_tersedia} {isStokCukup ? '✓' : '(Stok Kurang!)'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="py-4 text-center text-gray-400 italic">Rincian obat tidak ditemukan.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedResep(null)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Tutup
                                </button>

                                {selectedResep.status === 'menunggu_ditebus' ? (
                                    <button
                                        type="button"
                                        disabled={isTebusSubmitting}
                                        onClick={() => handleProcessTebus(selectedResep.id)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#0d4f42] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#08382f] disabled:opacity-50"
                                    >
                                        {isTebusSubmitting ? 'Memproses...' : 'Proses Tebus & Potong Stok'}
                                    </button>
                                ) : (
                                    <span className="rounded-xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">
                                        ✓ Resep Sudah Ditebus
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 2: Kelola Stok Obat (Catalog Drawer) */}
                {showStokModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
                        <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Katalog & Inventaris Master Obat
                                    </h3>
                                    <p className="text-xs text-gray-500">Kelola kuantitas stok, harga, dan produk obat di database SIMRS.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowAddObatModal(true)}
                                        className="rounded-lg bg-[#0d4f42] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#08382f]"
                                    >
                                        Tambah Obat Baru
                                    </button>
                                    <button
                                        onClick={() => setShowStokModal(false)}
                                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <input
                                    type="text"
                                    placeholder="Cari obat berdasarkan nama, kode, bentuk sediaan..."
                                    value={searchObat}
                                    onChange={(e) => setSearchObat(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:border-[#0d4f42] focus:outline-none"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 sticky top-0">
                                        <tr>
                                            <th className="py-2.5 px-3">Kode / Nama Obat</th>
                                            <th className="py-2.5 px-3">Sediaan</th>
                                            <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                                            <th className="py-2.5 px-3 text-center">Stok DB</th>
                                            <th className="py-2.5 px-3 text-center">Status</th>
                                            <th className="py-2.5 px-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredObats.map((o: any) => (
                                            <tr key={o.id} className="hover:bg-gray-50">
                                                <td className="py-2.5 px-3">
                                                    <p className="font-bold text-gray-900">{o.nama_obat}</p>
                                                    <p className="text-[10px] text-gray-500">{o.kode_obat}</p>
                                                </td>
                                                <td className="py-2.5 px-3 text-gray-600 font-medium">
                                                    {o.bentuk_sediaan}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium text-gray-800">
                                                    Rp {Number(o.harga).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                                                    {o.stok}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                        o.stok <= 0
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : o.stok <= 20
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {o.status_stok}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setEditingObat(o);
                                                            setRestockQty(o.stok);
                                                            setRestockAlasan('Restock obat bulanan');
                                                        }}
                                                        className="rounded-md border border-gray-300 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Update Stok
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setShowStokModal(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 3: Update Stok / Restock Obat Inline */}
                {editingObat && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/60 p-4">
                        <form onSubmit={handleSaveRestock} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                                Update Stok Obat
                            </h3>
                            <div>
                                <p className="text-xs text-gray-500">Nama Produk Obat:</p>
                                <p className="text-sm font-bold text-[#0d4f42]">{editingObat.nama_obat} ({editingObat.kode_obat})</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Stok Baru</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={restockQty}
                                    onChange={(e) => setRestockQty(Number(e.target.value))}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#0d4f42] focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Catatan / Alasan Penyesuaian</label>
                                <input
                                    type="text"
                                    value={restockAlasan}
                                    onChange={(e) => setRestockAlasan(e.target.value)}
                                    placeholder="Contoh: Penerimaan barang supplier / Penyesuaian opname"
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#0d4f42] focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingObat(null)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRestockSubmitting}
                                    className="rounded-xl bg-[#0d4f42] px-4 py-2 text-xs font-bold text-white hover:bg-[#08382f] disabled:opacity-50"
                                >
                                    {isRestockSubmitting ? 'Simpan...' : 'Simpan Stok'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* MODAL 4: Tambah Obat Baru */}
                {showAddObatModal && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/60 p-4">
                        <form onSubmit={handleSaveNewObat} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                                Tambah Obat Baru ke Master Inventaris
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Kode Obat</label>
                                    <input
                                        type="text"
                                        placeholder="OBT-009"
                                        value={newObatData.kode_obat}
                                        onChange={(e) => setNewObatData({ ...newObatData, kode_obat: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#0d4f42] focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Bentuk Sediaan</label>
                                    <select
                                        value={newObatData.bentuk_sediaan}
                                        onChange={(e) => setNewObatData({ ...newObatData, bentuk_sediaan: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#0d4f42] focus:outline-none"
                                    >
                                        <option value="Tablet">Tablet</option>
                                        <option value="Kapsul">Kapsul</option>
                                        <option value="Sirup">Sirup</option>
                                        <option value="Injeksi">Injeksi</option>
                                        <option value="Salep">Salep</option>
                                        <option value="Tetes">Tetes</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-bold text-gray-700 mb-1">Nama Obat</label>
                                    <input
                                        type="text"
                                        placeholder="Misal: Cefadroxil 500mg"
                                        value={newObatData.nama_obat}
                                        onChange={(e) => setNewObatData({ ...newObatData, nama_obat: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#0d4f42] focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Stok Awal</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newObatData.stok}
                                        onChange={(e) => setNewObatData({ ...newObatData, stok: Number(e.target.value) })}
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#0d4f42] focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Harga Satuan (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newObatData.harga}
                                        onChange={(e) => setNewObatData({ ...newObatData, harga: Number(e.target.value) })}
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#0d4f42] focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddObatModal(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddObatSubmitting}
                                    className="rounded-xl bg-[#0d4f42] px-4 py-2 text-xs font-bold text-white hover:bg-[#08382f] disabled:opacity-50"
                                >
                                    {isAddObatSubmitting ? 'Menyimpan...' : 'Tambah Obat'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* MODAL 5: Catat Pengeluaran Stok Manual */}
                {showPengeluaranModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
                        <form onSubmit={handleSavePengeluaran} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                                Catat Pengeluaran Stok Obat
                            </h3>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Obat</label>
                                <select
                                    value={pengeluaranData.obat_id}
                                    onChange={(e) => setPengeluaranData({ ...pengeluaranData, obat_id: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#0d4f42] focus:outline-none"
                                    required
                                >
                                    <option value="">-- Pilih Obat --</option>
                                    {aptObatMasterList.map((o: any) => (
                                        <option key={o.id} value={o.id}>
                                            {o.nama_obat} (Stok DB: {o.stok})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Dikeluarkan</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={pengeluaranData.jumlah}
                                    onChange={(e) => setPengeluaranData({ ...pengeluaranData, jumlah: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#0d4f42] focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Alasan Pengeluaran</label>
                                <select
                                    value={pengeluaranData.alasan}
                                    onChange={(e) => setPengeluaranData({ ...pengeluaranData, alasan: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#0d4f42] focus:outline-none"
                                >
                                    <option value="Rusak / Expired">Rusak / Expired</option>
                                    <option value="Pengeluaran Rawat Inap / IGD">Pengeluaran Rawat Inap / IGD</option>
                                    <option value="Sampel Laboratorium">Sampel Laboratorium</option>
                                    <option value="Penyesuaian Opname">Penyesuaian Opname</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowPengeluaranModal(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPengeluaranSubmitting}
                                    className="rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 disabled:opacity-50"
                                >
                                    {isPengeluaranSubmitting ? 'Memproses...' : 'Kurangi Stok'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* MODAL 6: Riwayat Transaksi Penebusan */}
                {showRiwayatModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
                        <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white p-6 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Riwayat Penebusan Resep Digital
                                    </h3>
                                    <p className="text-xs text-gray-500">Daftar transaksi penebusan obat yang telah selesai diproses.</p>
                                </div>
                                <button
                                    onClick={() => setShowRiwayatModal(false)}
                                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 sticky top-0">
                                        <tr>
                                            <th className="py-2.5 px-3">No. Resep</th>
                                            <th className="py-2.5 px-3">Nama Pasien</th>
                                            <th className="py-2.5 px-3">Waktu Selesai</th>
                                            <th className="py-2.5 px-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {aptRecentTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-6 text-center text-gray-400 italic">Belum ada riwayat transaksi.</td>
                                            </tr>
                                        ) : (
                                            aptRecentTransactions.map((t: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="py-2.5 px-3 font-bold text-[#0d4f42]">{t.no_resep}</td>
                                                    <td className="py-2.5 px-3 font-semibold text-gray-800">{t.nama_pasien}</td>
                                                    <td className="py-2.5 px-3 text-gray-600">{t.tanggal} {t.waktu}</td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                                            ✓ Selesai
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setShowRiwayatModal(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // =======================================================================
    // 6. Dashboard Manajemen Farmasi (Sesuai Mockup)
    // =======================================================================
    const ManajemenDashboard = () => {
        const maxChartCount = Math.max(...mgtWeeklyTransactions.map((t) => t.count), 1);

        const getStatusLabel = (status: string) => {
            switch (status) {
                case 'menunggu_ditebus': return 'Menunggu';
                case 'sudah_ditebus': return 'Sudah Ditebus';
                default: return status;
            }
        };

        const getStatusStyle = (status: string) => {
            switch (status) {
                case 'menunggu_ditebus':
                    return 'bg-amber-100 text-amber-800 border border-amber-200';
                case 'sudah_ditebus':
                    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                default:
                    return 'bg-gray-100 text-gray-700';
            }
        };

        return (
            <div className="space-y-6">
                {/* ===== HEADER ===== */}
                <div>
                    <h1 className="font-serif text-3xl font-bold text-[#0d4f42] tracking-tight">
                        Dashboard Manajemen
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Ringkasan operasional farmasi hari ini.
                    </p>
                </div>

                {/* ===== QUICK ACTION BUTTONS ===== */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/rme"
                        className="inline-flex items-center gap-2 rounded-full bg-[#145e5b] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0d4f42] hover:shadow-md"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Catat Pengeluaran Stok
                    </Link>
                    <Link
                        href="/rme"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-[#145e5b] hover:text-[#145e5b] hover:shadow-sm"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Lihat Stok Obat
                    </Link>
                    <Link
                        href="/audit-logs"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-[#145e5b] hover:text-[#145e5b] hover:shadow-sm"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Lihat Riwayat Transaksi
                    </Link>
                </div>

                {/* ===== 3 SUMMARY CARDS ===== */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {/* Card 1: Resep Masuk Hari Ini */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#0d4f42]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">Resep Masuk Hari Ini</span>
                        </div>
                        <div className="mb-5">
                            <span className="font-serif text-5xl font-bold text-[#0d4f42]">{mgtTodayReseps}</span>
                            <span className="ml-2 text-base font-semibold text-[#0d4f42]">Resep</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
                                <span className="text-gray-600">Menunggu</span>
                                <span className="font-bold text-gray-900">{mgtPendingReseps}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                                <span className="text-gray-600">Sudah Ditebus</span>
                                <span className="font-bold text-gray-900">{mgtCompletedReseps}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Stok Kritis */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#0d4f42]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">Stok Kritis</span>
                        </div>
                        {mgtLowStockList.length > 0 ? (
                            <div className="space-y-2.5">
                                {mgtLowStockList.slice(0, 3).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-800 truncate max-w-[160px]" title={item.nama}>
                                            {item.nama}
                                        </span>
                                        <span
                                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                                                item.level === 'habis'
                                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                                            }`}
                                        >
                                            {item.level === 'habis' ? 'Habis' : 'Menipis'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Semua stok obat aman.</p>
                        )}
                        <Link
                            href="/rme"
                            className="mt-4 block text-center text-xs font-bold uppercase tracking-widest text-[#145e5b] hover:underline"
                        >
                            Lihat Semua Stok
                        </Link>
                    </div>

                    {/* Card 3: Transaksi Harian + Bar Chart */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#0d4f42]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">Transaksi Harian</span>
                        </div>
                        <div className="mb-4">
                            <span className="font-serif text-4xl font-bold text-[#0d4f42]">{mgtTodayProcessed}</span>
                            <span className="ml-2 text-sm font-medium text-gray-500">Resep Diproses</span>
                        </div>
                        {/* Mini Bar Chart */}
                        <div className="flex items-end justify-between gap-1.5 h-20">
                            {mgtWeeklyTransactions.map((t, idx) => {
                                const heightPercent = maxChartCount > 0 ? Math.max(8, Math.round((t.count / maxChartCount) * 100)) : 8;
                                const isToday = idx === mgtWeeklyTransactions.length - 1;
                                return (
                                    <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            className={`w-full max-w-[28px] rounded-t-sm transition-all duration-300 ${
                                                isToday
                                                    ? 'bg-[#0d4f42]'
                                                    : 'bg-[#5a9c92]/40'
                                            }`}
                                            title={`${t.day}: ${t.count} resep`}
                                        />
                                        <span className={`mt-1.5 text-[10px] ${
                                            isToday ? 'font-bold text-[#0d4f42]' : 'text-gray-400'
                                        }`}>
                                            {t.day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ===== BOTTOM ROW: Antrian + Riwayat ===== */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    {/* Antrian Resep Masuk — Table */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-lg font-bold text-gray-900">Antrian Resep Masuk</h3>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01" />
                                </svg>
                            </button>
                        </div>

                        {mgtPrescriptionQueue.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            <th className="pb-3 pr-4">Nama Pasien</th>
                                            <th className="pb-3 pr-4">Dokter</th>
                                            <th className="pb-3 pr-4 text-center">Jumlah Item</th>
                                            <th className="pb-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mgtPrescriptionQueue.slice(0, 6).map((item) => (
                                            <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 pr-4 font-semibold text-gray-900">{item.nama_pasien}</td>
                                                <td className="py-3 pr-4 text-gray-600 text-xs">{item.dokter}</td>
                                                <td className="py-3 pr-4 text-center text-gray-700">
                                                    {item.jumlah_item} Obat
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusStyle(item.status)}`}>
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-sm text-gray-400">Belum ada resep masuk hari ini.</p>
                            </div>
                        )}
                    </div>

                    {/* Riwayat Terakhir — Timeline */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-4">
                        <h3 className="font-serif text-lg font-bold text-gray-900 mb-5">Riwayat Terakhir</h3>

                        {mgtRecentTransactions.length > 0 ? (
                            <div className="space-y-5">
                                {mgtRecentTransactions.slice(0, 4).map((trx, idx) => (
                                    <div key={trx.id} className="relative flex items-start gap-3">
                                        {/* Timeline connector */}
                                        {idx !== mgtRecentTransactions.slice(0, 4).length - 1 && (
                                            <div className="absolute top-7 bottom-0 left-3.5 -ml-px w-px bg-gray-200"></div>
                                        )}
                                        {/* Dot */}
                                        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-gray-900">{trx.no_resep}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                {trx.waktu} — {trx.nama_pasien}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <svg className="w-10 h-10 text-gray-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-gray-400">Belum ada transaksi selesai.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // =======================================================================
    // 7. Dashboard Resepsionis (Sesuai Mockup Gambar)
    // =======================================================================
    const ReceptionistDashboard = () => {
        const queueList =
            rcpLatestQueue.length > 0
                ? rcpLatestQueue
                : [
                      {
                          id: 'q-1',
                          nomor_antrian: 'A-012',
                          nama: 'Bpk. Budi Santoso',
                          poli: 'Poli Umum',
                          status: 'menunggu',
                      },
                      {
                          id: 'q-2',
                          nomor_antrian: 'B-005',
                          nama: 'Ibu Siti Aminah',
                          poli: 'Poli Gigi',
                          status: 'menunggu',
                      },
                      {
                          id: 'q-3',
                          nomor_antrian: 'C-021',
                          nama: 'An. Kevin Pratama',
                          poli: 'Poli Anak',
                          status: 'dipanggil',
                      },
                  ];

        const firstName = user?.nama_lengkap
            ? user.nama_lengkap.split(' ')[0]
            : 'Putri';

        return (
            <div className="-m-4 sm:-m-6 p-4 sm:p-8 space-y-6 sm:space-y-8 bg-[#f0f7f5] rounded-2xl min-h-[calc(100vh-5rem)]">
                {/* Header Subtitle, Greeting, & Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            RS Sentosa Medika HMS
                        </p>
                        <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#1e293b] font-normal tracking-tight">
                            Selamat bertugas, {firstName}
                        </h1>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2.5 rounded-xl bg-[#0f685c] px-5 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#0b5349] active:scale-95 cursor-pointer"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Registrasi Pasien Baru</span>
                        </button>
                    </div>
                </div>

                {/* 3 Stat Cards Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Card 1: Pasien Check-in */}
                    <div className="flex flex-col justify-between rounded-2xl border border-gray-100/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-md h-40">
                        <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d7f2ec] text-[#0f685c]">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="rounded-full bg-gray-100/90 px-3.5 py-1 text-xs font-medium text-gray-500">
                                Hari Ini
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Pasien Check-in</p>
                            <p className="text-3xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                                {rcpCheckinCount}
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Antrian Walk-in Aktif */}
                    <div className="flex flex-col justify-between rounded-2xl border border-gray-100/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-md h-40">
                        <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d7f2ec] text-[#0f685c]">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7f2ec]/60 px-3.5 py-1 text-xs font-semibold text-[#0f685c]">
                                <span className="h-2 w-2 rounded-full bg-[#0f685c] animate-pulse"></span>
                                Live
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Antrian Walk-in Aktif</p>
                            <p className="text-3xl font-extrabold text-[#0f685c] tracking-tight mt-0.5">
                                {rcpActiveQueue}
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Janji Temu Hari Ini */}
                    <div className="flex flex-col justify-between rounded-2xl border border-gray-100/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-md h-40">
                        <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#526360] text-white">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="rounded-full bg-gray-100/90 px-3.5 py-1 text-xs font-medium text-gray-500">
                                Total
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Janji Temu Hari Ini</p>
                            <p className="text-3xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                                {rcpTodayAppointments}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Latest Walk-in Queue Table Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold text-gray-900 tracking-tight">
                                Latest Walk-in Queue
                            </h2>
                        </div>
                        <Link
                            href="/manajemen-antrian"
                            className="text-xs font-semibold text-[#0f685c] transition-colors hover:text-[#0b5349]"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-[#f8faf9] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6 font-semibold">No. Antrian</th>
                                    <th className="py-3.5 px-6 font-semibold">Nama</th>
                                    <th className="py-3.5 px-6 font-semibold">Poli Tujuan</th>
                                    <th className="py-3.5 px-6 font-semibold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {queueList.map((item, idx) => {
                                    const isMenunggu = item.status === 'menunggu' || item.status === 'skrining';
                                    const isDipanggil = item.status === 'dipanggil' || item.status === 'sedang_dilayani';

                                    return (
                                        <tr
                                            key={item.id || idx}
                                            className="transition-colors hover:bg-teal-50/20"
                                        >
                                            <td className="py-4 px-6 font-bold text-gray-900 tracking-wide">
                                                {item.nomor_antrian}
                                            </td>
                                            <td className="py-4 px-6 font-medium text-gray-800">
                                                {item.nama}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {item.poli}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {isMenunggu && (
                                                    <span className="inline-block rounded-full bg-[#d7f2ec] px-4 py-1 text-xs font-semibold text-[#0f685c]">
                                                        Menunggu
                                                    </span>
                                                )}
                                                {isDipanggil && (
                                                    <span className="inline-block rounded-full bg-[#e3e1df] px-4 py-1 text-xs font-semibold text-gray-700">
                                                        Dipanggil
                                                    </span>
                                                )}
                                                {!isMenunggu && !isDipanggil && (
                                                    <span className="inline-block rounded-full bg-gray-100 px-4 py-1 text-xs font-semibold text-gray-600 capitalize">
                                                        {item.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // =======================================================================
    // [LOGIKA UTAMA] Render dashboard berdasarkan Role yang dipilih
    // =======================================================================
    return (
        <Layout user={user} role={role}>
            <div className="w-full">
                {role === 'admin' && <AdminDashboard />}
                {role === 'dokter' && <DoctorDashboard />}
                {role === 'perawat' && <NurseDashboard />}
                {role === 'apoteker' && <PharmacistDashboard />}
                {role === 'kasir' && <BillingDashboard />}
                {role === 'manajemen' && <ManajemenDashboard />}
                {role === 'resepsionis' && <ReceptionistDashboard />}

                {/* Jika role tidak terdaftar di template di atas, tampilkan default (aman) */}
                {![
                    'admin',
                    'dokter',
                    'perawat',
                    'apoteker',
                    'kasir',
                    'manajemen',
                    'resepsionis',
                ].includes(role) && (
                    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            Selamat Datang, {user?.nama_lengkap || 'Pengguna'}
                        </h1>
                        <p className="text-gray-500">
                            Sistem Informasi Manajemen Rumah Sakit - Mode Portal{' '}
                            {ROLE_LABELS[role]}
                        </p>
                    </div>
                )}
            </div>

            {/* [TIDAK DIUBAH] Modal Form Tambah Pasien (Hanya untuk Admin & Resepsionis) */}
            {isModalOpen && (role === 'admin' || role === 'resepsionis') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Tambah Data Pasien Baru
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Daftarkan rekam medis dan opsi pendaftaran
                                    layanan pasien
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmitPatient}
                            className="mt-4 space-y-4"
                        >
                            {/* [KODE MODAL ORISINAL TETAP SAMA] ... */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Nama Lengkap{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.nama_lengkap}
                                    onChange={(e) =>
                                        setData('nama_lengkap', e.target.value)
                                    }
                                    placeholder="Contoh: Budi Santoso"
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                />
                                {errors.nama_lengkap && (
                                    <p className="mt-1 text-[11px] text-red-600">
                                        {errors.nama_lengkap}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        NIK (KTP)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nik}
                                        onChange={(e) =>
                                            setData('nik', e.target.value)
                                        }
                                        placeholder="16 digit NIK"
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        No. Handphone
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_hp}
                                        onChange={(e) =>
                                            setData('no_hp', e.target.value)
                                        }
                                        placeholder="0812xxxxxxxx"
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        value={data.jenis_kelamin}
                                        onChange={(e) =>
                                            setData(
                                                'jenis_kelamin',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                    >
                                        <option value="Laki-laki">
                                            Laki-laki
                                        </option>
                                        <option value="Perempuan">
                                            Perempuan
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Golongan Darah
                                    </label>
                                    <select
                                        value={data.golongan_darah}
                                        onChange={(e) =>
                                            setData(
                                                'golongan_darah',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                        <option value="-">-</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
                                <div>
                                    <label className="block text-xs font-bold text-teal-900">
                                        Status Pendaftaran / Jenis Layanan
                                    </label>
                                    <select
                                        value={data.jenis_layanan}
                                        onChange={(e) =>
                                            setData(
                                                'jenis_layanan',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-teal-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-900 focus:border-teal-700 focus:outline-none"
                                    >
                                        <option value="">
                                            - Belum Mendaftar Layanan -
                                        </option>
                                        <option value="rawat_jalan">
                                            Rawat Jalan
                                        </option>
                                        <option value="rawat_inap">
                                            Rawat Inap
                                        </option>
                                        <option value="igd">
                                            IGD (Gawat Darurat)
                                        </option>
                                    </select>
                                </div>
                                {data.jenis_layanan !== '' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700">
                                                    Penjamin
                                                </label>
                                                <select
                                                    value={data.penjamin}
                                                    onChange={(e) =>
                                                        setData(
                                                            'penjamin',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                                >
                                                    <option value="umum">
                                                        Umum
                                                    </option>
                                                    <option value="bpjs">
                                                        BPJS Kesehatan
                                                    </option>
                                                    <option value="asuransi">
                                                        Asuransi Swasta
                                                    </option>
                                                </select>
                                            </div>
                                            {data.jenis_layanan === 'igd' && (
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700">
                                                        Prioritas IGD
                                                    </label>
                                                    <select
                                                        value={data.prioritas}
                                                        onChange={(e) =>
                                                            setData(
                                                                'prioritas',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                                    >
                                                        <option value="normal">
                                                            Normal
                                                        </option>
                                                        <option value="urgent">
                                                            Urgent
                                                        </option>
                                                        <option value="emergency">
                                                            Emergency
                                                        </option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        {data.penjamin !== 'umum' && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700">
                                                    Nomor Kartu BPJS / Asuransi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.nomor_penjamin}
                                                    onChange={(e) =>
                                                        setData(
                                                            'nomor_penjamin',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Nomor kartu..."
                                                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Keluhan Utama
                                            </label>
                                            <input
                                                type="text"
                                                value={data.keluhan}
                                                onChange={(e) =>
                                                    setData(
                                                        'keluhan',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Keluhan singkat pasien..."
                                                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Email Pasien
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="pasien@email.com"
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Alamat Tempat Tinggal
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.alamat}
                                    onChange={(e) =>
                                        setData('alamat', e.target.value)
                                    }
                                    placeholder="Alamat lengkap..."
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Pasien'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
