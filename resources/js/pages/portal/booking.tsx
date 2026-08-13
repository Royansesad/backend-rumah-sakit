import { router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { PatientLayout } from '../../components/patient-layout';

interface SlotItem {
    id: string;
    kuota_maksimal: number;
    sisa_kuota: number;
    tanggal: string;
    tanggal_label: string;
    jam_label: string;
    dokter?: { id: string; nama_lengkap: string; spesialisasi?: string };
    poli?: { id: string; nama_poli: string };
    ruangan?: { id: string; nama_ruangan?: string };
}

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

interface PoliItem {
    id: string;
    nama_poli: string;
}

interface BookingProps {
    user?: any;
    role?: string;
    poliList?: PoliItem[];
    jadwalTersedia?: SlotItem[];
    bookingSaya?: BookingItem[];
    filters?: { poli_id?: string; tanggal?: string };
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
    menunggu: { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700' },
    skrining: { label: 'Skrining', cls: 'bg-blue-50 text-blue-700' },
    dipanggil: { label: 'Dipanggil', cls: 'bg-purple-50 text-purple-700' },
    sedang_dilayani: { label: 'Dilayani', cls: 'bg-teal-50 text-teal-700' },
    selesai: { label: 'Selesai', cls: 'bg-emerald-50 text-emerald-700' },
    dibatalkan: { label: 'Dibatalkan', cls: 'bg-rose-50 text-rose-700' },
    dilewati: { label: 'Dilewati', cls: 'bg-gray-50 text-gray-600' },
};

function badge(status: string) {
    const meta = STATUS_META[status] ?? { label: status.replace('_', ' '), cls: 'bg-gray-50 text-gray-600' };
    return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.cls}`}>{meta.label}</span>;
}

const CANCELABLE = new Set(['menunggu', 'skrining', 'dipanggil']);

export default function Booking({
    user,
    poliList = [],
    jadwalTersedia = [],
    bookingSaya = [],
    filters = {},
}: BookingProps) {
    const pageProps = usePage().props as any;
    const errors = (pageProps.errors ?? {}) as Record<string, string>;

    const [poliId, setPoliId] = useState(filters.poli_id ?? '');
    const [tanggal, setTanggal] = useState(filters.tanggal ?? '');
    const [confirmSlot, setConfirmSlot] = useState<SlotItem | null>(null);
    const [processing, setProcessing] = useState(false);

    const applyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/portal/booking', { poli_id: poliId || undefined, tanggal: tanggal || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleBooking = () => {
        if (!confirmSlot) return;
        setProcessing(true);
        router.post(
            '/portal/booking',
            { jadwal_dokter_id: confirmSlot.id, tipe_pasien: 'umum' },
            {
                onFinish: () => {
                    setProcessing(false);
                    setConfirmSlot(null);
                },
            },
        );
    };

    const handleCancel = (id: string) => {
        if (!confirm(`Batalkan booking ini?`)) return;
        router.post(`/portal/booking/${id}/batal`);
    };

    return (
        <PatientLayout user={user}>
            <div>
                <h1 className="font-serif text-2xl font-bold text-[#17524c] sm:text-3xl">Booking Online</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Pilih jadwal praktik dokter yang tersedia untuk membuat janji temu.
                </p>
            </div>

            {errors.jadwal_dokter_id && (
                <div className="mt-4 rounded-xl border border-[#fca5a5] bg-[#fde8e8] px-4 py-3 text-sm font-semibold text-[#c53030]">
                    {errors.jadwal_dokter_id}
                </div>
            )}
            {errors.status && (
                <div className="mt-4 rounded-xl border border-[#fca5a5] bg-[#fde8e8] px-4 py-3 text-sm font-semibold text-[#c53030]">
                    {errors.status}
                </div>
            )}

            {/* Filter */}
            <form onSubmit={applyFilter} className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-bold text-gray-600">Poliklinik</label>
                    <select
                        value={poliId}
                        onChange={(e) => setPoliId(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#145e5b] focus:outline-none"
                    >
                        <option value="">Semua Poli</option>
                        {poliList.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nama_poli}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-bold text-gray-600">Tanggal</label>
                    <input
                        type="date"
                        value={tanggal}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#145e5b] focus:outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#145e5b] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#0f4a47]"
                >
                    Cari Jadwal
                </button>
            </form>

            {/* Available slots */}
            <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-900">Jadwal Tersedia ({jadwalTersedia.length})</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {jadwalTersedia.length > 0 ? (
                        jadwalTersedia.map((slot) => (
                            <div
                                key={slot.id}
                                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs"
                            >
                                <div>
                                    <div className="text-xs font-bold text-gray-900">{slot.poli?.nama_poli || '-'}</div>
                                    <div className="mt-0.5 text-[11px] text-gray-500">{slot.dokter?.nama_lengkap || '-'}</div>
                                    {slot.dokter?.spesialisasi && (
                                        <div className="mt-0.5 text-[11px] text-[#145e5b]">{slot.dokter.spesialisasi}</div>
                                    )}
                                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {slot.tanggal_label}
                                    </div>
                                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {slot.jam_label} WIB
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-gray-400">
                                        Kuota tersisa {slot.sisa_kuota}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmSlot(slot)}
                                        className="rounded-lg bg-[#145e5b] px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#0f4a47]"
                                    >
                                        Booking
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-xs text-gray-400">
                            Tidak ada jadwal tersedia untuk filter yang dipilih.
                        </div>
                    )}
                </div>
            </div>

            {/* My bookings */}
            <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-900">Booking Saya ({bookingSaya.length})</h3>
                <div className="mt-3 space-y-2.5">
                    {bookingSaya.length > 0 ? (
                        bookingSaya.map((b) => (
                            <div
                                key={b.id}
                                className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <div className="text-xs font-bold text-gray-900">
                                        {b.poli} — {b.dokter}
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-gray-500">
                                        {b.tanggal_label}
                                        {b.jam_mulai ? ` • ${b.jam_mulai.slice(0, 5)} WIB` : ''} • No. {b.nomor_antrian}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {badge(b.status)}
                                    {CANCELABLE.has(b.status) && (
                                        <button
                                            type="button"
                                            onClick={() => handleCancel(b.id)}
                                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50"
                                        >
                                            Batalkan
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-xs text-gray-400">
                            Anda belum memiliki booking.
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm modal */}
            {confirmSlot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                        <h3 className="font-serif text-base font-bold text-gray-900">Konfirmasi Booking</h3>
                        <div className="mt-4 space-y-2 rounded-xl bg-[#f7fcfb] p-4 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Poliklinik</span>
                                <span className="font-semibold text-gray-800">{confirmSlot.poli?.nama_poli || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Dokter</span>
                                <span className="font-semibold text-gray-800">{confirmSlot.dokter?.nama_lengkap || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tanggal</span>
                                <span className="font-semibold text-gray-800">{confirmSlot.tanggal_label}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Jam</span>
                                <span className="font-semibold text-gray-800">{confirmSlot.jam_label} WIB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Kuota Tersisa</span>
                                <span className="font-semibold text-gray-800">{confirmSlot.sisa_kuota}</span>
                            </div>
                        </div>
                        <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
                            Harap hadir 15 menit sebelum jadwal untuk registrasi di loket pendaftaran. Booking dapat dibatalkan kapan saja sebelum antrian dipanggil.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmSlot(null)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleBooking}
                                disabled={processing}
                                className="rounded-xl bg-[#145e5b] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0f4a47] disabled:opacity-60"
                            >
                                {processing ? 'Memproses...' : 'Konfirmasi Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PatientLayout>
    );
}
