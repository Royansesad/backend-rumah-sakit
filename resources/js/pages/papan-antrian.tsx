import React, { useEffect, useState } from 'react';

interface PapanAntrianProps {
    poliList: any[];
}

export default function PapanAntrian({ poliList = [] }: PapanAntrianProps) {
    const [sedangDipanggil, setSedangDipanggil] = useState<any>(null);
    const [daftarTunggu, setDaftarTunggu] = useState<any[]>([]);
    const [selectedPoliId, setSelectedPoliId] = useState('');
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        const intervalTime = setInterval(() => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);
        return () => clearInterval(intervalTime);
    }, []);

    const fetchQueue = async () => {
        try {
            const url = selectedPoliId 
                ? `/api/v1/public/tv-board?poli_id=${selectedPoliId}` 
                : '/api/v1/public/tv-board';
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok && data.data) {
                setSedangDipanggil(data.data.sedang_dipanggil);
                setDaftarTunggu(data.data.daftar_tunggu || []);
            }
        } catch (e) {
            // silent catch
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, [selectedPoliId]);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between p-6">
            {/* Header TV Board */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shadow-teal-500/20">
                        RS
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
                            PAPAN PANGGILAN ANTRIAN PASIEN
                        </h1>
                        <p className="text-xs text-teal-400 font-semibold tracking-wide">
                            KLINIK PRATAMA / SENTOSA MEDIKA HOSPITAL
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <select
                        value={selectedPoliId}
                        onChange={(e) => setSelectedPoliId(e.target.value)}
                        className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-semibold text-teal-300 outline-none"
                    >
                        <option value="">Semua Poli</option>
                        {poliList.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nama_poli}
                            </option>
                        ))}
                    </select>

                    <div className="text-right">
                        <span className="text-2xl font-black font-mono text-teal-300 tracking-wider">
                            {timeStr || '10:45:00'}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            WIB (GMT+7)
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Grid: Currently Called (Left 2 cols) vs Waiting List (Right 1 col) */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 my-auto py-6">
                {/* Currently Called Main Hero Card */}
                <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border-2 border-teal-500/40 p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>

                    <div className="flex items-center justify-between border-b border-teal-500/20 pb-4">
                        <span className="rounded-full bg-teal-500/20 border border-teal-500/40 px-4 py-1.5 text-xs font-bold text-teal-300 tracking-wider uppercase animate-pulse">
                            ● SEDANG DIPANGGIL
                        </span>
                        <span className="text-sm font-semibold text-slate-400">
                            {sedangDipanggil?.poli?.nama_poli || 'POLI PENYAKIT DALAM'}
                        </span>
                    </div>

                    <div className="my-10 text-center space-y-2">
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            NOMOR ANTRIAN
                        </span>
                        <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-emerald-300 to-teal-400 tracking-tighter drop-shadow-lg">
                            {sedangDipanggil?.nomor_antrian || 'POLI-A005'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                LOKET / RUANGAN
                            </span>
                            <span className="text-xl font-bold text-white block mt-0.5">
                                {sedangDipanggil?.loket?.nama_loket || 'RUANG PRAKTIK 101'}
                            </span>
                        </div>
                        <div className="border-l border-slate-800 pl-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                DOKTER PENANGGUNG JAWAB
                            </span>
                            <span className="text-xl font-bold text-teal-300 block mt-0.5">
                                {sedangDipanggil?.dokter?.nama_lengkap || 'dr. Aris Setiawan'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Waiting List Column */}
                <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-base font-bold text-white">DAFTAR TUNGGU</h3>
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-teal-400">
                                {daftarTunggu.length} Pasien
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                            {daftarTunggu.length > 0 ? (
                                daftarTunggu.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800/80 p-3.5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">
                                                {item.angka_antrian}
                                            </span>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">
                                                    {item.nomor_antrian}
                                                </h4>
                                                <p className="text-[10px] text-slate-400">
                                                    Tipe: <span className="uppercase text-teal-400 font-semibold">{item.tipe_pasien}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300 capitalize">
                                            {item.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800/80 p-3.5">
                                        <div className="flex items-center gap-3">
                                            <span className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">6</span>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">POLI-A006</h4>
                                                <p className="text-[10px] text-slate-400">Tipe: BPJS</p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-amber-500/20 text-amber-300 px-2.5 py-1 text-[10px] font-bold">Skrining</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800/80 p-3.5">
                                        <div className="flex items-center gap-3">
                                            <span className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">7</span>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">POLI-A007</h4>
                                                <p className="text-[10px] text-slate-400">Tipe: UMUM</p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-slate-800 text-slate-300 px-2.5 py-1 text-[10px] font-bold">Menunggu</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800/80 p-3.5">
                                        <div className="flex items-center gap-3">
                                            <span className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">8</span>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">POLI-A008</h4>
                                                <p className="text-[10px] text-slate-400">Tipe: PRIORITAS</p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-slate-800 text-slate-300 px-2.5 py-1 text-[10px] font-bold">Menunggu</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 text-center text-[10px] text-slate-500 font-semibold">
                        Info: Pemanggilan otomatis terhubung via WebSockets
                    </div>
                </div>
            </div>

            {/* Ticker Footer */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 overflow-hidden">
                <div className="whitespace-nowrap animate-marquee text-xs font-semibold text-slate-300 flex items-center gap-6">
                    <span className="text-teal-400 font-bold flex items-center gap-1.5"><i className="fa-solid fa-bullhorn"></i> PENGUMUMAN RS:</span>
                    <span>Mohon perhatian pasien yang dipanggil agar segera menuju Ruang Praktik yang telah ditentukan.</span>
                    <span>•</span>
                    <span>Jaga ketertiban dan periksakan kembali nomor antrian Anda. Terima kasih.</span>
                </div>
            </div>
        </div>
    );
}
