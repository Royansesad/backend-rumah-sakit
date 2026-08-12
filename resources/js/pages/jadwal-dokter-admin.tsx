import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { router } from '@inertiajs/react';

interface JadwalDokterAdminProps {
    user: any;
    role: any;
    jadwalGrid: any[];
    workloadSummary: any[];
    dokters: any[];
    poliList: any[];
    ruanganList: any[];
    pendingCutiList: any[];
}

export default function JadwalDokterAdmin({
    user,
    role = 'admin',
    jadwalGrid = [],
    workloadSummary = [],
    dokters = [],
    poliList = [],
    ruanganList = [],
    pendingCutiList = [],
}: JadwalDokterAdminProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedDokter, setSelectedDokter] = useState(dokters[0]?.id || '');
    const [selectedPoli, setSelectedPoli] = useState(poliList[0]?.id || '');
    const [selectedRuangan, setSelectedRuangan] = useState(ruanganList[0]?.id || '');
    const [tanggal, setTanggal] = useState('');
    const [jamMulai, setJamMulai] = useState('08:00');
    const [jamSelesai, setJamSelesai] = useState('12:00');
    const [kuota, setKuota] = useState(30);
    const [loading, setLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [handledIds, setHandledIds] = useState<string[]>([]);

    const activePendingList = pendingCutiList.filter((item) => !handledIds.includes(item.id));

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAlertMsg(null);

        try {
            const res = await fetch('/api/v1/admin/jadwal-dokter', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    dokter_id: selectedDokter || dokters[0]?.id,
                    poli_id: selectedPoli || poliList[0]?.id,
                    ruangan_id: selectedRuangan || ruanganList[0]?.id,
                    tanggal: tanggal || new Date().toISOString().split('T')[0],
                    jam_mulai: jamMulai,
                    jam_selesai: jamSelesai,
                    kuota_maksimal: kuota,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setAlertMsg({ type: 'success', text: data.message || 'Jadwal dokter berhasil disimpan.' });
                setShowModal(false);
                router.reload();
            } else {
                setAlertMsg({ type: 'warning', text: data.message || 'Gagal menyimpan jadwal.' });
            }
        } catch (err) {
            setAlertMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApproveCuti = async (id: string, setuju: boolean) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/v1/admin/pengajuan-cuti/${id}/persetujuan`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ setuju }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Mark as handled so it disappears immediately from UI
                setHandledIds((prev) => [...prev, id]);
                setAlertMsg(setuju ? { type: 'success', text: 'Pengajuan cuti telah disetujui & jadwal otomatis di-update ke Cuti!' } : { type: 'error', text: 'Pengajuan cuti ditolak.' });
                router.reload();
            } else {
                setAlertMsg({ type: 'warning', text: data.message || 'Gagal memproses pengajuan cuti.' });
            }
        } catch (err) {
            setAlertMsg({ type: 'error', text: 'Terjadi kesalahan jaringan saat memproses cuti.' });
        } finally {
            setProcessingId(null);
        }
    };

    const timeRows = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
    const days = [
        { key: 'sen', dateNum: '12', label: 'Sen' },
        { key: 'sel', dateNum: '13', label: 'Sel' },
        { key: 'rab', dateNum: '14', label: 'Rab' },
        { key: 'kam', dateNum: '15', label: 'Kam', isToday: true },
        { key: 'jum', dateNum: '16', label: 'Jum' },
        { key: 'sab', dateNum: '17', label: 'Sab' },
        { key: 'min', dateNum: '18', label: 'Min' },
    ];

    return (
        <Layout user={user} role={role} title="Manajemen Jadwal Dokter">
            <div className="space-y-6">
                {/* Search & Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e1f3ef] pb-4">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Cari dokter atau pasien..."
                            className="w-full rounded-xl border border-[#b5e2db] bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-800 shadow-xs outline-none focus:border-[#145e5b]"
                        />
                        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-gray-400 text-xs"></i>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7f2ee] text-[#145e5b] shadow-xs cursor-pointer">
                            <i className="fa-solid fa-bell text-sm"></i>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7f2ee] text-[#145e5b] shadow-xs cursor-pointer">
                            <i className="fa-solid fa-circle-question text-sm"></i>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-[#145e5b] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            ADM
                        </div>
                    </div>
                </div>

                {/* Main Title & Action Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#145e5b] font-serif tracking-tight">
                            Manajemen Jadwal Dokter
                        </h1>
                        <p className="mt-1 text-xs text-gray-500">
                            Atur dan pantau jadwal praktik dokter. Hindari bentrokan ruang dan waktu untuk pelayanan optimal.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-[#b5e2db] bg-white px-3 py-2 text-xs font-bold text-[#145e5b] shadow-xs">
                            <button>&lt;</button>
                            <span>12 - 18 Okt 2023</span>
                            <button>&gt;</button>
                        </div>

                        <select className="rounded-xl border border-[#b5e2db] bg-white px-4 py-2 text-xs font-bold text-[#145e5b] shadow-xs outline-none">
                            <option>Semua Dokter</option>
                            {dokters.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.nama_lengkap}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowModal(true)}
                            className="rounded-xl bg-[#145e5b] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0f4947]"
                        >
                            Tambah Jadwal
                        </button>
                    </div>
                </div>

                {alertMsg && (
                    <div className={`rounded-xl border p-3 text-xs font-bold flex items-center gap-2 ${
                        alertMsg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                        alertMsg.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                        'bg-[#eef8f6] border-[#b5e2db] text-[#145e5b]'
                    }`}>
                        <i className={`fa-solid ${
                            alertMsg.type === 'error' ? 'fa-circle-xmark' :
                            alertMsg.type === 'warning' ? 'fa-triangle-exclamation' :
                            'fa-circle-check'
                        }`}></i>
                        <span>{alertMsg.text}</span>
                    </div>
                )}

                {/* Section: Persetujuan Cuti Dokter (Fitur Admin Approve Cuti) */}
                {activePendingList.length > 0 && (
                    <div className="rounded-2xl border border-[#d3ece7] bg-white p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-[#145e5b] font-serif flex items-center gap-2">
                                <i className="fa-solid fa-clipboard-check text-[#145e5b]"></i> Persetujuan Cuti Dokter & Staff (Admin Approval)
                            </h3>
                            <span className="rounded-full bg-[#d7f2ee] px-3 py-1 text-xs font-bold text-[#145e5b]">
                                {activePendingList.length} Menunggu Persetujuan
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100 text-xs">
                            {activePendingList.map((item) => (
                                <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 text-sm">
                                                {item.jenis_pengajuan} {item.nama_pemohon ? `(${item.nama_pemohon})` : (item.pemohon?.nama_lengkap ? `(${item.pemohon.nama_lengkap})` : '')}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                                                {item.peran_pemohon || 'Dokter'}
                                            </span>
                                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                                                Menunggu
                                            </span>
                                        </div>
                                        <p className="text-gray-500">
                                            Tanggal: <span className="font-semibold text-gray-800">{item.tanggal_mulai ? String(item.tanggal_mulai).substring(0, 10) : ''}</span> s/d <span className="font-semibold text-gray-800">{item.tanggal_selesai ? String(item.tanggal_selesai).substring(0, 10) : ''}</span>
                                            {item.alasan ? ` | Alasan: "${item.alasan}"` : ''}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApproveCuti(item.id, true)}
                                            disabled={processingId === item.id}
                                            className="flex items-center gap-1.5 rounded-xl bg-[#145e5b] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0f4947] disabled:opacity-50"
                                        >
                                            {processingId === item.id ? (
                                                'Memproses...'
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-check"></i> Setujui Cuti
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleApproveCuti(item.id, false)}
                                            disabled={processingId === item.id}
                                            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800 transition-all hover:bg-rose-100 disabled:opacity-50"
                                        >
                                            <i className="fa-solid fa-xmark"></i> Tolak
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Calendar Grid & Workload Sidebar */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Time Grid Calendar (3 cols) */}
                    <div className="lg:col-span-3 overflow-x-auto rounded-2xl border border-[#d3ece7] bg-white shadow-xs">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-[#e1f3ef] bg-[#f7fcfb] text-center font-bold text-[#145e5b]">
                                    <th className="p-3 border-r border-[#e1f3ef] w-16 text-gray-400">GMT+7</th>
                                    {days.map((d, dIdx) => (
                                        <th
                                            key={dIdx}
                                            className={`p-3 border-r border-[#e1f3ef] last:border-r-0 ${
                                                d.isToday ? 'bg-[#d7f2ee] text-[#145e5b] font-bold' : ''
                                            }`}
                                        >
                                            {d.label}<br />
                                            <span className={`text-base font-bold ${d.isToday ? 'text-[#145e5b]' : 'text-gray-900'}`}>
                                                {d.dateNum}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeRows.map((tRow, tIdx) => (
                                    <tr key={tIdx} className="border-b border-gray-100 min-h-[64px]">
                                        <td className="p-2 border-r border-gray-200 font-bold text-gray-400 text-center align-top w-16">
                                            {tRow}
                                        </td>
                                        {days.map((d, dIdx) => {
                                            const dayNum = dIdx + 1;
                                            
                                            // Find items from jadwalGrid matching dayNum and tRow hour
                                            const matchingSchedules = jadwalGrid.filter((s: any) => {
                                                const matchesDay = s.hari ? Number(s.hari) === dayNum : true;
                                                const matchesHour = s.jam_mulai ? s.jam_mulai.substring(0, 2) === tRow.substring(0, 2) : false;
                                                return matchesDay && matchesHour;
                                            });

                                            return (
                                                <td key={dIdx} className="p-1 border-r border-gray-200 align-top relative min-w-[110px]">
                                                    {matchingSchedules.length > 0 ? (
                                                        matchingSchedules.map((s: any, sIdx: number) => {
                                                            const isConflict = s.ada_bentrok;
                                                            return (
                                                                <div
                                                                    key={sIdx}
                                                                    className={`mb-1 rounded-xl p-2 shadow-xs transition-all ${
                                                                        isConflict
                                                                            ? 'bg-[#fee2e2] border border-rose-300 animate-pulse text-rose-950'
                                                                            : 'bg-[#dcfce7] border border-emerald-200 text-emerald-950'
                                                                    }`}
                                                                >
                                                                    <span className="font-bold block leading-tight truncate flex items-center gap-1">
                                                                        {isConflict && <i className="fa-solid fa-triangle-exclamation text-rose-600 text-xs"></i>}
                                                                        {s.poli?.nama_poli || 'Poli Umum'}
                                                                    </span>
                                                                    <span className="text-[10px] font-semibold block mt-0.5 opacity-90 truncate">
                                                                        {s.dokter?.nama_lengkap || 'Dokter'}
                                                                    </span>
                                                                    <span className="text-[9px] block mt-1 font-mono opacity-80">
                                                                        {s.jam_mulai?.substring(0,5)} - {s.jam_selesai?.substring(0,5)}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        /* Fallback representation if no real items yet */
                                                        jadwalGrid.length === 0 && (
                                                            (dIdx === 0 && tRow === '08:00') ? (
                                                                <div className="rounded-xl bg-[#dcfce7] border border-emerald-200 p-2 shadow-xs">
                                                                    <span className="font-bold text-emerald-950 block truncate">Poli Penyakit Dalam</span>
                                                                    <span className="text-[10px] text-emerald-800 block truncate">dr. Budi Santoso</span>
                                                                    <span className="text-[9px] text-emerald-700 font-mono block">08:00 - 11:00</span>
                                                                </div>
                                                            ) : (dIdx === 1 && tRow === '10:00') ? (
                                                                <div className="rounded-xl bg-sky-100 border border-sky-200 p-2 shadow-xs">
                                                                    <span className="font-bold text-sky-950 block truncate">Poli Anak</span>
                                                                    <span className="text-[10px] text-sky-800 block truncate">dr. Sarah Wijaya</span>
                                                                    <span className="text-[9px] text-sky-700 font-mono block">10:00 - 14:00</span>
                                                                </div>
                                                            ) : (dIdx === 3 && tRow === '09:00') ? (
                                                                <div className="rounded-xl bg-[#fee2e2] border border-rose-300 p-2 shadow-xs animate-pulse">
                                                                    <span className="font-bold text-rose-950 block truncate flex items-center gap-1">
                                                                        <i className="fa-solid fa-triangle-exclamation text-rose-600 text-xs"></i> Poli Bedah
                                                                    </span>
                                                                    <span className="text-[10px] text-rose-900 block truncate">dr. Andi Gunawan</span>
                                                                    <span className="text-[9px] text-rose-800 font-mono block">09:00 - 12:00</span>
                                                                </div>
                                                            ) : null
                                                        )
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Right Workload Summary Card */}
                    <div className="rounded-2xl border border-[#d3ece7] bg-white p-5 shadow-xs space-y-4">
                        <div>
                            <h3 className="text-base font-bold text-[#145e5b] font-serif">
                                Ringkasan Praktik
                            </h3>
                            <p className="text-xs text-gray-400">Total jam minggu ini</p>
                        </div>

                        <div className="space-y-4">
                            {workloadSummary.length > 0 ? (
                                workloadSummary.map((doc: any, idx: number) => {
                                    const initials = doc.nama_lengkap
                                        ? doc.nama_lengkap.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                                        : 'DR';
                                    const isConflict = doc.has_conflict;

                                    return isConflict ? (
                                        <div key={idx} className="rounded-xl border border-rose-200 bg-[#fee2e2]/50 p-3 space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-rose-200 text-rose-900 font-bold flex items-center justify-center text-xs">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                                                        {doc.nama_lengkap}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-500">{doc.spesialisasi || 'Spesialis'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] font-bold text-rose-700">
                                                <span>Bentrok Jadwal</span>
                                                <span>{doc.conflict_hours || 12} Jam</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-rose-200 overflow-hidden">
                                                <div className="h-full bg-rose-600 rounded-full" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={idx} className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-[#dcfce7] text-emerald-900 font-bold flex items-center justify-center text-xs">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                                                        {doc.nama_lengkap}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-400">{doc.spesialisasi || 'Spesialis'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600">
                                                <span>{doc.logged_hours || 0} Jam / {doc.target_hours || 40} Jam</span>
                                                <span className="font-bold text-gray-900">{doc.percentage || 0}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full bg-[#145e5b] rounded-full" style={{ width: `${doc.percentage || 0}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-gray-500">Tidak ada data dokter.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Jadwal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-[#145e5b] font-serif">Tambah Jadwal Dokter</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 font-bold hover:text-gray-600"><i className="fa-solid fa-xmark"></i></button>
                        </div>

                        <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Pilih Dokter</label>
                                <select
                                    value={selectedDokter}
                                    onChange={(e) => setSelectedDokter(e.target.value)}
                                    className="w-full rounded-xl border border-[#b5e2db] p-2.5 font-semibold outline-none focus:border-[#145e5b]"
                                >
                                    {dokters.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama_lengkap} ({d.spesialisasi})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Poli</label>
                                    <select
                                        value={selectedPoli}
                                        onChange={(e) => setSelectedPoli(e.target.value)}
                                        className="w-full rounded-xl border border-[#b5e2db] p-2.5 font-semibold outline-none"
                                    >
                                        {poliList.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_poli}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Ruangan</label>
                                    <select
                                        value={selectedRuangan}
                                        onChange={(e) => setSelectedRuangan(e.target.value)}
                                        className="w-full rounded-xl border border-[#b5e2db] p-2.5 font-semibold outline-none"
                                    >
                                        {ruanganList.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.nama_ruangan}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Tanggal Praktik</label>
                                <input
                                    type="date"
                                    required
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    className="w-full min-w-[170px] rounded-xl border border-[#b5e2db] p-2.5 font-semibold outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Jam Mulai</label>
                                    <input
                                        type="text"
                                        required
                                        value={jamMulai}
                                        onChange={(e) => setJamMulai(e.target.value)}
                                        placeholder="08:00"
                                        className="w-full rounded-xl border border-[#b5e2db] p-2.5 font-semibold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Jam Selesai</label>
                                    <input
                                        type="text"
                                        required
                                        value={jamSelesai}
                                        onChange={(e) => setJamSelesai(e.target.value)}
                                        placeholder="12:00"
                                        className="w-full rounded-xl border border-[#b5e2db] p-2.5 font-semibold outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-600"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-xl bg-[#145e5b] px-5 py-2 font-bold text-white hover:bg-[#0f4947]"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
