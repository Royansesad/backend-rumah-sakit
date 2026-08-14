import { Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowUpDown,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    Download,
    FileText,
    FlaskConical,
    HelpCircle,
    MapPin,
    MessageCircle,
    Phone,
    Pill,
    Plus,
    Printer,
    Send,
    SlidersHorizontal,
    Stethoscope,
    User as UserIcon,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { PatientLayout } from '../../components/patient-layout';

interface PoliOption {
    id: string;
    nama_poli: string;
}

interface VitalSignItem {
    parameter: string;
    hasil: string;
    status: string;
    status_badge?: 'danger' | 'warning' | 'success' | 'neutral';
}

interface DiagnosisUtama {
    judul: string;
    icd10_code: string;
    icd10_desc: string;
}

interface LabTestItem {
    parameter: string;
    hasil: string;
    satuan: string;
    rujukan: string;
    status: string;
}

interface HasilPenunjang {
    id: string;
    judul: string;
    instansi: string;
    tanggal: string;
    no_lab?: string;
    analis?: string;
    dokter_pj?: string;
    items: LabTestItem[];
    kesimpulan?: string;
}

interface TerapiObatItem {
    nama_obat: string;
    aturan_pakai: string;
    sediaan?: string;
    jumlah?: number;
    catatan?: string;
}

interface DokterInfo {
    nama: string;
    spesialisasi: string;
    foto?: string | null;
    no_hp?: string | null;
    nomor_str?: string;
    nomor_sip?: string;
}

interface KunjunganTimelineItem {
    id: string;
    tanggal_day: string;
    tanggal_month: string;
    tanggal_year: string;
    tanggal_full: string;
    tanggal_iso: string;
    dokter: DokterInfo;
    poli: string;
    jenis_layanan: string;
    waktu_layanan: string;
    lokasi: string;
    keluhan_singkat: string;
    keluhan_anamnesis: string;
    pemeriksaan_fisik: VitalSignItem[];
    diagnosis_utama: DiagnosisUtama;
    hasil_penunjang?: HasilPenunjang | null;
    terapi_obat: TerapiObatItem[];
    rencana_followup?: string | null;
    catatan_dokter: string;
}

interface RiwayatProps {
    user?: any;
    role?: string;
    pasien?: any;
    riwayatTimeline?: KunjunganTimelineItem[];
    poliList?: PoliOption[];
    totalKunjunganTahunIni?: number;
    kunjunganRawatJalan?: any[];
    rawatInap?: any[];
    tagihan?: any[];
}

export default function Riwayat({
    user,
    pasien,
    riwayatTimeline = [],
    poliList = [],
    totalKunjunganTahunIni,
}: RiwayatProps) {
    // Expand/Collapse state: Default first card is open
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
        () => {
            const initial: Record<string, boolean> = {};
            if (riwayatTimeline.length > 0) {
                initial[riwayatTimeline[0].id] = true;
            }
            return initial;
        },
    );

    // Filters & Sorting state
    const [selectedPoli, setSelectedPoli] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // Modals
    const [selectedLabModal, setSelectedLabModal] =
        useState<HasilPenunjang | null>(null);
    const [selectedDoctorChat, setSelectedDoctorChat] = useState<{
        dokter: DokterInfo;
        visitDate: string;
        poli: string;
    } | null>(null);
    const [activePrintVisit, setActivePrintVisit] =
        useState<KunjunganTimelineItem | null>(null);

    // Doctor Consultation Form State
    const [chatMessage, setChatMessage] = useState('');
    const [chatSuccessMessage, setChatSuccessMessage] = useState(false);

    // Toggle card accordion
    const toggleCard = (id: string) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Filter and Sort visits
    const filteredVisits = useMemo(() => {
        let list = [...riwayatTimeline];

        if (selectedPoli !== 'all') {
            list = list.filter(
                (v) =>
                    v.poli.toLowerCase() === selectedPoli.toLowerCase() ||
                    v.poli
                        .toLowerCase()
                        .includes(selectedPoli.toLowerCase().replace('poli ', '')),
            );
        }

        list.sort((a, b) => {
            const dateA = new Date(a.tanggal_iso).getTime();
            const dateB = new Date(b.tanggal_iso).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return list;
    }, [riwayatTimeline, selectedPoli, sortOrder]);

    const handleSortToggle = () => {
        setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    };

    // Print helper
    const handlePrintResume = (visit: KunjunganTimelineItem) => {
        setActivePrintVisit(visit);
        setTimeout(() => {
            window.print();
        }, 150);
    };

    // Download resume as file
    const handleDownloadRingkasan = (visit: KunjunganTimelineItem) => {
        const lines = [
            '==========================================================',
            '          RUMAH SAKIT SENTOSA MEDIKA - RESUME MEDIS       ',
            '        Jl. Jenderal Sudirman No. 45, Jakarta Selatan     ',
            '==========================================================',
            '',
            `Nomor Rekam Medis : ${pasien?.nomor_rekam_medis || user?.nomor_rekam_medis || '-'}`,
            `Nama Pasien       : ${pasien?.nama_lengkap || user?.nama_lengkap || '-'}`,
            `Tanggal Kunjungan : ${visit.tanggal_full}`,
            `Waktu & Lokasi    : ${visit.waktu_layanan} (${visit.lokasi})`,
            `Dokter Pemeriksa  : ${visit.dokter.nama} (${visit.dokter.spesialisasi})`,
            `Poli Layanan      : ${visit.poli} - ${visit.jenis_layanan}`,
            '',
            '----------------------------------------------------------',
            '1. KELUHAN & ANAMNESIS',
            '----------------------------------------------------------',
            visit.keluhan_anamnesis,
            '',
            '----------------------------------------------------------',
            '2. PEMERIKSAAN FISIK & TANDA VITAL',
            '----------------------------------------------------------',
            ...visit.pemeriksaan_fisik.map(
                (v) => `- ${v.parameter.padEnd(20)} : ${v.hasil} (${v.status})`,
            ),
            '',
            '----------------------------------------------------------',
            '3. DIAGNOSIS UTAMA',
            '----------------------------------------------------------',
            `Diagnosis : ${visit.diagnosis_utama.judul}`,
            `ICD-10    : ${visit.diagnosis_utama.icd10_desc}`,
            '',
            ...(visit.hasil_penunjang
                ? [
                      '----------------------------------------------------------',
                      '4. HASIL PEMERIKSAAN PENUNJANG (LABORATORIUM)',
                      '----------------------------------------------------------',
                      `Pemeriksaan : ${visit.hasil_penunjang.judul}`,
                      `Instansi    : ${visit.hasil_penunjang.instansi}`,
                      ...visit.hasil_penunjang.items.map(
                          (item) =>
                              `- ${item.parameter.padEnd(18)} : ${item.hasil} ${item.satuan} (Rujukan: ${item.rujukan}) [${item.status}]`,
                      ),
                      `Kesimpulan  : ${visit.hasil_penunjang.kesimpulan || '-'}`,
                      '',
                  ]
                : []),
            '----------------------------------------------------------',
            '5. TERAPI & OBAT (RESEP)',
            '----------------------------------------------------------',
            ...visit.terapi_obat.map(
                (t, idx) => `${idx + 1}. ${t.nama_obat} - ${t.aturan_pakai}`,
            ),
            '',
            '----------------------------------------------------------',
            '6. CATATAN & RENCANA TINDAK LANJUT DOKTER',
            '----------------------------------------------------------',
            visit.catatan_dokter,
            `Rencana Follow-up / Kontrol : ${visit.rencana_followup || '-'}`,
            '',
            '==========================================================',
            'Dokumen ini merupakan ringkasan rekam medis elektronik resmi.',
            'Dicetak otomatis oleh SIMRS Sentosa Medika Patient Portal.',
        ];

        const textContent = lines.join('\n');
        const blob = new Blob([textContent], {
            type: 'text/plain;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Resume_Medis_${visit.tanggal_iso}_${(pasien?.nama_lengkap || 'Pasien').replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Submit inquiry message to doctor
    const handleSendDoctorMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        setChatSuccessMessage(true);
        setTimeout(() => {
            setChatSuccessMessage(false);
            setChatMessage('');
            setSelectedDoctorChat(null);
        }, 2000);
    };

    return (
        <PatientLayout user={user}>
            {/* Screen View */}
            <div className="space-y-6 print:hidden">
                {/* Breadcrumbs & Header Title */}
                <div>
                    <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Link
                            href="/portal"
                            className="text-slate-500 transition-colors hover:text-[#145e5b]"
                        >
                            Dashboard
                        </Link>
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                        <span className="font-semibold text-[#145e5b]">
                            Riwayat Kunjungan
                        </span>
                    </nav>

                    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#17524c] sm:text-4xl">
                                Riwayat Kunjungan
                            </h1>
                            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                                Total{' '}
                                {totalKunjunganTahunIni ?? filteredVisits.length}{' '}
                                kunjungan tahun ini
                            </p>
                        </div>

                        {/* Top Filters & Sort */}
                        <div className="flex items-center gap-2.5">
                            {/* Poli Dropdown */}
                            <div className="relative">
                                <select
                                    aria-label="Filter berdasarkan poli"
                                    value={selectedPoli}
                                    onChange={(e) =>
                                        setSelectedPoli(e.target.value)
                                    }
                                    className="cursor-pointer appearance-none rounded-xl border border-slate-200/90 bg-white py-2 pr-8 pl-3 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                >
                                    <option value="all">Semua Poli</option>
                                    {poliList.map((p) => (
                                        <option
                                            key={p.id}
                                            value={p.nama_poli}
                                        >
                                            {p.nama_poli}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            </div>

                            {/* Sort Button */}
                            <button
                                type="button"
                                onClick={handleSortToggle}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-95"
                                title={`Urutan: ${sortOrder === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'}`}
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-600" />
                                <span>Sortir</span>
                                <span className="text-[10px] font-normal text-slate-400">
                                    ({sortOrder === 'desc' ? 'Terbaru' : 'Terlama'})
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Timeline Container */}
                <div className="relative mt-6 pt-2">
                    {/* Left Vertical Timeline Line */}
                    <div className="absolute top-6 bottom-6 left-[18px] w-0.5 bg-[#dbe8e3] sm:left-[22px]" />

                    {/* Visit List */}
                    <div className="space-y-6">
                        {filteredVisits.length > 0 ? (
                            filteredVisits.map((visit) => {
                                const isExpanded = !!expandedCards[visit.id];

                                return (
                                    <div
                                        key={visit.id}
                                        className="relative flex items-start gap-4 sm:gap-6"
                                    >
                                        {/* Timeline Date & Node Indicator */}
                                        <div className="relative z-10 flex w-10 shrink-0 flex-col items-center pt-5 text-center sm:w-12">
                                            {/* Circular Bullet */}
                                            <div className="h-3 w-3 rounded-full bg-[#145e5b] ring-4 ring-[#e4f6f2]" />

                                            {/* Date Stacked */}
                                            <div className="mt-3">
                                                <div className="text-xs font-bold text-slate-800 sm:text-sm">
                                                    {visit.tanggal_day}{' '}
                                                    {visit.tanggal_month}
                                                </div>
                                                <div className="text-[10px] font-medium text-slate-400">
                                                    {visit.tanggal_year}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visit Card Box */}
                                        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:border-slate-300">
                                            {/* Card Header (Accordion Toggle) */}
                                            <div
                                                onClick={() =>
                                                    toggleCard(visit.id)
                                                }
                                                className="flex cursor-pointer items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate font-sans text-sm font-bold text-slate-900 sm:text-base">
                                                        {visit.dokter.nama}
                                                    </h3>
                                                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                                                        {visit.poli} •{' '}
                                                        {visit.jenis_layanan}
                                                    </p>
                                                </div>

                                                {/* Keluhan Preview (Desktop) */}
                                                <div className="mr-4 hidden max-w-xs truncate text-right text-xs text-slate-500 md:block lg:max-w-md">
                                                    {visit.keluhan_singkat}
                                                </div>

                                                {/* Chevron Toggle Button */}
                                                <button
                                                    type="button"
                                                    aria-label={
                                                        isExpanded
                                                            ? 'Tutup rincian'
                                                            : 'Buka rincian'
                                                    }
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Card Expanded Content */}
                                            {isExpanded && (
                                                <div className="border-t border-slate-100 p-5 pt-4 sm:p-6 sm:pt-5">
                                                    {/* Section 1: Waktu & Lokasi + Keluhan & Anamnesis */}
                                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                                                        {/* WAKTU & LOKASI */}
                                                        <div className="md:col-span-4 lg:col-span-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e4f6f2] font-serif text-sm font-bold text-[#145e5b] ring-1 ring-[#cde8e1]">
                                                                    {visit.dokter.nama
                                                                        .split(' ')
                                                                        .map(
                                                                            (
                                                                                n,
                                                                            ) =>
                                                                                n[0],
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .join('')}
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                                        Waktu &
                                                                        Lokasi
                                                                    </span>
                                                                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                                                        <Clock className="h-3.5 w-3.5 text-teal-600" />
                                                                        <span>
                                                                            {
                                                                                visit.waktu_layanan
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                                                        <MapPin className="h-3.5 w-3.5 text-teal-600" />
                                                                        <span>
                                                                            {
                                                                                visit.lokasi
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* KELUHAN & ANAMNESIS */}
                                                        <div className="md:col-span-8 lg:col-span-8">
                                                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                                Keluhan &
                                                                Anamnesis
                                                            </span>
                                                            <div className="mt-1 rounded-xl border border-slate-200/90 bg-white p-3.5 text-xs leading-relaxed text-slate-700 shadow-2xs">
                                                                {
                                                                    visit.keluhan_anamnesis
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section 2: PEMERIKSAAN FISIK + DIAGNOSIS UTAMA & HASIL PENUNJANG */}
                                                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-12">
                                                        {/* PEMERIKSAAN FISIK */}
                                                        <div className="md:col-span-6">
                                                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                                Pemeriksaan
                                                                Fisik
                                                            </span>
                                                            <div className="mt-1 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
                                                                <table className="w-full text-left text-xs">
                                                                    <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                                                                        <tr>
                                                                            <th className="px-3.5 py-2">
                                                                                Parameter
                                                                            </th>
                                                                            <th className="px-3.5 py-2">
                                                                                Hasil
                                                                            </th>
                                                                            <th className="px-3.5 py-2 text-center">
                                                                                Status
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-100 text-xs">
                                                                        {visit.pemeriksaan_fisik.map(
                                                                            (
                                                                                p,
                                                                                idx,
                                                                            ) => (
                                                                                <tr
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                >
                                                                                    <td className="px-3.5 py-2.5 font-medium text-slate-700">
                                                                                        {
                                                                                            p.parameter
                                                                                        }
                                                                                    </td>
                                                                                    <td className="px-3.5 py-2.5 font-bold text-slate-900">
                                                                                        {
                                                                                            p.hasil
                                                                                        }
                                                                                    </td>
                                                                                    <td className="px-3.5 py-2.5 text-center">
                                                                                        {p.status ===
                                                                                        '-' ? (
                                                                                            <span className="text-slate-400">
                                                                                                -
                                                                                            </span>
                                                                                        ) : p.status_badge ===
                                                                                          'danger' ? (
                                                                                            <span className="inline-block rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                                                                                                {
                                                                                                    p.status
                                                                                                }
                                                                                            </span>
                                                                                        ) : p.status_badge ===
                                                                                          'warning' ? (
                                                                                            <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                                                                                                {
                                                                                                    p.status
                                                                                                }
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-[#145e5b]">
                                                                                                {
                                                                                                    p.status
                                                                                                }
                                                                                            </span>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ),
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                        {/* DIAGNOSIS UTAMA & HASIL PENUNJANG */}
                                                        <div className="space-y-4 md:col-span-6">
                                                            {/* Diagnosis Utama */}
                                                            <div>
                                                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                                    Diagnosis
                                                                    Utama
                                                                </span>
                                                                <div className="mt-1 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/40 p-3.5 shadow-2xs">
                                                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                                                                    <div>
                                                                        <div className="text-xs font-bold text-slate-900 sm:text-sm">
                                                                            {
                                                                                visit
                                                                                    .diagnosis_utama
                                                                                    .judul
                                                                            }
                                                                        </div>
                                                                        <div className="mt-0.5 text-[11px] text-slate-500">
                                                                            {
                                                                                visit
                                                                                    .diagnosis_utama
                                                                                    .icd10_desc
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Hasil Penunjang */}
                                                            {visit.hasil_penunjang && (
                                                                <div className="mt-1 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/40 p-3.5 shadow-2xs">
                                                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                                                                    <div>
                                                                        <div className="text-xs font-bold text-slate-900 sm:text-sm">
                                                                            {
                                                                                visit
                                                                                    .diagnosis_utama
                                                                                    .judul
                                                                            }
                                                                        </div>
                                                                        <div className="mt-0.5 text-[11px] text-slate-500">
                                                                            {
                                                                                visit
                                                                                    .diagnosis_utama
                                                                                    .icd10_desc
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Section 3: TERAPI & OBAT + CATATAN DOKTER */}
                                                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-12">
                                                        {/* TERAPI & OBAT */}
                                                        <div className="space-y-2.5 md:col-span-6">
                                                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                                Terapi & Obat
                                                            </span>

                                                            {visit.terapi_obat.map(
                                                                (med, idx) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex items-start gap-3 rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs"
                                                                    >
                                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e4f6f2] text-[#145e5b]">
                                                                            <Plus className="h-4 w-4 stroke-[2.5]" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs font-bold text-slate-900">
                                                                                {
                                                                                    med.nama_obat
                                                                                }
                                                                            </div>
                                                                            <div className="mt-0.5 text-[11px] text-slate-500">
                                                                                {
                                                                                    med.aturan_pakai
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}

                                                            {/* Rencana Follow-up Banner */}
                                                            {visit.rencana_followup && (
                                                                <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-[#e4f6f2] px-3 py-2.5 text-xs text-[#145e5b]">
                                                                    <Calendar className="h-4 w-4 shrink-0 text-[#145e5b]" />
                                                                    <span>
                                                                        Rencana
                                                                        Follow-up:{' '}
                                                                        <strong>
                                                                            {
                                                                                visit.rencana_followup
                                                                            }
                                                                        </strong>
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* CATATAN DOKTER */}
                                                        <div className="md:col-span-6">
                                                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                                Catatan Dokter
                                                            </span>
                                                            <div className="relative mt-1 flex min-h-[110px] items-center rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                                                                {/* Decorative Quote Mark */}
                                                                <span className="pointer-events-none absolute top-1 right-3 select-none font-serif text-4xl text-[#94c4bb] opacity-40">
                                                                    “
                                                                </span>
                                                                <p className="text-xs leading-relaxed font-normal text-slate-700 italic">
                                                                    “
                                                                    {
                                                                        visit.catatan_dokter
                                                                    }
                                                                    ”
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section 4: Action Buttons Footer */}
                                                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                                                        {/* Print Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handlePrintResume(
                                                                    visit,
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-95"
                                                        >
                                                            <Printer className="h-3.5 w-3.5 text-slate-600" />
                                                            <span>Print</span>
                                                        </button>

                                                        {/* Hubungi Dokter Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedDoctorChat(
                                                                    {
                                                                        dokter: visit.dokter,
                                                                        visitDate:
                                                                            visit.tanggal_full,
                                                                        poli: visit.poli,
                                                                    },
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 rounded-xl bg-[#cde8e1] px-4 py-2 text-xs font-bold text-[#145e5b] shadow-2xs transition-all hover:bg-[#bee0d8] active:scale-95"
                                                        >
                                                            <MessageCircle className="h-3.5 w-3.5 text-[#145e5b]" />
                                                            <span>
                                                                Hubungi Dokter
                                                            </span>
                                                        </button>

                                                        {/* Download Ringkasan Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDownloadRingkasan(
                                                                    visit,
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 rounded-xl bg-[#145e5b] px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all hover:bg-[#0f4a47] active:scale-95"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            <span>
                                                                Download
                                                                Ringkasan
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-[#145e5b]">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <h3 className="mt-3 font-serif text-base font-bold text-slate-800">
                                    Tidak Ada Riwayat Kunjungan
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Tidak ditemukan riwayat untuk filter poli
                                    yang dipilih.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPoli('all')}
                                    className="mt-4 rounded-xl bg-[#145e5b] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f4a47]"
                                >
                                    Tampilkan Semua Poli
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Hasil Laboratorium & Penunjang Medis */}
            {selectedLabModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setSelectedLabModal(null)}
                    />
                    <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <FlaskConical className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        {selectedLabModal.judul}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {selectedLabModal.instansi}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedLabModal(null)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Meta Info */}
                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 sm:grid-cols-4">
                            <div>
                                <span className="text-[10px] text-slate-400">
                                    No. Laboratorium
                                </span>
                                <div className="font-bold text-slate-800">
                                    {selectedLabModal.no_lab ||
                                        'LAB-20231012-098'}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400">
                                    Tanggal Periksa
                                </span>
                                <div className="font-bold text-slate-800">
                                    {selectedLabModal.tanggal}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400">
                                    Analis Lab
                                </span>
                                <div className="font-bold text-slate-800">
                                    {selectedLabModal.analis ||
                                        'Amd. AK. Siti R.'}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400">
                                    Dokter Penanggung Jawab
                                </span>
                                <div className="font-bold text-slate-800">
                                    {selectedLabModal.dokter_pj ||
                                        'dr. Hendra P., Sp.PK'}
                                </div>
                            </div>
                        </div>

                        {/* Table Parameters */}
                        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                                    <tr>
                                        <th className="p-3">Pemeriksaan</th>
                                        <th className="p-3">Hasil</th>
                                        <th className="p-3">Satuan</th>
                                        <th className="p-3">Nilai Rujukan</th>
                                        <th className="p-3 text-center">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {selectedLabModal.items.map((item, idx) => (
                                        <tr
                                            key={idx}
                                            className={
                                                item.status !== 'Normal'
                                                    ? 'bg-rose-50/30'
                                                    : ''
                                            }
                                        >
                                            <td className="p-3 font-medium text-slate-800">
                                                {item.parameter}
                                            </td>
                                            <td className="p-3 font-bold text-slate-900">
                                                {item.hasil}
                                            </td>
                                            <td className="p-3 text-slate-500">
                                                {item.satuan}
                                            </td>
                                            <td className="p-3 text-slate-500">
                                                {item.rujukan}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                        item.status === 'Normal'
                                                            ? 'bg-teal-50 text-[#145e5b]'
                                                            : item.status ===
                                                                'Tinggi'
                                                              ? 'bg-rose-50 text-rose-600'
                                                              : 'bg-amber-50 text-amber-700'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Kesimpulan */}
                        {selectedLabModal.kesimpulan && (
                            <div className="mt-4 rounded-2xl border border-teal-100 bg-[#e4f6f2]/50 p-3.5 text-xs text-slate-700">
                                <span className="font-bold text-[#145e5b]">
                                    Kesimpulan Laboratorium:
                                </span>
                                <p className="mt-0.5 text-slate-600">
                                    {selectedLabModal.kesimpulan}
                                </p>
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="mt-6 flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                <Printer className="h-3.5 w-3.5 text-slate-600" />
                                <span>Cetak Hasil Lab</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedLabModal(null)}
                                className="rounded-xl bg-[#145e5b] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f4a47]"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Hubungi Dokter / Telekonsultasi */}
            {selectedDoctorChat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setSelectedDoctorChat(null)}
                    />
                    <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <MessageCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Hubungi Dokter Pemeriksa
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Konsultasi lanjutan tindak lanjut
                                        perawatan
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedDoctorChat(null)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Doctor Card */}
                        <div className="mt-4 flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#145e5b] font-serif text-sm font-bold text-white">
                                {selectedDoctorChat.dokter.nama
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                    {selectedDoctorChat.dokter.nama}
                                </h4>
                                <p className="text-xs text-slate-500">
                                    {selectedDoctorChat.dokter.spesialisasi} •{' '}
                                    {selectedDoctorChat.poli}
                                </p>
                                <p className="mt-0.5 text-[10px] text-slate-400">
                                    Kunjungan Terakhir:{' '}
                                    {selectedDoctorChat.visitDate}
                                </p>
                            </div>
                        </div>

                        {/* WhatsApp Direct Option */}
                        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-emerald-900">
                                        Chat WhatsApp Klinik Dokter
                                    </div>
                                    <div className="text-[11px] text-emerald-700">
                                        Respon cepat dari tim asisten perawat
                                        klinik
                                    </div>
                                </div>
                                <a
                                     href={`https://wa.me/${
                                         selectedDoctorChat.dokter.no_hp
                                             ? selectedDoctorChat.dokter.no_hp
                                                   .replace(/\D/g, '')
                                                   .replace(/^0/, '62')
                                             : '6281234567801'
                                     }?text=${encodeURIComponent(
                                         `Halo RS Sentosa Medika, saya ${pasien?.nama_lengkap || user?.nama_lengkap || 'Pasien'} (No. RM: ${pasien?.nomor_rekam_medis || user?.nomor_rekam_medis || '-'}) ingin berkonsultasi mengenai hasil pemeriksaan saya dengan ${selectedDoctorChat.dokter.nama} pada tanggal ${selectedDoctorChat.visitDate}.`,
                                     )}`}
                                     target="_blank"
                                     rel="noreferrer"
                                     className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                                 >
                                     <Phone className="h-3.5 w-3.5" />
                                     <span>Buka WA</span>
                                 </a>
                            </div>
                        </div>

                        {/* Message Form in Portal */}
                        <form
                            onSubmit={handleSendDoctorMessage}
                            className="mt-4 space-y-3"
                        >
                            <label className="block text-xs font-bold text-slate-700">
                                Atau Tinggalkan Pesan / Pertanyaan di Portal:
                            </label>
                            <textarea
                                rows={3}
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Tuliskan keluhan atau pertanyaan Anda mengenai obat, dosis, atau gejala..."
                                className="w-full rounded-2xl border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 placeholder-slate-400 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                            />

                            {chatSuccessMessage && (
                                <div className="flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-xs font-bold text-[#145e5b]">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>
                                        Pesan berhasil dikirimkan ke tim dokter.
                                        Anda akan menerima notifikasi balasan.
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDoctorChat(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={!chatMessage.trim()}
                                    className="flex items-center gap-1.5 rounded-xl bg-[#145e5b] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f4a47] disabled:opacity-50"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Kirim Pesan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Printable Resume Medis Component (Only visible during Window Print) */}
            {activePrintVisit && (
                <div className="hidden text-black print:block print:p-8">
                    <div className="border-b-2 border-black pb-4 text-center">
                        <h2 className="text-xl font-bold tracking-wider uppercase">
                            Rumah Sakit Sentosa Medika
                        </h2>
                        <p className="text-xs">
                            Jl. Jenderal Sudirman No. 45, Jakarta Selatan | Telp:
                            (021) 555-0199 | www.sentosamedika.id
                        </p>
                        <h3 className="mt-3 text-base font-bold underline uppercase">
                            Ringkasan Pelayanan Rawat Jalan (Resume Medis)
                        </h3>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <p>
                                <strong>Nama Pasien:</strong>{' '}
                                {pasien?.nama_lengkap || user?.nama_lengkap || '-'}
                            </p>
                            <p>
                                <strong>No. Rekam Medis:</strong>{' '}
                                {pasien?.nomor_rekam_medis ||
                                    user?.nomor_rekam_medis || '-'}
                            </p>
                            <p>
                                <strong>Tanggal Lahir / Umur:</strong>{' '}
                                {pasien?.tanggal_lahir
                                    ? new Date(pasien.tanggal_lahir).toLocaleDateString('id-ID', {
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                      })
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <p>
                                <strong>Tanggal Pemeriksaan:</strong>{' '}
                                {activePrintVisit.tanggal_full}
                            </p>
                            <p>
                                <strong>Dokter Pemeriksa:</strong>{' '}
                                {activePrintVisit.dokter.nama}
                            </p>
                            <p>
                                <strong>Poli / Unit Layanan:</strong>{' '}
                                {activePrintVisit.poli}
                            </p>
                        </div>
                    </div>

                    <hr className="my-4 border-slate-300" />

                    <div className="space-y-4 text-xs">
                        <div>
                            <h4 className="font-bold uppercase">
                                1. Keluhan & Anamnesis
                            </h4>
                            <p className="mt-1">
                                {activePrintVisit.keluhan_anamnesis}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold uppercase">
                                2. Tanda Vital & Pemeriksaan Fisik
                            </h4>
                            <div className="mt-1 grid grid-cols-4 gap-2 border p-2">
                                {activePrintVisit.pemeriksaan_fisik.map(
                                    (item, i) => (
                                        <div key={i}>
                                            <span className="text-gray-600">
                                                {item.parameter}:
                                            </span>{' '}
                                            <strong>{item.hasil}</strong>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold uppercase">
                                3. Diagnosis Utama
                            </h4>
                            <p className="mt-1">
                                <strong>
                                    {activePrintVisit.diagnosis_utama.judul}
                                </strong>{' '}
                                ({activePrintVisit.diagnosis_utama.icd10_desc})
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold uppercase">
                                4. Terapi & Obat
                            </h4>
                            <ul className="mt-1 list-disc pl-5">
                                {activePrintVisit.terapi_obat.map(
                                    (med, idx) => (
                                        <li key={idx}>
                                            <strong>{med.nama_obat}</strong> —{' '}
                                            {med.aturan_pakai}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold uppercase">
                                5. Edukasi & Catatan Dokter
                            </h4>
                            <p className="mt-1">
                                {activePrintVisit.catatan_dokter}
                            </p>
                            <p className="mt-2">
                                <strong>Rencana Jadwal Kontrol:</strong>{' '}
                                {activePrintVisit.rencana_followup || '-'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end text-xs">
                        <div className="text-center">
                            <p>
                                Jakarta,{' '}
                                {activePrintVisit.tanggal_full || 'Hari Ini'}
                            </p>
                            <p className="mt-1">Dokter Penanggung Jawab,</p>
                            <div className="my-8 font-serif font-bold text-slate-400">
                                ( Tanda Tangan Digital Tersertifikasi )
                            </div>
                            <p className="font-bold underline">
                                {activePrintVisit.dokter.nama}
                            </p>
                            <p className="text-[10px] text-gray-500">
                                SIP:{' '}
                                {activePrintVisit.dokter.nomor_sip ||
                                    activePrintVisit.dokter.nomor_str ||
                                    '-'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </PatientLayout>
    );
}
