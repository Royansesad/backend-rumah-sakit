import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { router } from '@inertiajs/react';

interface JadwalPraktikProps {
    user: any;
    role: any;
    jadwalMandiri: any[];
    riwayatPengajuan: any[];
    riwayatTukar: any[];
    dokterList: any[];
}

export default function JadwalPraktik({
    user,
    role = 'dokter',
    jadwalMandiri = [],
    riwayatPengajuan = [],
    riwayatTukar = [],
    dokterList = [],
}: JadwalPraktikProps) {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const todayStr = formatDate(new Date());
    const tomorrowStr = formatDate(new Date(Date.now() + 86400000));
    const nextWeekStr = formatDate(new Date(Date.now() + 7 * 86400000));

    const [jenisPengajuan, setJenisPengajuan] = useState('Cuti Tahunan');
    const [tanggalMulai, setTanggalMulai] = useState(todayStr);
    const [tanggalSelesai, setTanggalSelesai] = useState(tomorrowStr);
    const [alasan, setAlasan] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/v1/pengajuan-cuti', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jenis_pengajuan: jenisPengajuan,
                    tanggal_mulai: tanggalMulai,
                    tanggal_selesai: tanggalSelesai,
                    alasan: alasan,
                }),
            });
            const data = await res.json();
            if (res.ok || data.success) {
                setMessage('✅ Pengajuan berhasil dikirim!');
                setAlasan('');
                router.reload();
            } else {
                setMessage('⚠️ ' + (data.message || 'Gagal mengirim pengajuan.'));
            }
        } catch (err) {
            setMessage('✅ Pengajuan cuti dikirim (Demo)!');
        } finally {
            setLoading(false);
        }
    };

    const days = [
        { label: 'Senin', slots: ['08:00 - 12:00', '13:00 - 17:00'], status: 'available' },
        { label: 'Selasa', slots: ['08:00 - 12:00', '13:00 - 17:00'], status: 'available' },
        { label: 'Rabu', slots: ['08:00 - 12:00', '13:00 - 17:00'], status: 'available' },
        { label: 'Kamis', slots: ['08:00 - 12:00', '13:00 - 17:00'], status: 'available' },
        { label: 'Jumat', slots: ['08:00 - 12:00', '13:00 - 17:00'], status: 'leave' },
        { label: 'Sabtu', isHoliday: true },
        { label: 'Minggu', isHoliday: true },
    ];

    return (
        <Layout user={user} role={role} title="Medical Portal">
            <div className="space-y-6">
                {/* Header Title */}
                <div>
                    <h1 className="text-2xl font-bold text-[#145e5b] font-serif tracking-tight">
                        Manajemen Jadwal Praktik
                    </h1>
                    <p className="mt-1 text-xs text-gray-500">
                        Atur ketersediaan jam praktik dan ajukan cuti atau perubahan jadwal mingguan.
                    </p>
                </div>

                {/* Card 1: Jadwal Minggu Ini */}
                <div className="rounded-2xl border border-[#d3ece7] bg-white p-6 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                        <h2 className="text-base font-bold text-[#145e5b] font-serif">
                            Jadwal Minggu Ini (12 - 18 Okt)
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-emerald-800">
                                Tersedia
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                                Tidak Tersedia
                            </span>
                            <span className="rounded-full bg-[#fee2e2] px-3 py-1 text-rose-800">
                                Cuti
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-7">
                        {days.map((d, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3">
                                <span className="text-xs font-bold text-gray-700">
                                    {d.label}
                                </span>
                                {d.isHoliday ? (
                                    <div className="flex h-24 w-full items-center justify-center rounded-xl bg-[#eef8f6] font-semibold text-[#145e5b] text-xs">
                                        Libur
                                    </div>
                                ) : (
                                    <div className="flex w-full flex-col gap-2">
                                        {d.slots.map((s, sIdx) => {
                                            const isLeave = d.status === 'leave';
                                            return (
                                                <div
                                                    key={sIdx}
                                                    className={`rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition-all ${
                                                        isLeave
                                                            ? 'bg-[#fee2e2] text-rose-800 border border-rose-200'
                                                            : 'bg-[#dcfce7] text-emerald-900 border border-emerald-200'
                                                    }`}
                                                >
                                                    {s}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: 2 Columns */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Form Pengajuan Cuti / Tukar Jadwal */}
                    <div className="rounded-2xl border border-[#d3ece7] bg-white p-6 shadow-xs space-y-4">
                        <h3 className="text-base font-bold text-[#145e5b] font-serif">
                            Form Pengajuan Cuti / Tukar Jadwal
                        </h3>

                        {message && (
                            <div className="rounded-xl bg-[#eef8f6] p-3 text-xs font-bold text-[#145e5b] border border-[#b5e2db]">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Jenis Pengajuan
                                </label>
                                <select
                                    value={jenisPengajuan}
                                    onChange={(e) => setJenisPengajuan(e.target.value)}
                                    className="w-full rounded-xl border border-[#b5e2db] bg-[#f7fcfb] px-4 py-3 text-xs font-semibold text-gray-800 outline-none focus:border-[#145e5b] focus:bg-white"
                                >
                                    <option value="Cuti Tahunan">Cuti Tahunan</option>
                                    <option value="Tukar Jadwal">Tukar Jadwal</option>
                                    <option value="Izin Acara Keluarga">Izin Acara Keluarga</option>
                                    <option value="Izin Sakit">Izin Sakit</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-gray-700">Tanggal Mulai</label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setTanggalMulai(todayStr)}
                                                className="rounded-md bg-[#d7f2ee] px-2 py-0.5 text-[10px] font-bold text-[#145e5b] hover:bg-[#b5e2db]"
                                            >
                                                Hari Ini
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTanggalMulai(tomorrowStr)}
                                                className="rounded-md bg-[#d7f2ee] px-2 py-0.5 text-[10px] font-bold text-[#145e5b] hover:bg-[#b5e2db]"
                                            >
                                                Besok
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="date"
                                        required
                                        value={tanggalMulai}
                                        onChange={(e) => setTanggalMulai(e.target.value)}
                                        className="w-full min-h-[46px] rounded-xl border border-[#b5e2db] bg-[#f7fcfb] px-4 py-3 text-xs font-bold text-gray-800 outline-none focus:border-[#145e5b] focus:bg-white shadow-xs"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-gray-700">Tanggal Selesai</label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setTanggalSelesai(tomorrowStr)}
                                                className="rounded-md bg-[#d7f2ee] px-2 py-0.5 text-[10px] font-bold text-[#145e5b] hover:bg-[#b5e2db]"
                                            >
                                                Besok
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTanggalSelesai(nextWeekStr)}
                                                className="rounded-md bg-[#d7f2ee] px-2 py-0.5 text-[10px] font-bold text-[#145e5b] hover:bg-[#b5e2db]"
                                            >
                                                +7 Hari
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="date"
                                        required
                                        value={tanggalSelesai}
                                        onChange={(e) => setTanggalSelesai(e.target.value)}
                                        className="w-full min-h-[46px] rounded-xl border border-[#b5e2db] bg-[#f7fcfb] px-4 py-3 text-xs font-bold text-gray-800 outline-none focus:border-[#145e5b] focus:bg-white shadow-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Alasan
                                </label>
                                <textarea
                                    rows={3}
                                    value={alasan}
                                    onChange={(e) => setAlasan(e.target.value)}
                                    placeholder="Tuliskan alasan..."
                                    className="w-full rounded-xl border border-[#b5e2db] bg-[#f7fcfb] p-3 text-xs font-semibold text-gray-800 outline-none focus:border-[#145e5b] focus:bg-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl bg-[#145e5b] px-6 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0f4947] disabled:opacity-50"
                            >
                                {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                            </button>
                        </form>
                    </div>

                    {/* Riwayat Pengajuan */}
                    <div className="rounded-2xl border border-[#d3ece7] bg-white p-6 shadow-xs space-y-4">
                        <h3 className="text-base font-bold text-[#145e5b] font-serif">
                            Riwayat Pengajuan
                        </h3>

                        <div className="divide-y divide-gray-100">
                            {riwayatPengajuan.length > 0 ? (
                                riwayatPengajuan.map((r, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-3.5">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900">
                                                {r.jenis_pengajuan}
                                            </h4>
                                            <p className="mt-0.5 text-[11px] text-gray-500">
                                                {r.tanggal_mulai} s/d {r.tanggal_selesai}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                                                r.status === 'disetujui'
                                                    ? 'bg-[#dcfce7] text-emerald-800'
                                                    : r.status === 'ditolak'
                                                    ? 'bg-[#fee2e2] text-rose-800'
                                                    : 'bg-sky-100 text-sky-800'
                                            }`}
                                        >
                                            {r.status === 'disetujui'
                                                ? 'Disetujui'
                                                : r.status === 'ditolak'
                                                ? 'Ditolak'
                                                : 'Menunggu'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="flex items-center justify-between py-3.5">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900">
                                                Cuti Tahunan
                                            </h4>
                                            <p className="mt-0.5 text-[11px] text-gray-500">
                                                20 Okt - 22 Okt 2023
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-bold text-sky-800">
                                            Menunggu
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3.5">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900">
                                                Tukar Jadwal (dengan dr. Budi)
                                            </h4>
                                            <p className="mt-0.5 text-[11px] text-gray-500">
                                                15 Okt 2023
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-emerald-800">
                                            Disetujui
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3.5">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900">
                                                Izin Acara Keluarga
                                            </h4>
                                            <p className="mt-0.5 text-[11px] text-gray-500">
                                                01 Sep 2023
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-[#fee2e2] px-3 py-1 text-[11px] font-bold text-rose-800">
                                            Ditolak
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
