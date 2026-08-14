import React, { useEffect, useState, useRef } from 'react';

interface PapanAntrianProps {
    poliList: any[];
}

export default function PapanAntrian({ poliList = [] }: PapanAntrianProps) {
    const [sedangDipanggil, setSedangDipanggil] = useState<any>(null);
    const [panggilanPerPoli, setPanggilanPerPoli] = useState<any[]>([]);
    const [daftarTunggu, setDaftarTunggu] = useState<any[]>([]);
    const [selectedPoliId, setSelectedPoliId] = useState('');
    const [timeStr, setTimeStr] = useState('');
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const lastCalledIdRef = useRef<string | null>(null);

    // Live clock
    useEffect(() => {
        const intervalTime = setInterval(() => {
            const now = new Date();
            setTimeStr(
                now.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }),
            );
        }, 1000);
        return () => clearInterval(intervalTime);
    }, []);

    // Text to speech Voice Announcement in Indonesian
    const speakCall = (antrian: any) => {
        if (
            !antrian ||
            typeof window === 'undefined' ||
            !('speechSynthesis' in window)
        )
            return;

        try {
            window.speechSynthesis.cancel(); // Stop any pending speech
            const nomorSpaced = antrian.nomor_antrian
                ? antrian.nomor_antrian.split('').join(' ')
                : '';
            const namaPasien = antrian.pasien?.nama_lengkap || '';
            const namaPoli = antrian.poli?.nama_poli || 'Poliklinik';
            const namaDokter = antrian.dokter?.nama_lengkap
                ? `Dokter ${antrian.dokter.nama_lengkap}`
                : '';
            const namaLoket = antrian.loket?.nama_loket || 'ruang pemeriksaan';

            const text = `Panggilan antrian. Nomor antrian, ${nomorSpaced}. Atas nama pasien, ${namaPasien}. Silakan menuju ${namaPoli}, ${namaDokter}, di ${namaLoket}. Terima kasih.`;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            utterance.rate = 0.85;
            utterance.pitch = 1.0;

            // Select Indonesian voice if available in browser
            const voices = window.speechSynthesis.getVoices();
            const indoVoice = voices.find(
                (v) => v.lang.includes('id') || v.lang.includes('ID'),
            );
            if (indoVoice) {
                utterance.voice = indoVoice;
            }

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error('Audio announcement error:', e);
        }
    };

    const fetchQueue = async () => {
        try {
            const url = selectedPoliId
                ? `/api/v1/public/tv-board?poli_id=${selectedPoliId}`
                : '/api/v1/public/tv-board';
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok && data.data) {
                const currentCall = data.data.sedang_dipanggil;

                // If a new call is detected, trigger audio announcement
                if (currentCall && currentCall.id !== lastCalledIdRef.current) {
                    lastCalledIdRef.current = currentCall.id;
                    if (isAudioEnabled) {
                        speakCall(currentCall);
                    }
                }

                setSedangDipanggil(currentCall);
                setPanggilanPerPoli(data.data.panggilan_per_poli || []);
                setDaftarTunggu(data.data.daftar_tunggu || []);
            }
        } catch (e) {
            // silent catch
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 3000);
        return () => clearInterval(interval);
    }, [selectedPoliId, isAudioEnabled]);

    return (
        <div className="flex min-h-screen flex-col justify-between bg-slate-950 p-6 font-sans text-white">
            {/* Header TV Display */}
            <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-800 pb-5 md:flex-row">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-2xl font-black text-slate-950 shadow-lg shadow-teal-500/20">
                        RS
                    </div>
                    <div>
                        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
                            PAPAN PANGGILAN ANTRIAN PASIEN
                        </h1>
                        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-teal-400">
                            <span>SENTOSA MEDIKA HOSPITAL</span>
                            <span>•</span>
                            <span className="font-medium text-emerald-400">
                                ● LIVE SYNCHRONIZED DISPLAY
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Audio Voice Toggle */}
                    <button
                        onClick={() => {
                            const nextState = !isAudioEnabled;
                            setIsAudioEnabled(nextState);
                            if (nextState && sedangDipanggil)
                                speakCall(sedangDipanggil);
                        }}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                            isAudioEnabled
                                ? 'border-teal-500/40 bg-teal-500/20 text-teal-300 hover:bg-teal-500/30'
                                : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            />
                        </svg>
                        {isAudioEnabled
                            ? 'Suara Pemanggilan: Aktif'
                            : 'Suara Pemanggilan: Mute'}
                    </button>

                    <select
                        value={selectedPoliId}
                        onChange={(e) => setSelectedPoliId(e.target.value)}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-teal-300 outline-none focus:border-teal-500"
                    >
                        <option value="">Semua Poliklinik</option>
                        {poliList.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nama_poli}
                            </option>
                        ))}
                    </select>

                    <div className="border-l border-slate-800 pl-2 text-right">
                        <span className="font-mono text-2xl font-black tracking-wider text-teal-300">
                            {timeStr || '00:00:00'}
                        </span>
                        <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            WIB (GMT+7)
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="my-auto grid grid-cols-1 gap-6 py-4 lg:grid-cols-3">
                {/* Left 2 Cols: Main Active Call Hero + Multi Poli Status Grid */}
                <div className="flex flex-col justify-between space-y-6 lg:col-span-2">
                    {/* Hero Card: Currently Called */}
                    <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-3xl border-2 border-teal-500/50 bg-gradient-to-br from-slate-900 via-teal-950/60 to-slate-900 p-8 shadow-2xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl"></div>

                        <div className="flex items-center justify-between border-b border-teal-500/20 pb-4">
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500"></span>
                                </span>
                                <span className="rounded-full border border-teal-500/40 bg-teal-500/20 px-4 py-1 text-xs font-black tracking-wider text-teal-300 uppercase">
                                    SEDANG DIPANGGIL SAAT INI
                                </span>
                            </div>

                            {sedangDipanggil && (
                                <button
                                    onClick={() => speakCall(sedangDipanggil)}
                                    className="flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-teal-500/20 px-3 py-1 text-xs font-bold text-teal-300 transition-all hover:bg-teal-500/40"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Ulangi Suara Panggilan
                                </button>
                            )}
                        </div>

                        {sedangDipanggil ? (
                            <>
                                <div className="my-6 space-y-1 text-center">
                                    <span className="text-xs font-bold tracking-widest text-teal-400 uppercase">
                                        {sedangDipanggil.poli?.nama_poli ||
                                            'POLIKLINIK'}
                                    </span>
                                    <h2 className="bg-gradient-to-r from-teal-200 via-emerald-300 to-teal-400 bg-clip-text text-8xl font-black tracking-tighter text-transparent drop-shadow-2xl">
                                        {sedangDipanggil.nomor_antrian}
                                    </h2>
                                    <p className="mt-2 text-lg font-bold text-slate-200">
                                        Pasien:{' '}
                                        {sedangDipanggil.pasien?.nama_lengkap ||
                                            '-'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 backdrop-blur-md">
                                    <div>
                                        <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            TUJUAN LOKET / RUANGAN
                                        </span>
                                        <span className="mt-0.5 block text-lg font-bold text-white">
                                            {sedangDipanggil.loket
                                                ?.nama_loket ||
                                                sedangDipanggil.poli
                                                    ?.nama_poli ||
                                                'Ruang Dokter'}
                                        </span>
                                    </div>
                                    <div className="border-l border-slate-800 pl-4">
                                        <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            DOKTER PENANGGUNG JAWAB
                                        </span>
                                        <span className="mt-0.5 block text-lg font-bold text-teal-300">
                                            {sedangDipanggil.dokter
                                                ?.nama_lengkap
                                                ? `dr. ${sedangDipanggil.dokter.nama_lengkap}`
                                                : 'Dokter Praktik'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="my-12 space-y-3 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-teal-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-300">
                                    Belum Ada Pemanggilan Antrian
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Pemanggilan pasien dari loket atau ruang
                                    periksa akan ditampilkan otomatis di layar
                                    ini.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Multi-Poli Status Cards (Show current call per Poliklinik) */}
                    <div>
                        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                            <span>STATUS PEMERIKSAAN PER POLIKLINIK</span>
                        </h3>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            {panggilanPerPoli.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-2xl border p-3.5 transition-all ${
                                        item.antrian
                                            ? 'border-teal-500/40 bg-slate-900 shadow-lg'
                                            : 'border-slate-800/80 bg-slate-950/60 opacity-70'
                                    }`}
                                >
                                    <div className="mb-1 flex items-center justify-between">
                                        <span className="truncate text-xs font-bold text-teal-400">
                                            {item.poli?.nama_poli}
                                        </span>
                                        {item.antrian && (
                                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-300 uppercase">
                                                DILAYANI
                                            </span>
                                        )}
                                    </div>

                                    {item.antrian ? (
                                        <div>
                                            <p className="text-2xl font-black text-white">
                                                {item.antrian.nomor_antrian}
                                            </p>
                                            <p className="truncate text-[11px] font-semibold text-slate-300">
                                                {
                                                    item.antrian.pasien
                                                        ?.nama_lengkap
                                                }
                                            </p>
                                            <p className="mt-0.5 truncate text-[9px] text-slate-400">
                                                dr.{' '}
                                                {
                                                    item.antrian.dokter
                                                        ?.nama_lengkap
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="py-2">
                                            <p className="text-xs font-medium text-slate-500">
                                                Kosong / Menunggu
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Waiting List */}
                <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
                    <div>
                        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    DAFTAR ANTRIAN TUNGGU
                                </h3>
                                <p className="text-[10px] text-slate-400">
                                    Urutan pasien berikutnya
                                </p>
                            </div>
                            <span className="rounded-full border border-teal-500/30 bg-teal-500/20 px-3 py-1 text-xs font-bold text-teal-300">
                                {daftarTunggu.length} Pasien
                            </span>
                        </div>

                        <div className="max-h-[460px] space-y-2.5 overflow-y-auto pr-1">
                            {daftarTunggu.length > 0 ? (
                                daftarTunggu.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950 p-3 transition-colors hover:border-slate-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-xs font-black text-teal-300">
                                                {item.angka_antrian}
                                            </span>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">
                                                    {item.nomor_antrian}
                                                </h4>
                                                <p className="text-[10px] text-slate-400">
                                                    {item.pasien
                                                        ?.nama_lengkap ||
                                                        'Pasien'}{' '}
                                                    •{' '}
                                                    <span className="font-semibold text-teal-400">
                                                        {item.poli?.nama_poli}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase ${
                                                item.status === 'skrining'
                                                    ? 'border border-blue-500/30 bg-blue-500/20 text-blue-300'
                                                    : 'border border-amber-500/30 bg-amber-500/20 text-amber-300'
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-2 py-16 text-center text-slate-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mx-auto h-10 w-10 opacity-40"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <p className="text-xs font-semibold">
                                        Tidak Ada Pasien Menunggu
                                    </p>
                                    <p className="text-[10px]">
                                        Semua antrian telah selesai dilayani.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 text-center text-[10px] font-medium text-slate-400">
                        Sistem Informasi Manajemen Rumah Sakit Sentosa Medika
                    </div>
                </div>
            </div>

            {/* Ticker Footer */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-3">
                <div className="animate-marquee flex items-center gap-6 text-xs font-semibold whitespace-nowrap text-slate-300">
                    <span className="flex items-center gap-1.5 font-bold text-teal-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="inline h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                            />
                        </svg>
                        INFORMASI LAYANAN:
                    </span>
                    <span>
                        Mohon perhatikan nomor antrian yang dipanggil di layar
                        TV Display dan pengeras suara.
                    </span>
                    <span>•</span>
                    <span>
                        Pastikan berkas BPJS / Kartu Berobat sudah disiapkan
                        saat memasuki ruang pemeriksaan.
                    </span>
                    <span>•</span>
                    <span>
                        Terima kasih atas kerja sama Anda di Rumah Sakit Sentosa
                        Medika.
                    </span>
                </div>
            </div>
        </div>
    );
}
