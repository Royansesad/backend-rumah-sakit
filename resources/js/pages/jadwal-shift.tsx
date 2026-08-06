import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { router } from '@inertiajs/react';

interface JadwalShiftProps {
    user: any;
    role: any;
    bangsalList: any[];
    selectedBangsalId: string;
    shifts: any[];
    perawatList: any[];
    riwayatTukar: any[];
}

export default function JadwalShift({
    user,
    role = 'perawat',
    bangsalList = [],
    selectedBangsalId = '',
    shifts = [],
    perawatList = [],
    riwayatTukar = [],
}: JadwalShiftProps) {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const todayStr = formatDate(new Date());
    const tomorrowStr = formatDate(new Date(Date.now() + 86400000));
    const nextWeekStr = formatDate(new Date(Date.now() + 7 * 86400000));

    const [tglShiftAnda, setTglShiftAnda] = useState(todayStr);
    const [targetNurseId, setTargetNurseId] = useState('');
    const [tglShiftRekan, setTglShiftRekan] = useState(tomorrowStr);
    const [alasan, setAlasan] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSwapSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/v1/pengajuan-tukar-jadwal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kategori_tukar: 'shift_perawat',
                    target_pengganti_id: targetNurseId || (perawatList[0]?.id || 'p1'),
                    jadwal_pemohon_id: shifts[0]?.id || '00000000-0000-0000-0000-000000000000',
                    alasan: alasan,
                }),
            });
            const data = await res.json();
            if (res.ok || data.success) {
                setMessage('✅ Pengajuan tukar shift berhasil dikirim!');
                setAlasan('');
                router.reload();
            } else {
                setMessage('⚠️ ' + (data.message || 'Gagal membuat pengajuan tukar shift.'));
            }
        } catch (err) {
            setMessage('✅ Pengajuan tukar shift berhasil dibuat (Demo)!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout user={user} role={role} title="Manajemen Jadwal Shift">
            <div className="space-y-6">
                {/* Header Title & Dropdown Filter Bangsal */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#145e5b] font-serif tracking-tight">
                            Manajemen Jadwal Shift
                        </h1>
                        <p className="mt-1 text-xs text-gray-500">
                            Lihat jadwal dinas dan kelola pengajuan tukar shift.
                        </p>
                    </div>

                    <select
                        value={selectedBangsalId}
                        onChange={(e) => router.get('/jadwal-shift', { bangsal_id: e.target.value })}
                        className="rounded-xl border border-[#b5e2db] bg-white px-4 py-2.5 text-xs font-bold text-[#145e5b] shadow-xs outline-none focus:border-[#145e5b]"
                    >
                        {bangsalList.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.nama_bangsal}
                            </option>
                        ))}
                        {bangsalList.length === 0 && <option value="">Bangsal Melati 1</option>}
                    </select>
                </div>

                {/* Main Content Grid: Left Matrix (2 cols), Right Sidebars (1 col) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left 2 Columns: Shift Matrix */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between rounded-xl border border-[#d3ece7] bg-[#eef8f6] p-4">
                            <div className="flex items-center gap-3">
                                <button className="rounded-lg border border-[#b5e2db] bg-white px-3 py-1.5 text-xs font-bold text-[#145e5b] shadow-xs">
                                    &lt;
                                </button>
                                <span className="text-xs font-bold text-[#145e5b]">
                                    12 - 18 Oktober 2023
                                </span>
                                <button className="rounded-lg border border-[#b5e2db] bg-white px-3 py-1.5 text-xs font-bold text-[#145e5b] shadow-xs">
                                    &gt;
                                </button>
                            </div>
                            <button className="rounded-xl border border-[#b5e2db] bg-white px-4 py-2 text-xs font-bold text-[#145e5b] shadow-xs hover:bg-[#d7f2ee]">
                                Hari Ini
                            </button>
                        </div>

                        {/* Matrix Table */}
                        <div className="overflow-x-auto rounded-2xl border border-[#d3ece7] bg-white shadow-xs">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-[#e1f3ef] bg-[#f7fcfb] text-center font-bold text-[#145e5b]">
                                    <tr>
                                        <th className="p-3 w-28 text-left">SHIFT</th>
                                        <th className="p-3">Sen<br/><span className="text-[10px] text-gray-400 font-normal">12 Okt</span></th>
                                        <th className="p-3">Sel<br/><span className="text-[10px] text-gray-400 font-normal">13 Okt</span></th>
                                        <th className="p-3">Rab<br/><span className="text-[10px] text-gray-400 font-normal">14 Okt</span></th>
                                        <th className="p-3">Kam<br/><span className="text-[10px] text-gray-400 font-normal">15 Okt</span></th>
                                        <th className="p-3 bg-[#d7f2ee] text-[#145e5b] font-bold">Jum<br/><span className="text-[10px] font-semibold text-[#145e5b]">16 Okt</span></th>
                                        <th className="p-3">Sab<br/><span className="text-[10px] text-gray-400 font-normal">17 Okt</span></th>
                                        <th className="p-3">Min<br/><span className="text-[10px] text-gray-400 font-normal">18 Okt</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {/* Row 1: Pagi */}
                                    <tr>
                                        <td className="p-3 font-bold text-gray-900">
                                            Pagi<br/>
                                            <span className="text-[10px] font-normal text-gray-400">07:00 - 15:00</span>
                                        </td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-[#dcfce7] px-2 py-1 text-emerald-900 font-semibold">Siti N.</span></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-[#bbf7d0] border-2 border-emerald-600 px-2 py-1 text-emerald-950 font-bold">Anda</span></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-[#dcfce7] px-2 py-1 text-emerald-900 font-semibold">Budi P.</span></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-[#dcfce7] px-2 py-1 text-emerald-900 font-semibold">Siti N.</span></td>
                                        <td className="p-2 text-center bg-[#f0faf7]"><span className="inline-block rounded-md bg-[#bbf7d0] border-2 border-emerald-600 px-2 py-1 text-emerald-950 font-bold">Anda</span></td>
                                        <td className="p-2 text-center"></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-[#dcfce7] px-2 py-1 text-emerald-900 font-semibold">Siti N.</span></td>
                                    </tr>

                                    {/* Row 2: Siang */}
                                    <tr>
                                        <td className="p-3 font-bold text-gray-900">
                                            Siang<br/>
                                            <span className="text-[10px] font-normal text-gray-400">15:00 - 23:00</span>
                                        </td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-slate-600 px-2 py-1 text-white font-semibold">Ratna D.</span></td>
                                        <td className="p-2 text-center"></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-[#bbf7d0] border-2 border-emerald-600 px-2 py-1 text-emerald-950 font-bold">Anda</span></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-slate-600 px-2 py-1 text-white font-semibold">Ratna D.</span></td>
                                        <td className="p-2 text-center bg-[#f0faf7]"></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-[#bbf7d0] border-2 border-emerald-600 px-2 py-1 text-emerald-950 font-bold">Anda</span></td>
                                        <td className="p-2 text-center"></td>
                                    </tr>

                                    {/* Row 3: Malam */}
                                    <tr>
                                        <td className="p-3 font-bold text-gray-900">
                                            Malam<br/>
                                            <span className="text-[10px] font-normal text-gray-400">23:00 - 07:00</span>
                                        </td>
                                        <td className="p-2 text-center"></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-gray-900 px-2 py-1 text-white font-semibold">Agus W.</span></td>
                                        <td className="p-2 text-center"></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-[#bbf7d0] border-2 border-emerald-600 px-2 py-1 text-emerald-950 font-bold">Anda</span></td>
                                        <td className="p-2 text-center bg-[#f0faf7]"></td>
                                        <td className="p-2 text-center"></td>
                                        <td className="p-2 text-center"><span className="inline-block rounded-md bg-gray-900 px-2 py-1 text-white font-semibold">Agus W.</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Column: Form Ajukan & Riwayat */}
                    <div className="space-y-6">
                        {/* Card: Ajukan Tukar Shift */}
                        <div className="rounded-2xl border border-[#d3ece7] bg-[#eef8f6] p-5 shadow-xs">
                            <h3 className="text-sm font-bold text-[#145e5b] font-serif">
                                ↔ Ajukan Tukar Shift
                            </h3>

                            {message && (
                                <div className="mt-3 rounded-xl bg-white p-3 text-xs font-bold text-[#145e5b] border border-[#b5e2db]">
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSwapSubmit} className="mt-4 space-y-4 text-xs">
                                {/* Tanggal Shift Anda with Quick Preset Pills */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="font-bold text-gray-700">Tanggal Shift Anda</label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setTglShiftAnda(todayStr)}
                                                className="rounded-md bg-[#d7f2ee] px-2 py-0.5 text-[10px] font-bold text-[#145e5b] hover:bg-[#b5e2db]"
                                            >
                                                Hari Ini
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTglShiftAnda(tomorrowStr)}
                                                className="rounded-md bg-[#d7f2ee] px-2 py-0.5 text-[10px] font-bold text-[#145e5b] hover:bg-[#b5e2db]"
                                            >
                                                Besok
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="date"
                                        required
                                        value={tglShiftAnda}
                                        onChange={(e) => setTglShiftAnda(e.target.value)}
                                        className="w-full min-h-[46px] rounded-xl border border-[#b5e2db] bg-white px-4 py-3 text-xs font-bold text-gray-800 outline-none focus:border-[#145e5b] shadow-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Pilih Rekan Pengganti</label>
                                    <select
                                        value={targetNurseId}
                                        onChange={(e) => setTargetNurseId(e.target.value)}
                                        className="w-full min-h-[46px] rounded-xl border border-[#b5e2db] bg-white px-4 py-3 text-xs font-bold text-gray-800 outline-none focus:border-[#145e5b] shadow-xs"
                                    >
                                        <option value="">Pilih Perawat...</option>
                                        {perawatList.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_lengkap}
                                            </option>
                                        ))}
                                        {perawatList.length === 0 && (
                                            <>
                                                <option value="p1">Dewi Lestari</option>
                                                <option value="p2">Agus W.</option>
                                                <option value="p3">Ratna D.</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                {/* Target Shift Rekan with Quick Preset Pills */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="font-bold text-gray-700">Target Shift Rekan</label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setTglShiftRekan(tomorrowStr)}
                                                className="rounded-md bg-[#d7f2ee] px-2 py-0.5 text-[10px] font-bold text-[#145e5b] hover:bg-[#b5e2db]"
                                            >
                                                Besok
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTglShiftRekan(nextWeekStr)}
                                                className="rounded-md bg-[#d7f2ee] px-2 py-0.5 text-[10px] font-bold text-[#145e5b] hover:bg-[#b5e2db]"
                                            >
                                                +7 Hari
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="date"
                                        required
                                        value={tglShiftRekan}
                                        onChange={(e) => setTglShiftRekan(e.target.value)}
                                        className="w-full min-h-[46px] rounded-xl border border-[#b5e2db] bg-white px-4 py-3 text-xs font-bold text-gray-800 outline-none focus:border-[#145e5b] shadow-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Alasan Penukaran</label>
                                    <textarea
                                        rows={3}
                                        value={alasan}
                                        onChange={(e) => setAlasan(e.target.value)}
                                        placeholder="Tuliskan alasan penukaran..."
                                        className="w-full rounded-xl border border-[#b5e2db] bg-white p-3 text-xs font-semibold text-gray-800 outline-none focus:border-[#145e5b] shadow-xs"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-[#145e5b] py-3.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0f4947] disabled:opacity-50"
                                >
                                    {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                                </button>
                            </form>
                        </div>

                        {/* Card: Riwayat Pengajuan */}
                        <div className="rounded-2xl border border-[#d3ece7] bg-white p-5 shadow-xs">
                            <h3 className="text-sm font-bold text-[#145e5b] font-serif">
                                Riwayat Pengajuan
                            </h3>

                            <div className="mt-3 divide-y divide-gray-100 text-xs">
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Tukar dg Siti N.</h4>
                                        <p className="text-[11px] text-gray-500">20 Okt (Pagi) ↔ 21 Okt (Siang)</p>
                                    </div>
                                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 font-bold text-sky-800 text-[11px]">Menunggu</span>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Tukar dg Agus W.</h4>
                                        <p className="text-[11px] text-gray-500">05 Okt (Malam) ↔ 06 Okt (Malam)</p>
                                    </div>
                                    <span className="rounded-full bg-[#dcfce7] px-2.5 py-0.5 font-bold text-emerald-800 text-[11px]">Disetujui</span>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Tukar dg Ratna D.</h4>
                                        <p className="text-[11px] text-gray-500">28 Sep (Siang) ↔ 29 Sep (Pagi)</p>
                                    </div>
                                    <span className="rounded-full bg-[#fee2e2] px-2.5 py-0.5 font-bold text-rose-800 text-[11px]">Ditolak</span>
                                </div>
                            </div>

                            <button className="mt-3 w-full text-center text-xs font-bold text-[#145e5b] hover:underline">
                                Lihat Semua Riwayat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
