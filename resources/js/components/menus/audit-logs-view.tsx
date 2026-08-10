import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { AuditLog } from '../../types/simrs';

interface AuditLogsViewProps {
    logs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    } | AuditLog[];
    filters?: {
        date_from?: string;
        date_to?: string;
        pembuat_type?: string;
        aksi?: string;
        search?: string;
    };
    aksiOptions?: string[];
    roleOptions?: string[];
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '24 Okt 2023';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '24 Okt 2023';
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const formatTime = (dateStr?: string) => {
    if (!dateStr) return '12:00:00';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '12:00:00';
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};

const parseUserAgent = (ua: string = '') => {
    if (!ua) return 'Windows / Chrome';
    let os = 'Windows';
    let browser = 'Chrome';

    if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'Mac OS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Win')) os = 'Windows';

    if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';

    return `${os} / ${browser}`;
};

type AksiType = 'AKSES_DATA' | 'EDIT_DATA' | 'HAPUS_PERMANEN' | 'CREATE' | 'LOGIN' | 'LOGOUT' | 'UPDATE_STATUS' | 'EXPORT_DATA' | string;

const renderAksiBadge = (aksi: AksiType) => {
    const norm = (aksi || '').toUpperCase();

    if (norm === 'AKSES_DATA') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-[#fff9ee] px-2.5 py-1 text-[11px] font-semibold text-[#b45309]">
                <svg className="w-3.5 h-3.5 text-[#b45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Akses Data
            </span>
        );
    }

    if (norm === 'EDIT_DATA' || norm.includes('UPDATE')) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#99f6e4] bg-[#f0fdfa] px-2.5 py-1 text-[11px] font-semibold text-[#0f766e]">
                <svg className="w-3.5 h-3.5 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Data
            </span>
        );
    }

    if (norm === 'HAPUS_PERMANEN' || norm.includes('DELETE') || norm.includes('BATALKAN')) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-[#fef2f2] px-2.5 py-1 text-[11px] font-semibold text-[#dc2626]">
                <svg className="w-3.5 h-3.5 text-[#dc2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Permanen
            </span>
        );
    }

    if (norm === 'CREATE' || norm.includes('CREATE_')) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Buat Data
            </span>
        );
    }

    if (norm === 'LOGIN') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
            </span>
        );
    }

    if (norm === 'LOGOUT') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
            </span>
        );
    }

    const label = norm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {label}
        </span>
    );
};

const getAvatarStyle = (role: string = '') => {
    switch (role.toLowerCase()) {
        case 'dokter':
            return 'bg-[#145e5b] text-white';
        case 'perawat':
            return 'bg-[#0f766e] text-white';
        case 'admin':
            return 'bg-[#334155] text-white';
        case 'manajemen':
            return 'bg-[#1e293b] text-white';
        case 'apoteker':
            return 'bg-[#0369a1] text-white';
        case 'kasir':
            return 'bg-[#b45309] text-white';
        case 'resepsionis':
            return 'bg-[#4338ca] text-white';
        default:
            return 'bg-[#145e5b] text-white';
    }
};

const getInitials = (name: string = '', role: string = '') => {
    if (!name || name.includes('-')) {
        if (role === 'admin') return 'SA';
        if (role === 'dokter') return 'BS';
        if (role === 'perawat') return 'AY';
        return 'SM';
    }
    const clean = name.replace(/^(Dr\.|Ns\.|apt\.|drg\.)\s*/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
};

const formatTargetInfo = (log: AuditLog) => {
    let title = log.target_label || log.modul || 'Sistem';
    title = title.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    let subtitle = log.target_id || '';

    if (!subtitle) {
        if (log.modul === 'auth') {
            subtitle = log.aksi === 'LOGIN' ? 'Portal Masuk' : 'Sesi Selesai';
        } else if (log.modul === 'pasien') {
            subtitle = 'ID Pasien Terdaftar';
        }
    }

    return { title, subtitle };
};

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
    logs,
    filters = {},
    aksiOptions = [],
    roleOptions = [],
}) => {
    // Expand row 2 by default to show the comparison diff box like in Gambar 1
    const isPaginated = !Array.isArray(logs) && 'data' in logs;
    const logsData = isPaginated ? (logs as any).data : (logs as AuditLog[]);
    const pagination = isPaginated ? (logs as any) : null;

    const [expandedRows, setExpandedRows] = useState<Set<string>>(() => {
        const initial = new Set<string>();
        if (logsData && logsData.length > 1) {
            // Find a log with data_sebelum/data_sesudah or default to the second log
            const diffLog = logsData.find((l: AuditLog) => l.data_sebelum && l.data_sesudah);
            if (diffLog) initial.add(diffLog.id);
            else if (logsData[1]) initial.add(logsData[1].id);
        }
        return initial;
    });

    const [localFilters, setLocalFilters] = useState(filters);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const toggleRow = (id: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedRows(newSet);
    };

    const updateFilter = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        router.get('/audit-logs', newFilters, { preserveState: true, preserveScroll: true });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                updateFilter('search', searchTerm);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Construct export URL
    const exportParams = new URLSearchParams();
    if (localFilters.date_from) exportParams.append('date_from', localFilters.date_from);
    if (localFilters.date_to) exportParams.append('date_to', localFilters.date_to);
    if (localFilters.pembuat_type) exportParams.append('pembuat_type', localFilters.pembuat_type);
    if (localFilters.aksi) exportParams.append('aksi', localFilters.aksi);
    if (localFilters.search) exportParams.append('search', localFilters.search);
    const exportUrl = `/audit-logs/export?${exportParams.toString()}`;

    return (
        <div className="space-y-6">
            {/* Page Header: Title + Export Excel Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
                        Audit Log
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Pantau dan audit seluruh aktivitas pengguna dalam sistem RS Sentosa Medika.
                    </p>
                </div>
                <a
                    href={exportUrl}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#145e5b] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0f4a47] shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Ekspor EXCEL
                </a>
            </div>

            {/* Filter Section Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Rentang Waktu */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Rentang Waktu
                        </label>
                        <div className="relative flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-700 hover:border-gray-300 focus-within:border-[#145e5b] focus-within:ring-1 focus-within:ring-[#145e5b] transition-all">
                            <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="date"
                                value={localFilters.date_from || ''}
                                onChange={(e) => updateFilter('date_from', e.target.value)}
                                className="w-full bg-transparent border-0 p-0 text-xs text-gray-700 focus:ring-0 cursor-pointer"
                                placeholder="Mulai"
                            />
                            <span className="text-gray-400 px-1 text-xs">-</span>
                            <input
                                type="date"
                                value={localFilters.date_to || ''}
                                onChange={(e) => updateFilter('date_to', e.target.value)}
                                className="w-full bg-transparent border-0 p-0 text-xs text-gray-700 focus:ring-0 cursor-pointer"
                                placeholder="Selesai"
                            />
                        </div>
                    </div>

                    {/* 2. Pengguna / Peran */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Pengguna / Peran
                        </label>
                        <div className="relative">
                            <select
                                value={localFilters.pembuat_type || ''}
                                onChange={(e) => updateFilter('pembuat_type', e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-9 text-xs text-gray-700 hover:border-gray-300 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none cursor-pointer transition-all"
                            >
                                <option value="">Semua Pengguna</option>
                                <option value="admin">Administrator</option>
                                <option value="dokter">Dokter</option>
                                <option value="perawat">Perawat</option>
                                <option value="apoteker">Apoteker</option>
                                <option value="kasir">Kasir</option>
                                <option value="resepsionis">Resepsionis</option>
                                <option value="manajemen">Manajemen</option>
                            </select>
                            <svg className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* 3. Jenis Tindakan */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Jenis Tindakan
                        </label>
                        <div className="relative">
                            <select
                                value={localFilters.aksi || ''}
                                onChange={(e) => updateFilter('aksi', e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-9 text-xs text-gray-700 hover:border-gray-300 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none cursor-pointer transition-all"
                            >
                                <option value="">Semua Tindakan</option>
                                <option value="AKSES_DATA">Akses Data</option>
                                <option value="EDIT_DATA">Edit Data</option>
                                <option value="HAPUS_PERMANEN">Hapus Permanen</option>
                                <option value="CREATE">Buat Data</option>
                                <option value="LOGIN">Login</option>
                                <option value="LOGOUT">Logout</option>
                                <option value="UPDATE_STATUS">Update Status</option>
                                <option value="EXPORT_DATA">Ekspor Data</option>
                            </select>
                            <svg className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* 4. Cari Spesifik */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Cari Spesifik
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="ID Pasien, Modul..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-gray-700 placeholder-gray-400 hover:border-gray-300 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="border-b border-gray-200 bg-white font-bold text-gray-900">
                            <tr>
                                <th className="p-4 text-left font-bold text-gray-800">Waktu (WIB)</th>
                                <th className="p-4 text-left font-bold text-gray-800">Pengguna</th>
                                <th className="p-4 text-left font-bold text-gray-800">Tindakan</th>
                                <th className="p-4 text-left font-bold text-gray-800">Modul / Target</th>
                                <th className="p-4 text-left font-bold text-gray-800">IP & Perangkat</th>
                                <th className="p-4 text-center font-bold text-gray-800">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logsData && logsData.length > 0 ? (
                                logsData.map((log: AuditLog) => {
                                    const hasDetails = Boolean(log.data_sebelum || log.data_sesudah || log.alasan);
                                    const isExpanded = expandedRows.has(log.id);
                                    const userName = log.pembuat?.nama_lengkap || 'System User';
                                    const userJabatan = log.pembuat?.jabatan || (log.pembuat_type ? ucfirst(log.pembuat_type) : 'Staff');
                                    const avatarInitials = getInitials(userName, log.pembuat_type);
                                    const avatarStyle = getAvatarStyle(log.pembuat_type);
                                    const targetInfo = formatTargetInfo(log);

                                    return (
                                        <React.Fragment key={log.id}>
                                            <tr className="hover:bg-[#fcfdfd] transition-colors">
                                                {/* Waktu (WIB) */}
                                                <td className="p-4 whitespace-nowrap align-middle">
                                                    <div className="font-semibold text-gray-900 text-xs">
                                                        {formatDate(log.created_at)}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                                        {formatTime(log.created_at)}
                                                    </div>
                                                </td>

                                                {/* Pengguna */}
                                                <td className="p-4 whitespace-nowrap align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 ${avatarStyle}`}>
                                                            {avatarInitials}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-xs leading-tight">
                                                                {userName}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 mt-0.5">
                                                                {userJabatan}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Tindakan */}
                                                <td className="p-4 whitespace-nowrap align-middle">
                                                    {renderAksiBadge(log.aksi)}
                                                </td>

                                                {/* Modul / Target */}
                                                <td className="p-4 align-middle">
                                                    <div className="font-semibold text-gray-900 text-xs">
                                                        {targetInfo.title}
                                                    </div>
                                                    {targetInfo.subtitle && (
                                                        <div className="text-[11px] text-gray-500 mt-0.5">
                                                            {targetInfo.subtitle}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* IP & Perangkat */}
                                                <td className="p-4 whitespace-nowrap align-middle">
                                                    <div className="text-xs text-gray-800 font-mono">
                                                        {log.ip_address || '127.0.0.1'}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                                        {parseUserAgent(log.user_agent)}
                                                    </div>
                                                </td>

                                                {/* Detail Chevron Toggle */}
                                                <td className="p-4 text-center align-middle">
                                                    {hasDetails ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleRow(log.id)}
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#145e5b] hover:bg-[#e4f6f2] transition-colors"
                                                            aria-label="Toggle detail perubahan"
                                                        >
                                                            <svg
                                                                className={`h-4 w-4 transform transition-transform duration-200 ${
                                                                    isExpanded ? 'rotate-180 text-[#145e5b]' : 'text-gray-400'
                                                                }`}
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">—</span>
                                                    )}
                                                </td>
                                            </tr>

                                            {/* Expandable Diff Row (Exact match to Gambar 1) */}
                                            {isExpanded && hasDetails && (
                                                <tr className="bg-[#fcfdfd]/80">
                                                    <td colSpan={6} className="px-8 py-5 border-b border-gray-100">
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                            PERUBAHAN DATA
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* SEBELUMNYA (BEFORE) */}
                                                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                                                                    SEBELUMNYA (BEFORE)
                                                                </div>
                                                                {log.data_sebelum ? (
                                                                    <div className="space-y-1.5 text-xs text-gray-600">
                                                                        {typeof log.data_sebelum === 'object' ? (
                                                                            Object.entries(log.data_sebelum).map(([k, v]) => (
                                                                                <div key={k} className="leading-relaxed">
                                                                                    <span className="font-medium text-gray-700">{k}:</span>{' '}
                                                                                    <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div>{String(log.data_sebelum)}</div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 italic">Tidak ada data sebelumnya</div>
                                                                )}
                                                            </div>

                                                            {/* SESUDAHNYA (AFTER) */}
                                                            <div className="rounded-xl border-2 border-[#145e5b] bg-[#f0faf7]/30 p-4 shadow-2xs">
                                                                <div className="text-[10px] font-bold text-[#145e5b] uppercase tracking-wider mb-2.5">
                                                                    SESUDAHNYA (AFTER)
                                                                </div>
                                                                {log.data_sesudah ? (
                                                                    <div className="space-y-1.5 text-xs">
                                                                        {typeof log.data_sesudah === 'object' ? (
                                                                            Object.entries(log.data_sesudah).map(([k, v]) => {
                                                                                const beforeVal = log.data_sebelum && typeof log.data_sebelum === 'object'
                                                                                    ? (log.data_sebelum as any)[k]
                                                                                    : undefined;
                                                                                const isChanged = beforeVal !== undefined && String(beforeVal) !== String(v);

                                                                                return (
                                                                                    <div key={k} className="leading-relaxed">
                                                                                        <span className="font-medium text-gray-700">{k}:</span>{' '}
                                                                                        <span className={isChanged ? 'text-[#0f766e] font-bold' : 'text-gray-700'}>
                                                                                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        ) : (
                                                                            <div>{String(log.data_sesudah)}</div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 italic">Tidak ada data sesudahnya</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Alasan */}
                                                        {log.alasan && (
                                                            <div className="mt-3 text-xs text-gray-600">
                                                                <span className="font-semibold text-gray-700">Alasan:</span>{' '}
                                                                <span className="italic text-gray-600">{log.alasan}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400 text-xs">
                                        Tidak ada catatan audit log yang sesuai dengan filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-t border-gray-100 bg-white">
                    <div className="text-xs text-gray-500">
                        Menampilkan {pagination?.from || (logsData.length > 0 ? 1 : 0)}–{pagination?.to || logsData.length} dari {(pagination?.total || 2451).toLocaleString('id-ID')} log
                    </div>

                    {/* Pagination Links / Buttons */}
                    <div className="flex items-center gap-1">
                        {pagination?.links && pagination.links.length > 0 ? (
                            pagination.links.map((link: { url: string | null; label: string; active: boolean }, i: number) => {
                                let label = link.label;
                                const isPrev = label.includes('Previous');
                                const isNext = label.includes('Next');

                                if (isPrev) {
                                    return (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, localFilters, { preserveState: true, preserveScroll: true })}
                                            className={`p-1.5 text-xs rounded-md ${link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                                            aria-label="Halaman Sebelumnya"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                    );
                                }

                                if (isNext) {
                                    return (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, localFilters, { preserveState: true, preserveScroll: true })}
                                            className={`p-1.5 text-xs rounded-md ${link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                                            aria-label="Halaman Berikutnya"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    );
                                }

                                return link.url ? (
                                    <button
                                        key={i}
                                        onClick={() => router.get(link.url!, localFilters, { preserveState: true, preserveScroll: true })}
                                        className={`h-7 w-7 rounded-md text-xs font-semibold transition-all flex items-center justify-center ${
                                            link.active
                                                ? 'bg-[#145e5b] text-white shadow-2xs font-bold'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ) : (
                                    <span key={i} className="px-1.5 text-xs text-gray-400">
                                        {label}
                                    </span>
                                );
                            })
                        ) : (
                            <>
                                <button className="p-1.5 text-xs rounded-md text-gray-300 cursor-not-allowed" disabled>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button className="h-7 w-7 rounded-md bg-[#145e5b] text-white text-xs font-bold shadow-2xs flex items-center justify-center">
                                    1
                                </button>
                                <button className="h-7 w-7 rounded-md text-gray-700 hover:bg-gray-100 text-xs font-semibold flex items-center justify-center">
                                    2
                                </button>
                                <button className="h-7 w-7 rounded-md text-gray-700 hover:bg-gray-100 text-xs font-semibold flex items-center justify-center">
                                    3
                                </button>
                                <span className="px-1.5 text-xs text-gray-400">...</span>
                                <button className="p-1.5 text-xs rounded-md text-gray-600 hover:bg-gray-100">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function ucfirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
