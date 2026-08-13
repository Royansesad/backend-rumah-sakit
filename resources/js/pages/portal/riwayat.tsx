import React, { useState } from 'react';
import { PatientLayout } from '../../components/patient-layout';

interface KunjunganItem {
    id: string;
    nomor_antrian: string;
    tanggal_label: string;
    jam_mulai?: string;
    jam_selesai?: string;
    poli: string;
    dokter: string;
    status: string;
    sumber: string;
    tipe_pasien: string;
}

interface RawatInapItem {
    id: string;
    nomor_admission: string;
    tanggal_masuk: string;
    tanggal_keluar?: string;
    bangsal: string;
    ruangan: string;
    dpjp: string;
    status: string;
    alasan_masuk?: string;
}

interface TagihanItem {
    id: string;
    no_invoice: string;
    layanan: string;
    total_tagihan: number;
    jumlah_dibayar: number;
    status: string;
    metode_pembayaran?: string;
    waktu_pembayaran?: string;
    created_at: string;
}

interface RiwayatProps {
    user?: any;
    role?: string;
    kunjunganRawatJalan?: KunjunganItem[];
    rawatInap?: RawatInapItem[];
    tagihan?: TagihanItem[];
}

const RAWAT_JALAN_STATUS: Record<string, { label: string; cls: string }> = {
    menunggu: { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700' },
    skrining: { label: 'Skrining', cls: 'bg-blue-50 text-blue-700' },
    dipanggil: { label: 'Dipanggil', cls: 'bg-purple-50 text-purple-700' },
    sedang_dilayani: { label: 'Dilayani', cls: 'bg-teal-50 text-teal-700' },
    selesai: { label: 'Selesai', cls: 'bg-emerald-50 text-emerald-700' },
    dibatalkan: { label: 'Dibatalkan', cls: 'bg-rose-50 text-rose-700' },
    dilewati: { label: 'Dilewati', cls: 'bg-gray-50 text-gray-600' },
};

const RAWAT_INAP_STATUS: Record<string, { label: string; cls: string }> = {
    aktif: { label: 'Aktif', cls: 'bg-teal-50 text-teal-700' },
    pulang_sembuh: { label: 'Pulang Sembuh', cls: 'bg-emerald-50 text-emerald-700' },
    pulang_paksa: { label: 'Pulang Paksa', cls: 'bg-amber-50 text-amber-700' },
    dirujuk: { label: 'Dirujuk', cls: 'bg-blue-50 text-blue-700' },
    meninggal: { label: 'Meninggal', cls: 'bg-rose-50 text-rose-700' },
};

const TAGIHAN_STATUS: Record<string, { label: string; cls: string }> = {
    belum_lunas: { label: 'Belum Lunas', cls: 'bg-amber-50 text-amber-700' },
    lunas: { label: 'Lunas', cls: 'bg-emerald-50 text-emerald-700' },
    dibatalkan: { label: 'Dibatalkan', cls: 'bg-rose-50 text-rose-700' },
};

function badge(status: string, map: Record<string, { label: string; cls: string }>) {
    const meta = map[status] ?? { label: status.replace('_', ' '), cls: 'bg-gray-50 text-gray-600' };
    return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.cls}`}>{meta.label}</span>;
}

const formatRupiah = (val: number) => 'Rp ' + (val || 0).toLocaleString('id-ID');

export default function Riwayat({
    user,
    kunjunganRawatJalan = [],
    rawatInap = [],
    tagihan = [],
}: RiwayatProps) {
    const tabs = [
        { key: 'rawat-jalan', label: `Rawat Jalan (${kunjunganRawatJalan.length})` },
        { key: 'rawat-inap', label: `Rawat Inap (${rawatInap.length})` },
        { key: 'tagihan', label: `Tagihan (${tagihan.length})` },
    ];
    const [active, setActive] = useState('rawat-jalan');

    return (
        <PatientLayout user={user}>
            <div>
                <h1 className="font-serif text-2xl font-bold text-[#17524c] sm:text-3xl">Riwayat Kunjungan</h1>
                <p className="mt-1 text-sm text-gray-500">Seluruh kunjungan Anda di RS Sentosa Medika.</p>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setActive(t.key)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                            active === t.key
                                ? 'bg-[#145e5b] text-white shadow-xs'
                                : 'bg-white text-gray-600 hover:bg-[#e4f6f2] hover:text-[#145e5b]'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Rawat Jalan */}
            {active === 'rawat-jalan' && (
                <div className="mt-4 space-y-2.5">
                    {kunjunganRawatJalan.length > 0 ? (
                        kunjunganRawatJalan.map((k) => (
                            <div
                                key={k.id}
                                className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#145e5b]">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">
                                            {k.poli} — {k.dokter}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-gray-500">
                                            {k.tanggal_label}
                                            {k.jam_mulai ? ` • ${k.jam_mulai.slice(0, 5)} WIB` : ''} • No. {k.nomor_antrian}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {k.sumber === 'online' && (
                                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">ONLINE</span>
                                    )}
                                    {badge(k.status, RAWAT_JALAN_STATUS)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-xs text-gray-400">
                            Belum ada kunjungan rawat jalan.
                        </div>
                    )}
                </div>
            )}

            {/* Rawat Inap */}
            {active === 'rawat-inap' && (
                <div className="mt-4 space-y-2.5">
                    {rawatInap.length > 0 ? (
                        rawatInap.map((r) => (
                            <div
                                key={r.id}
                                className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#145e5b]">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">
                                            {r.bangsal} — {r.ruangan}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-gray-500">
                                            {r.tanggal_masuk}
                                            {r.tanggal_keluar ? ` → ${r.tanggal_keluar}` : ''} • DPJP: {r.dpjp}
                                        </div>
                                        {r.alasan_masuk && (
                                            <div className="mt-1 text-[11px] text-gray-400">Alasan: {r.alasan_masuk}</div>
                                        )}
                                    </div>
                                </div>
                                {badge(r.status, RAWAT_INAP_STATUS)}
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-xs text-gray-400">
                            Belum ada riwayat rawat inap.
                        </div>
                    )}
                </div>
            )}

            {/* Tagihan */}
            {active === 'tagihan' && (
                <div className="mt-4 space-y-2.5">
                    {tagihan.length > 0 ? (
                        tagihan.map((t) => (
                            <div
                                key={t.id}
                                className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#145e5b]">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">
                                            {t.no_invoice} — {t.layanan}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-gray-500">
                                            {t.created_at}
                                            {t.waktu_pembayaran ? ` • Dibayar ${t.waktu_pembayaran} (${t.metode_pembayaran || '-'})` : ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-extrabold text-gray-900">{formatRupiah(t.total_tagihan)}</span>
                                    {badge(t.status, TAGIHAN_STATUS)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-xs text-gray-400">
                            Belum ada tagihan.
                        </div>
                    )}
                </div>
            )}
        </PatientLayout>
    );
}
