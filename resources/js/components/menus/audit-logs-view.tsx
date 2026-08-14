import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { AuditLog } from '../../types/simrs';

interface AuditLogsViewProps {
    logs:
        | {
              data: AuditLog[];
              current_page: number;
              last_page: number;
              per_page: number;
              total: number;
              from: number;
              to: number;
              links: Array<{
                  url: string | null;
                  label: string;
                  active: boolean;
              }>;
          }
        | AuditLog[];
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

type AksiType =
    | 'AKSES_DATA'
    | 'EDIT_DATA'
    | 'HAPUS_PERMANEN'
    | 'CREATE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'UPDATE_STATUS'
    | 'EXPORT_DATA'
    | string;

const renderAksiBadge = (aksi: AksiType) => {
    const norm = (aksi || '').toUpperCase();

    if (norm === 'AKSES_DATA') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-[#fff9ee] px-2.5 py-1 text-[11px] font-semibold text-[#b45309]">
                <svg
                    className="h-3.5 w-3.5 text-[#b45309]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                </svg>
                Akses Data
            </span>
        );
    }

    if (norm === 'EDIT_DATA' || norm.includes('UPDATE')) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#99f6e4] bg-[#f0fdfa] px-2.5 py-1 text-[11px] font-semibold text-[#0f766e]">
                <svg
                    className="h-3.5 w-3.5 text-[#0f766e]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                </svg>
                Edit Data
            </span>
        );
    }

    if (
        norm === 'HAPUS_PERMANEN' ||
        norm.includes('DELETE') ||
        norm.includes('BATALKAN')
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-[#fef2f2] px-2.5 py-1 text-[11px] font-semibold text-[#dc2626]">
                <svg
                    className="h-3.5 w-3.5 text-[#dc2626]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
                Hapus Permanen
            </span>
        );
    }

    if (norm === 'CREATE' || norm.includes('CREATE_')) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <svg
                    className="h-3.5 w-3.5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                Buat Data
            </span>
        );
    }

    if (norm === 'LOGIN') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                <svg
                    className="h-3.5 w-3.5 text-sky-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                </svg>
                Login
            </span>
        );
    }

    if (norm === 'LOGOUT') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                <svg
                    className="h-3.5 w-3.5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                </svg>
                Logout
            </span>
        );
    }

    const label = norm
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
            <svg
                className="h-3.5 w-3.5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
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
    title = title.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

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

// Map common database keys to human-friendly Indonesian labels
const FIELD_LABELS: Record<string, string> = {
    id: 'ID Data / Rekam',
    nomor_rekam_medis: 'No. Rekam Medis',
    no_rm: 'No. Rekam Medis',
    nama_lengkap: 'Nama Lengkap',
    nama: 'Nama Lengkap',
    nik: 'NIK (No. KTP)',
    tanggal_lahir: 'Tanggal Lahir',
    tgl_lahir: 'Tanggal Lahir',
    jenis_kelamin: 'Jenis Kelamin',
    golongan_darah: 'Golongan Darah',
    gol_darah: 'Golongan Darah',
    alamat: 'Alamat Domisili',
    provinsi: 'Provinsi',
    kota_kabupaten: 'Kota / Kabupaten',
    no_hp: 'No. Handphone / WA',
    no_telp: 'No. Telepon',
    email: 'Email',
    riwayat_penyakit: 'Riwayat Penyakit',
    kondisi_terakhir: 'Kondisi Terakhir',
    status_akun: 'Status Akun',
    status_aktif: 'Status Aktif',
    status: 'Status',
    nomor_pendaftaran: 'No. Pendaftaran',
    no_pendaftaran: 'No. Pendaftaran',
    jenis_layanan: 'Jenis Layanan',
    status_pendaftaran: 'Status Pendaftaran',
    dokter_id: 'ID Dokter',
    poli_id: 'ID Poli',
    ruangan_id: 'ID Ruangan',
    tanggal_pendaftaran: 'Tanggal Pendaftaran',
    keluhan: 'Keluhan Pasien',
    penjamin: 'Jenis Penjamin',
    nomor_penjamin: 'No. Kartu Penjamin / BPJS',
    prioritas: 'Prioritas Antrian',
    catatan_pendaftaran: 'Catatan Pendaftaran',
    tipe_pendaftar: 'Tipe Pendaftar',
    nama_kontak_darurat: 'Kontak Darurat',
    no_hp_kontak_darurat: 'No. HP Kontak Darurat',
    alergi: 'Riwayat Alergi',
    shift: 'Jadwal Shift',
    tekanan_darah: 'Tekanan Darah',
    suhu: 'Suhu Tubuh',
    resep: 'No. Resep',
    obat: 'Daftar Obat',
    invoice: 'No. Invoice / Tagihan',
    total_tagihan: 'Total Tagihan',
    metode: 'Metode Pembayaran',
    antrian: 'No. Antrian',
    laporan: 'Nama Laporan',
    format: 'Format File',
    periode: 'Periode Waktu',
    sesi: 'Sesi Login',
    role: 'Peran / Hak Akses',
    jabatan: 'Jabatan',
    created_at: 'Waktu Dibuat',
    updated_at: 'Waktu Diperbarui',
    deleted_at: 'Waktu Dihapus',
    updated_fields: 'Kolom Diperbarui',
    description: 'Keterangan',
};

const formatFieldLabel = (key: string): string => {
    const lower = key.toLowerCase();
    if (FIELD_LABELS[lower]) return FIELD_LABELS[lower];
    if (FIELD_LABELS[key]) return FIELD_LABELS[key];
    return key
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const parseAuditData = (raw: any): Record<string, any> | null => {
    if (!raw) return null;
    if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
    if (Array.isArray(raw)) {
        const obj: Record<string, any> = {};
        raw.forEach((item, idx) => {
            obj[`Item ${idx + 1}`] = item;
        });
        return obj;
    }
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (
            (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))
        ) {
            try {
                let parsed = JSON.parse(trimmed);
                if (typeof parsed === 'string') {
                    try {
                        parsed = JSON.parse(parsed);
                    } catch {}
                }
                if (typeof parsed === 'object' && parsed !== null) {
                    return parseAuditData(parsed);
                }
            } catch {}
        }
        return { Keterangan: raw };
    }
    return { Nilai: String(raw) };
};

const formatValueDisplay = (val: any): React.ReactNode => {
    if (val === null || val === undefined || val === '') {
        return (
            <span className="inline-flex items-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-400 italic">
                null
            </span>
        );
    }

    if (typeof val === 'boolean') {
        return val ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                ✓ Ya
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                ✕ Tidak
            </span>
        );
    }

    if (typeof val === 'object') {
        if (Array.isArray(val)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {val.map((item, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow-2xs"
                        >
                            {typeof item === 'object'
                                ? JSON.stringify(item)
                                : String(item)}
                        </span>
                    ))}
                </div>
            );
        }
        return (
            <pre className="max-h-28 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-2 font-mono text-[11px] text-gray-700">
                {JSON.stringify(val, null, 2)}
            </pre>
        );
    }

    const strVal = String(val);

    // Check if ISO Date string e.g. 2010-09-14T00:00:00.000000Z or 2026-08-10T01:03:26.000000Z
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(strVal)) {
        const dateObj = new Date(strVal);
        if (!isNaN(dateObj.getTime())) {
            const hasTime =
                !strVal.endsWith('T00:00:00.000000Z') &&
                !strVal.endsWith('T00:00:00Z') &&
                strVal.includes('T');
            const formatted = hasTime
                ? dateObj.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                  }) +
                  ', ' +
                  dateObj.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                  }) +
                  ' WIB'
                : dateObj.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                  });

            return (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-gray-800">
                    <svg
                        className="h-3.5 w-3.5 shrink-0 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    {formatted}
                </span>
            );
        }
    }

    const lowerVal = strVal.toLowerCase();

    // Badges for common statuses
    if (
        ['aktif', 'active', 'selesai', 'paid', 'sukses', 'success'].includes(
            lowerVal,
        )
    ) {
        return (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                ✓ {strVal}
            </span>
        );
    }
    if (
        ['menunggu', 'pending', 'unpaid', 'disiapkan', 'proses'].includes(
            lowerVal,
        )
    ) {
        return (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                ⏱ {strVal}
            </span>
        );
    }
    if (
        [
            'batal',
            'nonaktif',
            'inactive',
            'dibatalkan',
            'deleted',
            'hapus permanen',
        ].includes(lowerVal)
    ) {
        return (
            <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                ✕ {strVal}
            </span>
        );
    }
    if (['bpjs', 'asuransi'].includes(lowerVal)) {
        return (
            <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                {strVal.toUpperCase()}
            </span>
        );
    }
    if (['igd', 'emergency'].includes(lowerVal)) {
        return (
            <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                {strVal.toUpperCase()}
            </span>
        );
    }

    return (
        <span className="text-xs font-medium break-words text-gray-800">
            {strVal}
        </span>
    );
};

const isEqualValue = (a: any, b: any): boolean => {
    if (a === b) return true;

    // Treat null, undefined, empty string, or "null" string as equivalent
    const isEmptyA = a === null || a === undefined || a === '' || a === 'null';
    const isEmptyB = b === null || b === undefined || b === '' || b === 'null';
    if (isEmptyA && isEmptyB) return true;
    if (isEmptyA !== isEmptyB) return false;

    // Numbers vs numeric strings
    if (
        (typeof a === 'number' || typeof a === 'string') &&
        (typeof b === 'number' || typeof b === 'string')
    ) {
        const strA = String(a).trim();
        const strB = String(b).trim();
        if (strA === strB) return true;
        const numA = Number(strA);
        const numB = Number(strB);
        if (!isNaN(numA) && !isNaN(numB) && numA === numB) return true;
    }

    // Booleans
    const boolA = a === true || a === 1 || a === '1' || a === 'true';
    const boolB = b === true || b === 1 || b === '1' || b === 'true';
    const isFalseA = a === false || a === 0 || a === '0' || a === 'false';
    const isFalseB = b === false || b === 0 || b === '0' || b === 'false';
    if (boolA && boolB) return true;
    if (isFalseA && isFalseB) return true;

    // Dates
    if (typeof a === 'string' && typeof b === 'string') {
        const dateA = new Date(a);
        const dateB = new Date(b);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            if (dateA.getTime() === dateB.getTime()) return true;
            if (
                dateA.toISOString().slice(0, 10) ===
                    dateB.toISOString().slice(0, 10) &&
                (a.includes('00:00:00') ||
                    b.includes('00:00:00') ||
                    !a.includes(':') ||
                    !b.includes(':'))
            ) {
                return true;
            }
        }
        if (a.trim() === b.trim()) return true;
    }

    // Objects / Arrays deep comparison
    if (
        typeof a === 'object' &&
        typeof b === 'object' &&
        a !== null &&
        b !== null
    ) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    return String(a).trim() === String(b).trim();
};

const TECHNICAL_NOISE_KEYS = new Set([
    'updated_at',
    'created_at',
    'deleted_at',
    'id',
]);

interface DiffItem {
    key: string;
    label: string;
    beforeVal: any;
    afterVal: any;
    status: 'added' | 'removed' | 'changed' | 'unchanged';
}

const AuditDataDiffViewer: React.FC<{ log: AuditLog }> = ({ log }) => {
    const [viewMode, setViewMode] = useState<'side-by-side' | 'table' | 'json'>(
        'side-by-side',
    );
    const [copiedBefore, setCopiedBefore] = useState(false);
    const [copiedAfter, setCopiedAfter] = useState(false);

    const beforeObj = parseAuditData(log.data_sebelum);
    const afterObj = parseAuditData(log.data_sesudah);

    const allKeys = Array.from(
        new Set([
            ...(beforeObj ? Object.keys(beforeObj) : []),
            ...(afterObj ? Object.keys(afterObj) : []),
        ]),
    );

    const diffItems: DiffItem[] = allKeys.map((k) => {
        const hasBefore =
            beforeObj && Object.prototype.hasOwnProperty.call(beforeObj, k);
        const hasAfter =
            afterObj && Object.prototype.hasOwnProperty.call(afterObj, k);
        const beforeVal = hasBefore ? beforeObj[k] : undefined;
        const afterVal = hasAfter ? afterObj[k] : undefined;

        let status: 'added' | 'removed' | 'changed' | 'unchanged' = 'unchanged';

        if (!hasBefore && hasAfter) {
            status = 'added';
        } else if (hasBefore && !hasAfter) {
            status = 'removed';
        } else if (!isEqualValue(beforeVal, afterVal)) {
            status = 'changed';
        }

        return {
            key: k,
            label: formatFieldLabel(k),
            beforeVal,
            afterVal,
            status,
        };
    });

    // Extract all items that actually differ
    const rawChangedItems = diffItems.filter((d) => d.status !== 'unchanged');

    // Filter out technical noise keys (updated_at/created_at) if actual business fields changed
    const businessChanges = rawChangedItems.filter(
        (d) => !TECHNICAL_NOISE_KEYS.has(d.key.toLowerCase()),
    );
    const finalChanges =
        businessChanges.length > 0 ? businessChanges : rawChangedItems;

    const changedCount = finalChanges.filter(
        (d) => d.status === 'changed',
    ).length;
    const addedCount = finalChanges.filter((d) => d.status === 'added').length;
    const removedCount = finalChanges.filter(
        (d) => d.status === 'removed',
    ).length;
    const totalChanges = changedCount + addedCount + removedCount;

    // STRICTLY display ONLY changed, added, or removed items (never display unchanged data)
    const displayedItems =
        totalChanges > 0
            ? finalChanges
            : (beforeObj && !afterObj) || (!beforeObj && afterObj)
              ? diffItems
              : [];

    const beforeFilteredObj = beforeObj
        ? Object.fromEntries(
              displayedItems
                  .filter((item) => item.beforeVal !== undefined)
                  .map((item) => [item.key, item.beforeVal]),
          )
        : null;

    const afterFilteredObj = afterObj
        ? Object.fromEntries(
              displayedItems
                  .filter((item) => item.afterVal !== undefined)
                  .map((item) => [item.key, item.afterVal]),
          )
        : null;

    const copyToClipboard = (text: string, isBefore: boolean) => {
        navigator.clipboard.writeText(text);
        if (isBefore) {
            setCopiedBefore(true);
            setTimeout(() => setCopiedBefore(false), 2000);
        } else {
            setCopiedAfter(true);
            setTimeout(() => setCopiedAfter(false), 2000);
        }
    };

    return (
        <div className="space-y-4">
            {/* Top Toolbar: Title, stats chips & view switcher */}
            <div className="flex flex-col gap-3 border-b border-gray-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-800 uppercase">
                        <svg
                            className="h-4 w-4 text-[#145e5b]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                        </svg>
                        Perubahan Data
                    </span>

                    {/* Stats pills */}
                    {totalChanges > 0 ? (
                        <div className="flex items-center gap-1.5">
                            {changedCount > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500"></span>
                                    {changedCount} Kolom Diubah
                                </span>
                            )}
                            {addedCount > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                    +{addedCount} Ditambah
                                </span>
                            )}
                            {removedCount > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
                                    -{removedCount} Dihapus
                                </span>
                            )}
                            <span className="text-[11px] font-medium text-gray-400">
                                (Hanya menampilkan kolom yang berubah)
                            </span>
                        </div>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600">
                            Tidak ada perubahan nilai
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* View mode switcher */}
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50/80 p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('side-by-side')}
                            className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-all ${
                                viewMode === 'side-by-side'
                                    ? 'bg-white font-bold text-gray-900 shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                                />
                            </svg>
                            Berdampingan
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-all ${
                                viewMode === 'table'
                                    ? 'bg-white font-bold text-gray-900 shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            Tabel Diff
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('json')}
                            className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-all ${
                                viewMode === 'json'
                                    ? 'bg-white font-bold text-gray-900 shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                />
                            </svg>
                            JSON Mentah
                        </button>
                    </div>
                </div>
            </div>

            {/* Empty changes state */}
            {displayedItems.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-6 text-center text-xs text-gray-500">
                    Tidak ada perubahan kolom yang terdeteksi antara data
                    sebelum dan sesudah.
                </div>
            )}

            {displayedItems.length > 0 && (
                <>
                    {/* View Mode 1: Berdampingan (Side by Side) */}
                    {viewMode === 'side-by-side' && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* SEBELUMNYA (BEFORE) */}
                            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                                            ←
                                        </span>
                                        <span className="text-xs font-bold tracking-wider text-slate-800">
                                            SEBELUMNYA (BEFORE)
                                        </span>
                                    </div>
                                    <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                                        Nilai Lama
                                    </span>
                                </div>

                                <div className="flex-1 p-4">
                                    {beforeObj &&
                                    Object.keys(beforeObj).length > 0 ? (
                                        <div className="space-y-2.5">
                                            {displayedItems.map((item) => {
                                                const isChanged =
                                                    item.status === 'changed';
                                                const isRemoved =
                                                    item.status === 'removed';
                                                const isMissing =
                                                    item.beforeVal ===
                                                    undefined;

                                                return (
                                                    <div
                                                        key={item.key}
                                                        className={`rounded-xl border p-3.5 transition-colors ${
                                                            isChanged
                                                                ? 'border-rose-200 bg-rose-50/50 ring-1 ring-rose-300/30'
                                                                : isRemoved
                                                                  ? 'border-red-200 bg-red-50/50'
                                                                  : 'border-gray-100 bg-gray-50/60'
                                                        }`}
                                                    >
                                                        <div className="mb-1.5 flex items-center justify-between gap-2">
                                                            <span className="text-xs font-bold text-slate-700">
                                                                {item.label}
                                                            </span>
                                                            {isChanged && (
                                                                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-800 uppercase">
                                                                    Lama
                                                                </span>
                                                            )}
                                                            {isRemoved && (
                                                                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-red-800 uppercase">
                                                                    Dihapus
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs font-medium break-words text-gray-800">
                                                            {isMissing ? (
                                                                <span className="rounded border border-dashed border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[11px] text-gray-400 italic">
                                                                    (Tidak ada)
                                                                </span>
                                                            ) : (
                                                                formatValueDisplay(
                                                                    item.beforeVal,
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex h-full min-h-[120px] flex-col items-center justify-center p-6 text-center text-gray-400">
                                            <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 4v16m8-8H4"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-semibold text-gray-700">
                                                Entri Baru Dibuat
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-gray-400">
                                                Tidak ada data sebelum perubahan
                                                ini.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SESUDAHNYA (AFTER) */}
                            <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-[#145e5b] bg-white shadow-xs">
                                <div className="flex items-center justify-between bg-[#145e5b] px-4 py-3 text-white">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                                            ✓
                                        </span>
                                        <span className="text-xs font-bold tracking-wider text-white">
                                            SESUDAHNYA (AFTER)
                                        </span>
                                    </div>
                                    <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold text-emerald-100 uppercase">
                                        Nilai Baru
                                    </span>
                                </div>

                                <div className="flex-1 p-4">
                                    {afterObj &&
                                    Object.keys(afterObj).length > 0 ? (
                                        <div className="space-y-2.5">
                                            {displayedItems.map((item) => {
                                                const isChanged =
                                                    item.status === 'changed';
                                                const isAdded =
                                                    item.status === 'added';
                                                const isMissing =
                                                    item.afterVal === undefined;

                                                return (
                                                    <div
                                                        key={item.key}
                                                        className={`rounded-xl border p-3.5 transition-colors ${
                                                            isChanged
                                                                ? 'border-emerald-300 bg-[#eef9f5] ring-1 ring-[#145e5b]/15'
                                                                : isAdded
                                                                  ? 'border-emerald-200 bg-emerald-50/60'
                                                                  : 'border-gray-100 bg-gray-50/60'
                                                        }`}
                                                    >
                                                        <div className="mb-1.5 flex items-center justify-between gap-2">
                                                            <span className="text-xs font-bold text-gray-800">
                                                                {item.label}
                                                            </span>
                                                            {isChanged && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#0f766e] uppercase">
                                                                    ✓ Diperbarui
                                                                </span>
                                                            )}
                                                            {isAdded && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#0f766e] uppercase">
                                                                    + Ditambah
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs font-medium break-words text-gray-900">
                                                            {isMissing ? (
                                                                <span className="rounded border border-dashed border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[11px] text-red-500 italic">
                                                                    (Dihapus)
                                                                </span>
                                                            ) : (
                                                                formatValueDisplay(
                                                                    item.afterVal,
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex h-full min-h-[120px] flex-col items-center justify-center p-6 text-center text-gray-400">
                                            <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-semibold text-gray-700">
                                                Data Dihapus Permanen
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-gray-400">
                                                Data telah dihilangkan dari
                                                sistem.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View Mode 2: Tabel Diff (Diff Table) */}
                    {viewMode === 'table' && (
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-700">
                                    <tr>
                                        <th className="w-1/4 p-3.5">
                                            Kolom / Atribut
                                        </th>
                                        <th className="w-1/3 p-3.5">
                                            Sebelumnya (Lama)
                                        </th>
                                        <th className="w-10 p-3.5 text-center"></th>
                                        <th className="w-1/3 p-3.5">
                                            Sesudahnya (Baru)
                                        </th>
                                        <th className="p-3.5 text-center">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayedItems.map((item) => {
                                        const isChanged =
                                            item.status === 'changed';
                                        const isAdded = item.status === 'added';
                                        const isRemoved =
                                            item.status === 'removed';

                                        return (
                                            <tr
                                                key={item.key}
                                                className={`transition-colors ${
                                                    isChanged
                                                        ? 'bg-amber-50/40 hover:bg-amber-50/60'
                                                        : isAdded
                                                          ? 'bg-emerald-50/40 hover:bg-emerald-50/60'
                                                          : isRemoved
                                                            ? 'bg-red-50/40 hover:bg-red-50/60'
                                                            : 'hover:bg-gray-50/50'
                                                }`}
                                            >
                                                <td className="p-3.5 align-top">
                                                    <div className="text-xs font-bold text-gray-900">
                                                        {item.label}
                                                    </div>
                                                    <div className="font-mono text-[10px] text-gray-400">
                                                        {item.key}
                                                    </div>
                                                </td>
                                                <td className="p-3.5 align-top">
                                                    {item.beforeVal !==
                                                    undefined ? (
                                                        <div
                                                            className={
                                                                isChanged
                                                                    ? 'text-rose-700'
                                                                    : ''
                                                            }
                                                        >
                                                            {formatValueDisplay(
                                                                item.beforeVal,
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-300 italic">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3.5 text-center align-middle">
                                                    {isChanged ? (
                                                        <span className="text-sm font-bold text-amber-500">
                                                            →
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-300">
                                                            →
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3.5 align-top">
                                                    {item.afterVal !==
                                                    undefined ? (
                                                        <div
                                                            className={
                                                                isChanged
                                                                    ? 'font-semibold text-[#0f766e]'
                                                                    : ''
                                                            }
                                                        >
                                                            {formatValueDisplay(
                                                                item.afterVal,
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-red-400 italic">
                                                            (Dihapus)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3.5 text-center align-middle whitespace-nowrap">
                                                    {isChanged && (
                                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                                            Diubah
                                                        </span>
                                                    )}
                                                    {isAdded && (
                                                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                                            Ditambah
                                                        </span>
                                                    )}
                                                    {isRemoved && (
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
                                                            Dihapus
                                                        </span>
                                                    )}
                                                    {item.status ===
                                                        'unchanged' && (
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-500">
                                                            Sama
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* View Mode 3: JSON Mentah (Light Mode) */}
                    {viewMode === 'json' && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* JSON Sebelumnya */}
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                                            ←
                                        </span>
                                        <span className="font-mono text-[11px] font-bold tracking-wide text-slate-700 uppercase">
                                            JSON Sebelumnya (Berubah)
                                        </span>
                                    </div>
                                    {beforeFilteredObj &&
                                        Object.keys(beforeFilteredObj).length >
                                            0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        JSON.stringify(
                                                            beforeFilteredObj,
                                                            null,
                                                            2,
                                                        ),
                                                        true,
                                                    )
                                                }
                                                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                {copiedBefore
                                                    ? '✓ Tersalin'
                                                    : 'Salin JSON'}
                                            </button>
                                        )}
                                </div>
                                <div className="max-h-80 overflow-auto bg-[#fafbfc] p-4">
                                    <pre className="font-mono text-xs leading-relaxed font-semibold break-all whitespace-pre-wrap text-rose-700">
                                        {beforeFilteredObj &&
                                        Object.keys(beforeFilteredObj).length >
                                            0
                                            ? JSON.stringify(
                                                  beforeFilteredObj,
                                                  null,
                                                  2,
                                              )
                                            : '// Tidak ada data sebelumnya'}
                                    </pre>
                                </div>
                            </div>

                            {/* JSON Sesudahnya */}
                            <div className="overflow-hidden rounded-2xl border-2 border-[#145e5b] bg-white shadow-2xs">
                                <div className="flex items-center justify-between bg-[#145e5b] px-4 py-2.5 text-white">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                                            ✓
                                        </span>
                                        <span className="font-mono text-[11px] font-bold tracking-wide text-white uppercase">
                                            JSON Sesudahnya (Berubah)
                                        </span>
                                    </div>
                                    {afterFilteredObj &&
                                        Object.keys(afterFilteredObj).length >
                                            0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        JSON.stringify(
                                                            afterFilteredObj,
                                                            null,
                                                            2,
                                                        ),
                                                        false,
                                                    )
                                                }
                                                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-white/30"
                                            >
                                                {copiedAfter
                                                    ? '✓ Tersalin'
                                                    : 'Salin JSON'}
                                            </button>
                                        )}
                                </div>
                                <div className="max-h-80 overflow-auto bg-[#f6fcfb] p-4">
                                    <pre className="font-mono text-xs leading-relaxed font-semibold break-all whitespace-pre-wrap text-[#0f766e]">
                                        {afterFilteredObj &&
                                        Object.keys(afterFilteredObj).length > 0
                                            ? JSON.stringify(
                                                  afterFilteredObj,
                                                  null,
                                                  2,
                                              )
                                            : '// Data dihapus'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Alasan Perubahan Callout */}
            {log.alasan && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 shadow-2xs">
                    <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <div>
                        <span className="font-bold text-amber-950">
                            Catatan / Alasan Perubahan:
                        </span>{' '}
                        <span className="text-amber-900">{log.alasan}</span>
                    </div>
                </div>
            )}
        </div>
    );
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
            const diffLog = logsData.find(
                (l: AuditLog) => l.data_sebelum && l.data_sesudah,
            );
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
        router.get('/audit-logs', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
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
    if (localFilters.date_from)
        exportParams.append('date_from', localFilters.date_from);
    if (localFilters.date_to)
        exportParams.append('date_to', localFilters.date_to);
    if (localFilters.pembuat_type)
        exportParams.append('pembuat_type', localFilters.pembuat_type);
    if (localFilters.aksi) exportParams.append('aksi', localFilters.aksi);
    if (localFilters.search) exportParams.append('search', localFilters.search);
    const exportUrl = `/audit-logs/export?${exportParams.toString()}`;

    return (
        <div className="space-y-6">
            {/* Page Header: Title + Export Excel Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900">
                        Audit Log
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Pantau dan audit seluruh aktivitas pengguna dalam sistem
                        RS Sentosa Medika.
                    </p>
                </div>
                <a
                    href={exportUrl}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#145e5b] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0f4a47]"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    Ekspor EXCEL
                </a>
            </div>

            {/* Filter Section Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* 1. Rentang Waktu */}
                    <div className="flex flex-col">
                        <label className="mb-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                            Rentang Waktu
                        </label>
                        <div className="relative flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-700 transition-all focus-within:border-[#145e5b] focus-within:ring-1 focus-within:ring-[#145e5b] hover:border-gray-300">
                            <svg
                                className="mr-2 h-4 w-4 shrink-0 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <input
                                type="date"
                                value={localFilters.date_from || ''}
                                onChange={(e) =>
                                    updateFilter('date_from', e.target.value)
                                }
                                className="w-full cursor-pointer border-0 bg-transparent p-0 text-xs text-gray-700 focus:ring-0"
                                placeholder="Mulai"
                            />
                            <span className="px-1 text-xs text-gray-400">
                                -
                            </span>
                            <input
                                type="date"
                                value={localFilters.date_to || ''}
                                onChange={(e) =>
                                    updateFilter('date_to', e.target.value)
                                }
                                className="w-full cursor-pointer border-0 bg-transparent p-0 text-xs text-gray-700 focus:ring-0"
                                placeholder="Selesai"
                            />
                        </div>
                    </div>

                    {/* 2. Pengguna / Peran */}
                    <div className="flex flex-col">
                        <label className="mb-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                            Pengguna / Peran
                        </label>
                        <div className="relative">
                            <select
                                value={localFilters.pembuat_type || ''}
                                onChange={(e) =>
                                    updateFilter('pembuat_type', e.target.value)
                                }
                                className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-9 text-xs text-gray-700 transition-all hover:border-gray-300 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
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
                            <svg
                                className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* 3. Jenis Tindakan */}
                    <div className="flex flex-col">
                        <label className="mb-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                            Jenis Tindakan
                        </label>
                        <div className="relative">
                            <select
                                value={localFilters.aksi || ''}
                                onChange={(e) =>
                                    updateFilter('aksi', e.target.value)
                                }
                                className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-9 text-xs text-gray-700 transition-all hover:border-gray-300 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                            >
                                <option value="">Semua Tindakan</option>
                                <option value="AKSES_DATA">Akses Data</option>
                                <option value="EDIT_DATA">Edit Data</option>
                                <option value="HAPUS_PERMANEN">
                                    Hapus Permanen
                                </option>
                                <option value="CREATE">Buat Data</option>
                                <option value="LOGIN">Login</option>
                                <option value="LOGOUT">Logout</option>
                                <option value="UPDATE_STATUS">
                                    Update Status
                                </option>
                                <option value="EXPORT_DATA">Ekspor Data</option>
                            </select>
                            <svg
                                className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* 4. Cari Spesifik */}
                    <div className="flex flex-col">
                        <label className="mb-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                            Cari Spesifik
                        </label>
                        <div className="relative">
                            <svg
                                className="absolute top-2.5 left-3.5 h-4 w-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="ID Pasien, Modul..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-3.5 pl-10 text-xs text-gray-700 placeholder-gray-400 transition-all hover:border-gray-300 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
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
                                <th className="p-4 text-left font-bold text-gray-800">
                                    Waktu (WIB)
                                </th>
                                <th className="p-4 text-left font-bold text-gray-800">
                                    Pengguna
                                </th>
                                <th className="p-4 text-left font-bold text-gray-800">
                                    Tindakan
                                </th>
                                <th className="p-4 text-left font-bold text-gray-800">
                                    Modul / Target
                                </th>
                                <th className="p-4 text-left font-bold text-gray-800">
                                    IP & Perangkat
                                </th>
                                <th className="p-4 text-center font-bold text-gray-800">
                                    Detail
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logsData && logsData.length > 0 ? (
                                logsData.map((log: AuditLog) => {
                                    const hasDetails = Boolean(
                                        log.data_sebelum ||
                                        log.data_sesudah ||
                                        log.alasan,
                                    );
                                    const isExpanded = expandedRows.has(log.id);
                                    const userName =
                                        log.pembuat?.nama_lengkap ||
                                        'System User';
                                    const userJabatan =
                                        log.pembuat?.jabatan ||
                                        (log.pembuat_type
                                            ? ucfirst(log.pembuat_type)
                                            : 'Staff');
                                    const avatarInitials = getInitials(
                                        userName,
                                        log.pembuat_type,
                                    );
                                    const avatarStyle = getAvatarStyle(
                                        log.pembuat_type,
                                    );
                                    const targetInfo = formatTargetInfo(log);

                                    return (
                                        <React.Fragment key={log.id}>
                                            <tr className="transition-colors hover:bg-[#fcfdfd]">
                                                {/* Waktu (WIB) */}
                                                <td className="p-4 align-middle whitespace-nowrap">
                                                    <div className="text-xs font-semibold text-gray-900">
                                                        {formatDate(
                                                            log.created_at,
                                                        )}
                                                    </div>
                                                    <div className="mt-0.5 font-mono text-[11px] text-gray-400">
                                                        {formatTime(
                                                            log.created_at,
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Pengguna */}
                                                <td className="p-4 align-middle whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-2xs ${avatarStyle}`}
                                                        >
                                                            {avatarInitials}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs leading-tight font-bold text-gray-900">
                                                                {userName}
                                                            </div>
                                                            <div className="mt-0.5 text-[11px] text-gray-500">
                                                                {userJabatan}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Tindakan */}
                                                <td className="p-4 align-middle whitespace-nowrap">
                                                    {renderAksiBadge(log.aksi)}
                                                </td>

                                                {/* Modul / Target */}
                                                <td className="p-4 align-middle">
                                                    <div className="text-xs font-semibold text-gray-900">
                                                        {targetInfo.title}
                                                    </div>
                                                    {targetInfo.subtitle && (
                                                        <div className="mt-0.5 text-[11px] text-gray-500">
                                                            {
                                                                targetInfo.subtitle
                                                            }
                                                        </div>
                                                    )}
                                                </td>

                                                {/* IP & Perangkat */}
                                                <td className="p-4 align-middle whitespace-nowrap">
                                                    <div className="font-mono text-xs text-gray-800">
                                                        {log.ip_address ||
                                                            '127.0.0.1'}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] text-gray-500">
                                                        {parseUserAgent(
                                                            log.user_agent,
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Detail Chevron Toggle */}
                                                <td className="p-4 text-center align-middle">
                                                    {hasDetails ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleRow(
                                                                    log.id,
                                                                )
                                                            }
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#145e5b] transition-colors hover:bg-[#e4f6f2]"
                                                            aria-label="Toggle detail perubahan"
                                                        >
                                                            <svg
                                                                className={`h-4 w-4 transform transition-transform duration-200 ${
                                                                    isExpanded
                                                                        ? 'rotate-180 text-[#145e5b]'
                                                                        : 'text-gray-400'
                                                                }`}
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M19 9l-7 7-7-7"
                                                                />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-300">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>

                                            {/* Expandable Diff Row */}
                                            {isExpanded && hasDetails && (
                                                <tr className="bg-[#fcfdfd]/90">
                                                    <td
                                                        colSpan={6}
                                                        className="border-b border-gray-100 bg-slate-50/40 px-6 py-5"
                                                    >
                                                        <AuditDataDiffViewer
                                                            log={log}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-12 text-center text-xs text-gray-400"
                                    >
                                        Tidak ada catatan audit log yang sesuai
                                        dengan filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col gap-4 border-t border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-gray-500">
                        Menampilkan{' '}
                        {pagination?.from || (logsData.length > 0 ? 1 : 0)}–
                        {pagination?.to || logsData.length} dari{' '}
                        {(pagination?.total || 2451).toLocaleString('id-ID')}{' '}
                        log
                    </div>

                    {/* Pagination Links / Buttons */}
                    <div className="flex items-center gap-1">
                        {pagination?.links && pagination.links.length > 0 ? (
                            pagination.links.map(
                                (
                                    link: {
                                        url: string | null;
                                        label: string;
                                        active: boolean;
                                    },
                                    i: number,
                                ) => {
                                    let label = link.label;
                                    const isPrev = label.includes('Previous');
                                    const isNext = label.includes('Next');

                                    if (isPrev) {
                                        return (
                                            <button
                                                key={i}
                                                disabled={!link.url}
                                                onClick={() =>
                                                    link.url &&
                                                    router.get(
                                                        link.url,
                                                        localFilters,
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className={`rounded-md p-1.5 text-xs ${link.url ? 'text-gray-600 hover:bg-gray-100' : 'cursor-not-allowed text-gray-300'}`}
                                                aria-label="Halaman Sebelumnya"
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                            </button>
                                        );
                                    }

                                    if (isNext) {
                                        return (
                                            <button
                                                key={i}
                                                disabled={!link.url}
                                                onClick={() =>
                                                    link.url &&
                                                    router.get(
                                                        link.url,
                                                        localFilters,
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className={`rounded-md p-1.5 text-xs ${link.url ? 'text-gray-600 hover:bg-gray-100' : 'cursor-not-allowed text-gray-300'}`}
                                                aria-label="Halaman Berikutnya"
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        );
                                    }

                                    return link.url ? (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                router.get(
                                                    link.url!,
                                                    localFilters,
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    },
                                                )
                                            }
                                            className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-all ${
                                                link.active
                                                    ? 'bg-[#145e5b] font-bold text-white shadow-2xs'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-1.5 text-xs text-gray-400"
                                        >
                                            {label}
                                        </span>
                                    );
                                },
                            )
                        ) : (
                            <>
                                <button
                                    className="cursor-not-allowed rounded-md p-1.5 text-xs text-gray-300"
                                    disabled
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <button className="flex h-7 w-7 items-center justify-center rounded-md bg-[#145e5b] text-xs font-bold text-white shadow-2xs">
                                    1
                                </button>
                                <button className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-100">
                                    2
                                </button>
                                <button className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-100">
                                    3
                                </button>
                                <span className="px-1.5 text-xs text-gray-400">
                                    ...
                                </span>
                                <button className="rounded-md p-1.5 text-xs text-gray-600 hover:bg-gray-100">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
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
