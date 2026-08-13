import { Link } from '@inertiajs/react';
import React from 'react';
import { PatientLayout } from '../../components/patient-layout';

interface BookingItem {
    id: string;
    nomor_antrian: string;
    tanggal_label: string;
    jam_mulai?: string;
    jam_selesai?: string;
    poli: string;
    dokter: string;
    status: string;
}

interface RekamMedisItem {
    id: string;
    keluhan_utama: string;
    diagnosis_deskripsi?: string;
    icd10_code?: string;
    poli: string;
    dokter: string;
    finalized_at?: string;
}

interface PortalDashboardProps {
    user?: any;
    role?: string;
    pasien?: any;
    jumlahRekamMedis?: number;
    jumlahKunjungan?: number;
    jumlahTagihan?: number;
    bookingAktif?: BookingItem[];
    rekamMedisTerbaru?: RekamMedisItem[];
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    menunggu: { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    skrining: { label: 'Skrining', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    dipanggil: { label: 'Dipanggil', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    sedang_dilayani: { label: 'Sedang Dilayani', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
    selesai: { label: 'Selesai', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    dibatalkan: { label: 'Dibatalkan', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
    dilewati: { label: 'Dilewati', cls: 'bg-gray-50 text-gray-600 border-gray-200' },
};

function statusBadge(status: string) {
    const meta = STATUS_BADGE[status] ?? {
        label: status.replace('_', ' '),
        cls: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return (
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${meta.cls}`}>
            {meta.label}
        </span>
    );
}

export default function PortalDashboard({
    user,
    pasien,
    jumlahRekamMedis = 0,
    jumlahKunjungan = 0,
    jumlahTagihan = 0,
    bookingAktif = [],
    rekamMedisTerbaru = [],
}: PortalDashboardProps) {
    const p = pasien || user || {};

    const statCards = [
        {
            label: 'Rekam Medis',
            value: jumlahRekamMedis,
            desc: 'Dokumen pemeriksaan',
            href: '/portal/rekam-medis',
            icon: 'M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        },
        {
            label: 'Total Kunjungan',
            value: jumlahKunjungan,
            desc: 'Rawat jalan & booking',
            href: '/portal/riwayat',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        },
        {
            label: 'Tagihan',
            value: jumlahTagihan,
            desc: 'Invoice & pembayaran',
            href: '/portal/riwayat',
            icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        },
    ];

    return (
        <PatientLayout user={user}>
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-[#17524c] sm:text-3xl">
                        Halo, {p.nama_lengkap?.split(' ')[0] || 'Pasien'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Selamat datang di portal pasien RS Sentosa Medika.
                    </p>
                </div>
                <Link
                    href="/portal/booking"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#145e5b] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0f4a47]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Booking Janji Temu
                </Link>
            </div>

            {/* Profile & Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Profil card */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-1">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#145e5b] text-lg font-bold text-white">
                            {p.nama_lengkap
                                ?.split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-gray-900">{p.nama_lengkap}</div>
                            <div className="text-xs font-semibold text-[#145e5b]">No. RM: {p.nomor_rekam_medis || '-'}</div>
                        </div>
                    </div>
                    <dl className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Jenis Kelamin</dt>
                            <dd className="font-semibold text-gray-800">{p.jenis_kelamin || '-'}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Tanggal Lahir</dt>
                            <dd className="font-semibold text-gray-800">{p.tanggal_lahir || '-'}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">NIK</dt>
                            <dd className="font-semibold text-gray-800">{p.nik || '-'}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Golongan Darah</dt>
                            <dd className="font-semibold text-gray-800">{p.golongan_darah || '-'}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">No. HP</dt>
                            <dd className="font-semibold text-gray-800">{p.no_hp || '-'}</dd>
                        </div>
                    </dl>
                    {p.alergi && (
                        <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs">
                            <div className="font-bold text-rose-700">Alergi</div>
                            <div className="mt-0.5 text-rose-600">{p.alergi}</div>
                        </div>
                    )}
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
                    {statCards.map((s) => (
                        <Link
                            key={s.label}
                            href={s.href}
                            className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-[#145e5b]/30 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-gray-500">{s.label}</span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#145e5b]">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                                <div className="mt-0.5 text-[11px] font-medium text-gray-400">{s.desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Booking aktif & RME terbaru */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">Booking Aktif</h3>
                        <Link href="/portal/booking" className="text-xs font-semibold text-[#145e5b] hover:underline">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="mt-3 space-y-2.5">
                        {bookingAktif.length > 0 ? (
                            bookingAktif.map((b) => (
                                <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f7fcfb] p-3">
                                    <div className="min-w-0">
                                        <div className="truncate text-xs font-bold text-gray-900">
                                            {b.poli} — {b.dokter}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-gray-500">
                                            {b.tanggal_label} • {b.jam_mulai ? `${b.jam_mulai.slice(0, 5)} WIB` : ''} • No. {b.nomor_antrian}
                                        </div>
                                    </div>
                                    {statusBadge(b.status)}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                                Belum ada booking aktif. Yuk buat janji temu dokter.
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">Rekam Medis Terbaru</h3>
                        <Link href="/portal/rekam-medis" className="text-xs font-semibold text-[#145e5b] hover:underline">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="mt-3 space-y-2.5">
                        {rekamMedisTerbaru.length > 0 ? (
                            rekamMedisTerbaru.map((rm: any) => (
                                <Link
                                    key={rm.id}
                                    href={`/portal/rekam-medis/${rm.id}`}
                                    className="block rounded-xl bg-[#f7fcfb] p-3 transition-colors hover:bg-[#eef8f5]"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-xs font-bold text-gray-900">
                                                {rm.keluhan_utama}
                                            </div>
                                            <div className="mt-0.5 text-[11px] text-gray-500">
                                                {rm.dokter || '-'} • {rm.poli || '-'} • {rm.finalized_at || '-'}
                                            </div>
                                        </div>
                                        <svg className="h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                                Belum ada rekam medis yang difinalisasi.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PatientLayout>
    );
}
