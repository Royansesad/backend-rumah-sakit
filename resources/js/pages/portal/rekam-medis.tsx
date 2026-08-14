import { Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { PatientLayout } from '../../components/patient-layout';

interface PasienSnapshot {
    id: string;
    nama_lengkap: string;
    nomor_rekam_medis: string;
    tanggal_lahir?: string;
    tanggal_lahir_label: string;
    usia: number;
    golongan_darah: string;
    alergi: string;
    kondisi_kronis: string;
    foto_profil?: string | null;
}

interface HasilRadiologiItem {
    id: string;
    judul_pemeriksaan: string;
    kategori: string;
    tanggal_pemeriksaan: string;
    tanggal_label: string;
    dokter_radiologi: string;
    indikasi_klinis?: string;
    temuan?: string;
    kesimpulan?: string;
    file_path?: string | null;
    status: string;
}

interface RiwayatDiagnosaItem {
    id: string;
    status: 'aktif' | 'sembuh' | 'kronis' | string;
    status_label: string;
    badge_color: string;
    tahun: string;
    tanggal_lengkap?: string;
    judul: string;
    dokter_poli: string;
    keluhan_utama?: string;
    catatan_dokter?: string;
    sistol?: number;
    diastol?: number;
    suhu_tubuh?: number | string;
    icd10_code?: string;
}

interface ResepItem {
    id: string | number;
    resep_id?: string;
    obat_id?: number;
    nama_obat: string;
    bentuk_sediaan?: string;
    aturan_pakai: string;
    kategori_obat?: string;
    sisa_tablet?: number | null;
    jumlah_dosis?: number;
    catatan?: string;
    tanggal_resep?: string;
    dokter?: string;
    status_resep?: string;
}

interface PermintaanRefillItem {
    id: string;
    nama_obat: string;
    dosis_diminta: number;
    catatan?: string;
    status: string;
    status_label: string;
    tanggal: string;
}

interface RekamMedisProps {
    user?: any;
    role?: string;
    pasien: PasienSnapshot;
    hasilRadiologi: HasilRadiologiItem[];
    riwayatDiagnosa: RiwayatDiagnosaItem[];
    resepAktif: ResepItem[];
    riwayatResep: ResepItem[];
    permintaanRefillList?: PermintaanRefillItem[];
    rekamMedis?: any[];
}

export default function RekamMedisPage({
    user,
    pasien,
    hasilRadiologi = [],
    riwayatDiagnosa = [],
    resepAktif = [],
    riwayatResep = [],
    permintaanRefillList = [],
}: RekamMedisProps) {
    const { flash } = usePage().props as any;

    // Accordion State
    const [openRadiologiId, setOpenRadiologiId] = useState<string | null>(
        hasilRadiologi[0]?.id || null,
    );

    // Tab State for Obat & Resep: 'aktif' | 'riwayat'
    const [resepTab, setResepTab] = useState<'aktif' | 'riwayat'>('aktif');

    // Modals State
    const [showRefillModal, setShowRefillModal] = useState(false);
    const [showAllDiagnosaModal, setShowAllDiagnosaModal] = useState(false);
    const [showSnapshotEditModal, setShowSnapshotEditModal] = useState(false);
    const [showImagePreviewModal, setShowImagePreviewModal] = useState<HasilRadiologiItem | null>(null);
    const [selectedDiagnosaDetail, setSelectedDiagnosaDetail] = useState<RiwayatDiagnosaItem | null>(null);

    // Form State for Refill Request
    const [selectedObat, setSelectedObat] = useState<ResepItem | null>(resepAktif[0] || null);
    const [dosisDiminta, setDosisDiminta] = useState<number>(30);
    const [catatanRefill, setCatatanRefill] = useState<string>('');
    const [isSubmittingRefill, setIsSubmittingRefill] = useState(false);

    // Form State for Health Snapshot Edit
    const [snapshotForm, setSnapshotForm] = useState({
        alergi: pasien?.alergi || 'Alergi Penisilin',
        kondisi_kronis: pasien?.kondisi_kronis || 'Hipertensi (Terkontrol)',
        golongan_darah: pasien?.golongan_darah || 'O+',
    });
    const [isSubmittingSnapshot, setIsSubmittingSnapshot] = useState(false);

    const toggleRadiologiAccordion = (id: string) => {
        setOpenRadiologiId((prev) => (prev === id ? null : id));
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `RME_${pasien?.nomor_rekam_medis || 'Pasien'}`;
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };

    const handleSubmitRefill = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedObat && !resepAktif[0]) return;

        const obatToRefill = selectedObat || resepAktif[0];
        setIsSubmittingRefill(true);

        router.post(
            '/portal/rekam-medis/refill',
            {
                nama_obat: obatToRefill.nama_obat,
                obat_id: obatToRefill.obat_id,
                resep_id: obatToRefill.resep_id,
                dosis_diminta: dosisDiminta,
                catatan: catatanRefill,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRefillModal(false);
                    setCatatanRefill('');
                    setIsSubmittingRefill(false);
                },
                onError: () => {
                    setIsSubmittingRefill(false);
                },
            },
        );
    };

    const handleSubmitSnapshot = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingSnapshot(true);

        router.post('/portal/rekam-medis/snapshot', snapshotForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSnapshotEditModal(false);
                setIsSubmittingSnapshot(false);
            },
            onError: () => {
                setIsSubmittingSnapshot(false);
            },
        });
    };

    const currentPrintDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const currentPrintTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <PatientLayout user={user}>
            {/* ========================================================================= */}
            {/* 1. DOKUMEN CETAK RESMI (Muat Tepat 1 Halaman Penuh A4 Portrait)           */}
            {/* ========================================================================= */}
            <div className="hidden text-slate-900 bg-white font-sans print:block print-single-page text-[9px] leading-tight">
                {/* KOP SURAT RUMAH SAKIT RESMI */}
                <div className="flex items-center justify-between pb-1.5 border-b-2 border-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 border border-slate-900 rounded-lg bg-slate-100 text-slate-900 shrink-0">
                            <i className="text-lg fa-solid fa-hospital"></i>
                        </div>
                        <div>
                            <h1 className="text-xs font-extrabold tracking-wide uppercase text-slate-900">
                                RUMAH SAKIT SENTOSA MEDIKA
                            </h1>
                            <p className="text-[8.5px] font-medium text-slate-700">
                                Jl. Jenderal Sudirman No. 45, Jakarta Selatan 12190 • Telp: (021) 555-0199
                            </p>
                            <p className="text-[8px] text-slate-500">
                                Email: info@sentosamedika.id • Website: www.sentosamedika.id • Akreditasi Paripurna KARS
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-slate-900 border border-slate-800 rounded bg-slate-50">
                            SALINAN REKAM MEDIS RESMI
                        </div>
                        <p className="mt-0.5 text-[8px] text-slate-600">
                            No. Dokumen: RME/SM/{pasien?.nomor_rekam_medis || 'RM-2023-8942'}
                        </p>
                    </div>
                </div>
                <div className="mt-0.5 border-b border-slate-400"></div>

                {/* JUDUL DOKUMEN */}
                <div className="my-1.5 text-center">
                    <h2 className="text-[11px] font-bold tracking-wider uppercase text-slate-900">
                        RINGKASAN REKAM MEDIS ELEKTRONIK (RESUME MEDIS PASIEN)
                    </h2>
                    <p className="text-[8.5px] text-slate-500">
                        Waktu Cetak: {currentPrintDate} pukul {currentPrintTime} WIB
                    </p>
                </div>

                {/* BAGIAN I: DATA IDENTITAS PASIEN & HEALTH SNAPSHOT */}
                <div className="mb-2">
                    <div className="px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white bg-slate-800 rounded-t">
                        I. IDENTITAS PASIEN & HEALTH SNAPSHOT
                    </div>
                    <table className="w-full text-[8.5px] border border-collapse border-slate-300">
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="w-1/4 p-1 font-semibold bg-slate-50 text-slate-700 border-r border-slate-200">
                                    Nama Lengkap Pasien
                                </td>
                                <td className="w-1/4 p-1 font-bold text-slate-900 border-r border-slate-200">
                                    {pasien?.nama_lengkap}
                                </td>
                                <td className="w-1/4 p-1 font-semibold bg-slate-50 text-slate-700 border-r border-slate-200">
                                    Nomor Rekam Medis
                                </td>
                                <td className="w-1/4 p-1 font-bold font-mono text-slate-900">
                                    {pasien?.nomor_rekam_medis}
                                </td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-1 font-semibold bg-slate-50 text-slate-700 border-r border-slate-200">
                                    Tanggal Lahir / Usia
                                </td>
                                <td className="p-1 text-slate-900 border-r border-slate-200">
                                    {pasien?.tanggal_lahir_label}
                                </td>
                                <td className="p-1 font-semibold bg-slate-50 text-slate-700 border-r border-slate-200">
                                    Golongan Darah
                                </td>
                                <td className="p-1 font-bold text-slate-900">
                                    {pasien?.golongan_darah}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-1 font-semibold bg-slate-50 text-slate-700 border-r border-slate-200">
                                    Riwayat Alergi
                                </td>
                                <td className="p-1 font-bold text-rose-700 border-r border-slate-200">
                                    {pasien?.alergi || 'Tidak Ada Riwayat Alergi'}
                                </td>
                                <td className="p-1 font-semibold bg-slate-50 text-slate-700 border-r border-slate-200">
                                    Kondisi Kronis Terkontrol
                                </td>
                                <td className="p-1 font-semibold text-slate-900">
                                    {pasien?.kondisi_kronis || 'Tidak Ada'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* BAGIAN II: RIWAYAT DIAGNOSA & KUNJUNGAN KLINIS */}
                <div className="mb-2">
                    <div className="px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white bg-slate-800 rounded-t">
                        II. RIWAYAT DIAGNOSA & KUNJUNGAN KLINIS
                    </div>
                    <table className="w-full text-[8.5px] border border-collapse border-slate-300">
                        <thead className="text-slate-800 bg-slate-100 border-b border-slate-300">
                            <tr>
                                <th className="p-1 text-center w-6 border-r border-slate-300">No</th>
                                <th className="p-1 text-left w-20 border-r border-slate-300">Tahun/Tgl</th>
                                <th className="p-1 text-left w-40 border-r border-slate-300">Diagnosis (ICD-10)</th>
                                <th className="p-1 text-left border-r border-slate-300">Anamnesis & Catatan Klinis</th>
                                <th className="p-1 text-left w-36 border-r border-slate-300">Poli / Dokter DPJP</th>
                                <th className="p-1 text-center w-16">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {riwayatDiagnosa.map((diag, index) => (
                                <tr key={diag.id || index} className="align-top">
                                    <td className="p-1 text-center font-bold text-slate-700 border-r border-slate-200">
                                        {index + 1}
                                    </td>
                                    <td className="p-1 font-semibold text-slate-800 border-r border-slate-200">
                                        <div>{diag.tahun}</div>
                                        {diag.tanggal_lengkap && (
                                            <div className="text-[7.5px] text-slate-500 font-normal">
                                                {diag.tanggal_lengkap}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-1 font-bold text-slate-900 border-r border-slate-200">
                                        {diag.judul}
                                        {diag.icd10_code && (
                                            <span className="ml-1 text-[8px] font-normal text-slate-500">
                                                ({diag.icd10_code})
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-1 text-slate-700 border-r border-slate-200 leading-tight text-[8px]">
                                        {diag.keluhan_utama && (
                                            <div>
                                                <span className="font-semibold text-slate-800">Keluhan: </span>
                                                {diag.keluhan_utama}
                                            </div>
                                        )}
                                        {diag.catatan_dokter && (
                                            <div className="mt-0.5 text-slate-600">
                                                <span className="font-semibold text-slate-800">Saran: </span>
                                                {diag.catatan_dokter}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-1 text-slate-800 border-r border-slate-200 text-[8px]">
                                        {diag.dokter_poli}
                                    </td>
                                    <td className="p-1 text-center font-bold uppercase text-[8px]">
                                        <span className={`inline-block px-1 py-0.2 rounded border ${
                                            diag.status === 'aktif'
                                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                        }`}>
                                            {diag.status_label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* BAGIAN III & IV: 2-KOLOM BERDAMPINGAN (HEMAT RUANG VERTIKAL) */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Kolom Kiri: BAGIAN III: HASIL PEMERIKSAAN IMAGING & RADIOLOGI */}
                    <div>
                        <div className="px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white bg-slate-800 rounded-t">
                            III. HASIL IMAGING & RADIOLOGI
                        </div>
                        {hasilRadiologi.map((rad, idx) => (
                            <div key={rad.id || idx} className="p-1.5 border border-slate-300 text-[8px] space-y-0.5 rounded-b h-full">
                                <div className="flex justify-between border-b border-slate-200 pb-0.5 font-semibold text-slate-800">
                                    <span className="font-bold text-slate-900">{rad.judul_pemeriksaan}</span>
                                    <span>{rad.tanggal_label}</span>
                                </div>
                                <div className="text-slate-600">
                                    <strong>Dokter:</strong> {rad.dokter_radiologi}
                                </div>
                                {rad.indikasi_klinis && (
                                    <p className="text-slate-600 line-clamp-2">
                                        <strong>Indikasi:</strong> {rad.indikasi_klinis}
                                    </p>
                                )}
                                <p className="text-slate-900 pt-0.5 border-t border-slate-100">
                                    <strong>Kesimpulan:</strong> {rad.kesimpulan || 'Dalam batas normal.'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Kolom Kanan: BAGIAN IV: TERAPI OBAT & RESEP AKTIF */}
                    <div>
                        <div className="px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white bg-slate-800 rounded-t">
                            IV. TERAPI OBAT & RESEP AKTIF
                        </div>
                        <table className="w-full text-[8px] border border-collapse border-slate-300 rounded-b">
                            <thead className="text-slate-800 bg-slate-100 border-b border-slate-300">
                                <tr>
                                    <th className="p-1 text-left border-r border-slate-300">Nama Obat</th>
                                    <th className="p-1 text-left border-r border-slate-300">Aturan Pakai</th>
                                    <th className="p-1 text-center w-16 border-r border-slate-300">Kategori</th>
                                    <th className="p-1 text-center w-14">Sisa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {resepAktif.map((rx, idx) => (
                                    <tr key={rx.id || idx}>
                                        <td className="p-1 font-bold text-slate-900 border-r border-slate-200">
                                            {rx.nama_obat}
                                        </td>
                                        <td className="p-1 text-slate-800 border-r border-slate-200">
                                            {rx.aturan_pakai}
                                        </td>
                                        <td className="p-1 text-center border-r border-slate-200">
                                            {rx.kategori_obat || 'Rutin'}
                                        </td>
                                        <td className="p-1 text-center font-semibold text-slate-800">
                                            {rx.sisa_tablet ? `${rx.sisa_tablet} tab` : `${rx.jumlah_dosis || 30} tab`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BAGIAN V: PENGESAHAN ELEKTRONIK & TANDA TANGAN */}
                <div className="pt-1 mt-1 border-t border-slate-300 text-[8.5px]">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="font-semibold text-slate-600">Pasien / Keluarga,</p>
                            <div className="h-9"></div>
                            <p className="font-bold text-slate-900 border-t border-slate-400 inline-block px-4 pt-0.5">
                                ({pasien?.nama_lengkap})
                            </p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className="p-1 border border-slate-400 rounded bg-slate-50 text-[8px] text-slate-600 text-center leading-tight">
                                <i className="fa-solid fa-qrcode text-base text-slate-800 block mb-0.5"></i>
                                <span className="font-bold">VERIFIKASI RESMI SIMRS</span>
                                <div className="font-mono text-[7.5px] text-slate-500">ID: {pasien?.id?.substring(0, 13)}</div>
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-600">Dokter Penanggung Jawab,</p>
                            <div className="h-9"></div>
                            <p className="font-bold text-slate-900 border-t border-slate-400 inline-block px-4 pt-0.5">
                                (Dr. Anwar, Sp.PD)
                            </p>
                        </div>
                    </div>
                </div>

                {/* FOOTER HUKUM */}
                <div className="mt-1 pt-1 text-[7.5px] text-slate-400 text-center border-t border-slate-200 leading-none">
                    Dokumen ini merupakan salinan sah Rekam Medis Elektronik (RME) SIMRS RS Sentosa Medika sesuai UU No. 17 Th 2023 & PMK No. 24 Th 2022.
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. TAMPILAN INTERAKTIF LAYAR (Sesuai Mockup Gambar - print:hidden)        */}
            {/* ========================================================================= */}
            <div className="print:hidden">
                {/* Flash Success / Error Banner */}
                {flash?.success && (
                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-xs">
                        <i className="fa-solid fa-circle-check text-emerald-600"></i>
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Breadcrumb & Main Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Link
                                href="/portal"
                                className="transition-colors hover:text-[#145e5b]"
                            >
                                Dashboard
                            </Link>
                            <i className="text-[10px] text-slate-400 fa-solid fa-chevron-right"></i>
                            <span className="font-semibold text-slate-800">
                                Rekam Medis
                            </span>
                        </div>

                        {/* Page Title & Subtitle */}
                        <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#17524c] sm:text-3xl">
                            Rekam Medis Lengkap
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                            Semua catatan medis Anda di RS Sentosa Medika
                        </p>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-all bg-white border rounded-xl border-slate-200 text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 active:scale-95 sm:text-sm"
                            title="Cetak Salinan Dokumen Rekam Medis"
                        >
                            <i className="fa-solid fa-print text-slate-500"></i>
                            <span>Print</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0d4f4c] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#093d3a] active:scale-95 sm:text-sm"
                            title="Unduh Dokumen RME (PDF)"
                        >
                            <i className="fa-solid fa-download"></i>
                            <span>Unduh</span>
                        </button>
                    </div>
                </div>

                {/* Section 1: Patient Identity & Health Snapshot Card */}
                <div className="mt-6 overflow-hidden bg-white border rounded-2xl border-slate-100/90 p-5 shadow-xs transition-all hover:shadow-md sm:p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
                        {/* Left Column: Patient Demographics */}
                        <div className="flex items-center gap-4 md:col-span-7 sm:gap-5">
                            {/* Avatar Image */}
                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#145e5b]/20 bg-[#e7f4f1] text-[#145e5b] shadow-xs sm:h-20 sm:w-20">
                                {pasien?.foto_profil ? (
                                    <img
                                        src={pasien.foto_profil}
                                        alt={pasien.nama_lengkap}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <i className="text-2xl sm:text-3xl fa-solid fa-user-injured"></i>
                                    </div>
                                )}
                            </div>

                            {/* Name & Details Table */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-bold truncate text-slate-900 sm:text-xl">
                                    {pasien?.nama_lengkap || 'Alexandru Pratama'}
                                </h2>

                                <div className="mt-2 grid grid-cols-1 gap-y-1 text-xs sm:text-[13px]">
                                    <div className="flex items-center">
                                        <span className="w-20 font-medium shrink-0 text-slate-500">
                                            No. RM:
                                        </span>
                                        <span className="font-semibold font-mono text-slate-800">
                                            {pasien?.nomor_rekam_medis || 'RM-2023-8942'}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <span className="w-20 font-medium shrink-0 text-slate-500">
                                            Tgl Lahir:
                                        </span>
                                        <span className="font-semibold text-slate-800">
                                            {pasien?.tanggal_lahir_label || '15 Mei 1988 (35 th)'}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <span className="w-20 font-medium shrink-0 text-slate-500">
                                            Gol. Darah:
                                        </span>
                                        <span className="font-bold text-[#145e5b]">
                                            {pasien?.golongan_darah || 'O+'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Health Snapshot */}
                        <div className="pt-4 border-t md:col-span-5 md:border-t-0 md:border-l md:border-slate-100 md:pl-8 md:pt-0">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    HEALTH SNAPSHOT
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowSnapshotEditModal(true)}
                                    className="text-[11px] font-semibold text-[#145e5b] hover:underline flex items-center gap-1"
                                    title="Edit Alergi & Kondisi Kronis"
                                >
                                    <i className="text-[10px] fa-solid fa-pen-to-square"></i>
                                    <span>Edit</span>
                                </button>
                            </div>

                            <div className="mt-3 space-y-3">
                                {/* Alergi */}
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                        <i className="text-xs text-rose-500 fa-solid fa-triangle-exclamation"></i>
                                        <span>Alergi</span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                        {pasien?.alergi ? (
                                            pasien.alergi
                                                .split(',')
                                                .map((al, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50/80 px-3 py-0.5 text-[11px] font-semibold text-rose-700"
                                                    >
                                                        {al.trim()}
                                                    </span>
                                                ))
                                        ) : (
                                            <span className="text-xs italic text-slate-400">
                                                Tidak ada riwayat alergi
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Kondisi Kronis */}
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                        <i className="text-xs text-amber-500 fa-solid fa-heart"></i>
                                        <span>Kondisi Kronis</span>
                                    </div>
                                    <div className="mt-1 text-xs font-medium text-slate-800">
                                        {pasien?.kondisi_kronis || 'Hipertensi (Terkontrol)'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Hasil Imaging & Radiologi */}
                <div className="mt-7">
                    <div className="flex items-center gap-2 mb-3">
                        <i className="text-[#145e5b] fa-solid fa-x-ray text-base"></i>
                        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                            Hasil Imaging & Radiologi
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {hasilRadiologi.length > 0 ? (
                            hasilRadiologi.map((rad) => {
                                const isOpen = openRadiologiId === rad.id;

                                return (
                                    <div
                                        key={rad.id}
                                        className="overflow-hidden bg-white border rounded-2xl border-slate-100/90 shadow-xs transition-all hover:border-[#145e5b]/20"
                                    >
                                        {/* Accordion Header */}
                                        <button
                                            type="button"
                                            onClick={() => toggleRadiologiAccordion(rad.id)}
                                            className="flex items-center justify-between w-full p-4 text-left transition-colors sm:p-5 hover:bg-slate-50/70"
                                        >
                                            <div className="flex items-center gap-3.5 sm:gap-4">
                                                {/* Imaging Square Icon */}
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e4f6f2] text-[#145e5b] shadow-xs">
                                                    <i className="text-lg fa-solid fa-calendar-check"></i>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                                                        {rad.judul_pemeriksaan}
                                                    </h3>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {rad.tanggal_label} • {rad.dokter_radiologi}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-slate-400">
                                                <i
                                                    className={`fa-solid fa-chevron-down text-sm transition-transform duration-200 ${
                                                        isOpen ? 'rotate-180 text-[#145e5b]' : ''
                                                    }`}
                                                ></i>
                                            </div>
                                        </button>

                                        {/* Accordion Expanded Details */}
                                        {isOpen && (
                                            <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 sm:p-5">
                                                <div className="p-4 bg-white border mt-3.5 space-y-3 rounded-xl border-slate-100">
                                                    {rad.indikasi_klinis && (
                                                        <div>
                                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                                Indikasi Klinis
                                                            </span>
                                                            <p className="mt-0.5 text-xs leading-relaxed text-slate-700">
                                                                {rad.indikasi_klinis}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {rad.temuan && (
                                                        <div>
                                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                                Hasil Temuan
                                                            </span>
                                                            <p className="mt-0.5 text-xs leading-relaxed text-slate-700">
                                                                {rad.temuan}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                            Kesimpulan
                                                        </span>
                                                        <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#145e5b]">
                                                            {rad.kesimpulan || 'Pemeriksaan radiologi dalam batas normal.'}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-between pt-3 border-t gap-2 border-slate-100">
                                                        <div className="text-[11px] text-slate-500">
                                                            Dokter Radiolog:{' '}
                                                            <span className="font-semibold text-slate-800">
                                                                {rad.dokter_radiologi}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowImagePreviewModal(rad)}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#e4f6f2] px-3 py-1.5 text-xs font-semibold text-[#145e5b] hover:bg-[#d0efe8]"
                                                            >
                                                                <i className="text-xs fa-solid fa-eye"></i>
                                                                <span>Lihat Gambar Scan</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={handlePrint}
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <i className="text-xs fa-solid fa-print"></i>
                                                                <span>Cetak Lembar Hasil</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center bg-white border border-dashed rounded-2xl border-slate-200">
                                <i className="mb-2 text-2xl fa-solid fa-x-ray text-slate-300"></i>
                                <p className="text-xs font-semibold text-slate-600">
                                    Belum ada pemeriksaan imaging & radiologi
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 3: Bottom Grid (Riwayat Diagnosa & Obat / Resep) */}
                <div className="grid grid-cols-1 gap-6 mt-7 lg:grid-cols-12">
                    {/* Left Card: Riwayat Diagnosa (Vertical Timeline) */}
                    <div className="flex flex-col justify-between bg-white border lg:col-span-6 rounded-2xl border-slate-100/90 p-5 shadow-xs sm:p-6">
                        <div>
                            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                                <i className="text-[#145e5b] fa-solid fa-clock-rotate-left"></i>
                                <h2 className="text-base font-bold text-slate-900">
                                    Riwayat Diagnosa
                                </h2>
                            </div>

                            {/* Timeline List */}
                            <div className="relative pl-5 space-y-6 before:absolute before:left-2 before:top-2.5 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                {riwayatDiagnosa.map((diag, index) => {
                                    const isAktif = diag.status === 'aktif';
                                    const dotColor = isAktif
                                        ? 'bg-amber-500 ring-amber-100'
                                        : index === 1
                                          ? 'bg-emerald-500 ring-emerald-100'
                                          : 'bg-slate-400 ring-slate-100';

                                    const badgeStyle = isAktif
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : index === 1
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-slate-100 text-slate-700 border-slate-200';

                                    return (
                                        <div
                                            key={diag.id}
                                            className="relative group cursor-pointer"
                                            onClick={() => setSelectedDiagnosaDetail(diag)}
                                        >
                                            {/* Dot Indicator */}
                                            <div
                                                className={`absolute -left-5 top-1 h-3.5 w-3.5 rounded-full ring-4 ${dotColor} transition-transform group-hover:scale-125`}
                                            />

                                            {/* Badge Status & Year */}
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${badgeStyle}`}
                                                >
                                                    {diag.status_label}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">
                                                    {diag.tahun}
                                                </span>
                                            </div>

                                            {/* Diagnosis Title */}
                                            <h3 className="mt-1 text-sm font-bold text-slate-900 group-hover:text-[#145e5b] transition-colors">
                                                {diag.judul}
                                            </h3>

                                            {/* Doctor / Poli */}
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {diag.dokter_poli}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bottom Action: Lihat Semua Riwayat */}
                        <div className="pt-4 mt-6 text-center border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowAllDiagnosaModal(true)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#145e5b] hover:text-[#0c4442] hover:underline"
                            >
                                <span>Lihat Semua Riwayat</span>
                                <i className="text-[10px] fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    {/* Right Card: Obat & Resep */}
                    <div className="flex flex-col justify-between bg-white border lg:col-span-6 rounded-2xl border-slate-100/90 p-5 shadow-xs sm:p-6">
                        <div>
                            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                                <i className="text-[#145e5b] fa-solid fa-pills"></i>
                                <h2 className="text-base font-bold text-slate-900">
                                    Obat & Resep
                                </h2>
                            </div>

                            {/* Tabs Header: Resep Aktif | Riwayat */}
                            <div className="flex border-b gap-6 border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setResepTab('aktif')}
                                    className={`pb-2.5 text-xs font-bold transition-all relative ${
                                        resepTab === 'aktif'
                                            ? 'text-[#145e5b] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#145e5b]'
                                            : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    Resep Aktif
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setResepTab('riwayat')}
                                    className={`pb-2.5 text-xs font-bold transition-all relative ${
                                        resepTab === 'riwayat'
                                            ? 'text-[#145e5b] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#145e5b]'
                                            : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    Riwayat
                                </button>
                            </div>

                            {/* Tab Content: Resep Aktif */}
                            {resepTab === 'aktif' ? (
                                <div className="mt-4 space-y-3">
                                    {resepAktif.length > 0 ? (
                                        resepAktif.map((item, idx) => (
                                            <div
                                                key={item.id || idx}
                                                className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all hover:border-[#145e5b]/20 hover:bg-white"
                                            >
                                                {/* Pill/Capsule Icon */}
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e4f6f2] text-[#145e5b] shadow-2xs">
                                                    <i className="text-sm fa-solid fa-notes-medical"></i>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-bold truncate text-slate-900">
                                                        {item.nama_obat}
                                                    </h3>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {item.aturan_pakai}
                                                    </p>

                                                    {/* Badges */}
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                        {item.kategori_obat && (
                                                            <span
                                                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                                                    item.kategori_obat.toLowerCase() === 'rutin'
                                                                        ? 'bg-[#e4f6f2] text-[#145e5b]'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                            >
                                                                {item.kategori_obat}
                                                            </span>
                                                        )}

                                                        {item.sisa_tablet !== null &&
                                                            item.sisa_tablet !== undefined && (
                                                                <span className="text-[11px] font-medium text-slate-400">
                                                                    Sisa {item.sisa_tablet} tablet
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-xs text-slate-500">
                                            Tidak ada resep aktif saat ini.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Tab Content: Riwayat Resep */
                                <div className="mt-4 space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                    {riwayatResep.length > 0 ? (
                                        riwayatResep.map((item, idx) => (
                                            <div
                                                key={item.id || idx}
                                                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 text-xs"
                                            >
                                                <div className="flex items-center justify-center text-slate-400 bg-slate-100 rounded-lg h-7 w-7 shrink-0">
                                                    <i className="text-xs fa-solid fa-check"></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold truncate text-slate-900">
                                                            {item.nama_obat}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 shrink-0">
                                                            {item.tanggal_resep}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                        {item.aturan_pakai}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-xs text-slate-500">
                                            Belum ada riwayat resep masa lampau.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bottom Action Button: Request Refill */}
                        <div className="pt-4 mt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedObat(resepAktif[0] || null);
                                    setShowRefillModal(true);
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#dcefe9] py-2.5 text-xs font-bold text-[#145e5b] shadow-xs transition-all hover:bg-[#cde7df] active:scale-[0.99] sm:text-sm"
                            >
                                <i className="fa-solid fa-arrows-rotate"></i>
                                <span>Request Refill</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL 1: Request Refill Obat */}
            {showRefillModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => !isSubmittingRefill && setShowRefillModal(false)}
                    />
                    <div className="relative w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-3xl">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e4f6f2] text-[#145e5b]">
                                    <i className="text-base fa-solid fa-pills"></i>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                                        Ajukan Permintaan Refill Obat
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Instalasi Farmasi RS Sentosa Medika
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRefillModal(false)}
                                className="p-2 transition-colors rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <i className="text-base fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRefill} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700">
                                    Pilih Obat dari Resep Aktif
                                </label>
                                <select
                                    value={selectedObat?.id || ''}
                                    onChange={(e) => {
                                        const found = resepAktif.find(
                                            (r) => String(r.id) === e.target.value,
                                        );
                                        setSelectedObat(found || null);
                                    }}
                                    className="w-full mt-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#145e5b] focus:outline-hidden focus:ring-2 focus:ring-[#145e5b]/20"
                                    required
                                >
                                    {resepAktif.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.nama_obat} ({r.aturan_pakai})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Jumlah Refill (Tablet/Kapsul)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={dosisDiminta}
                                        onChange={(e) => setDosisDiminta(Number(e.target.value))}
                                        className="w-full mt-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#145e5b] focus:outline-hidden focus:ring-2 focus:ring-[#145e5b]/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Estimasi Kebutuhan
                                    </label>
                                    <div className="mt-1.5 flex h-[42px] items-center rounded-xl bg-slate-50 px-3.5 text-xs font-medium text-slate-600 border border-slate-200">
                                        Untuk {Math.max(1, Math.floor(dosisDiminta / 1))} hari konsumsi
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700">
                                    Catatan / Gejala Tambahan (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={catatanRefill}
                                    onChange={(e) => setCatatanRefill(e.target.value)}
                                    placeholder="Contoh: Obat rutin bulanan habis, tidak ada efek samping yang dirasakan."
                                    className="w-full mt-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#145e5b] focus:outline-hidden focus:ring-2 focus:ring-[#145e5b]/20"
                                />
                            </div>

                            <div className="rounded-2xl border border-teal-100 bg-[#f0f8f6] p-3.5 text-xs text-[#145e5b] flex items-start gap-2.5">
                                <i className="fa-solid fa-circle-info text-sm mt-0.5 shrink-0"></i>
                                <span>
                                    Permintaan refill akan ditinjau oleh dokter penanggung jawab dan apoteker. Anda akan menerima notifikasi setelah disetujui.
                                </span>
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRefillModal(false)}
                                    disabled={isSubmittingRefill}
                                    className="flex-1 py-2.5 text-xs font-bold transition-colors rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 sm:text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingRefill}
                                    className="flex-1 rounded-xl bg-[#145e5b] py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c4442] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingRefill ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            <span>Mengirim...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-paper-plane"></i>
                                            <span>Kirim Pengajuan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Lihat Semua Riwayat Diagnosa */}
            {showAllDiagnosaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowAllDiagnosaModal(false)}
                    />
                    <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl rounded-3xl">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e4f6f2] text-[#145e5b]">
                                    <i className="text-base fa-solid fa-clock-rotate-left"></i>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                                        Seluruh Riwayat Diagnosa & Kunjungan
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Rekam Medis Pasien: {pasien?.nama_lengkap}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAllDiagnosaModal(false)}
                                className="p-2 transition-colors rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <i className="text-base fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                            {riwayatDiagnosa.map((diag) => (
                                <div
                                    key={diag.id}
                                    className="p-4 transition-all border rounded-2xl border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xs"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                                                        diag.status === 'aktif'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}
                                                >
                                                    {diag.status_label}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-500">
                                                    Tahun {diag.tahun}
                                                </span>
                                                {diag.tanggal_lengkap && (
                                                    <span className="text-xs text-slate-400">
                                                        • {diag.tanggal_lengkap}
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="mt-1 text-sm font-bold text-slate-900 sm:text-base">
                                                {diag.judul}
                                            </h4>
                                            <p className="mt-0.5 text-xs text-slate-600">
                                                {diag.dokter_poli}
                                            </p>
                                        </div>

                                        {diag.sistol && diag.diastol && (
                                            <div className="px-2.5 py-1 text-right rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shrink-0">
                                                {diag.sistol}/{diag.diastol} mmHg
                                            </div>
                                        )}
                                    </div>

                                    {diag.keluhan_utama && (
                                        <p className="mt-2.5 text-xs leading-relaxed text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-slate-700">Keluhan: </span>
                                            {diag.keluhan_utama}
                                        </p>
                                    )}

                                    {diag.catatan_dokter && (
                                        <p className="mt-2 text-xs leading-relaxed text-[#145e5b]">
                                            <span className="font-semibold">Saran Dokter: </span>
                                            {diag.catatan_dokter}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                            <button
                                type="button"
                                onClick={() => setShowAllDiagnosaModal(false)}
                                className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-[#145e5b] hover:bg-[#0c4442]"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: Detail Single Diagnosa */}
            {selectedDiagnosaDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setSelectedDiagnosaDetail(null)}
                    />
                    <div className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e4f6f2] text-[#145e5b]">
                                    <i className="text-sm fa-solid fa-notes-medical"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Detail Catatan Medis
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        {selectedDiagnosaDetail.tahun}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedDiagnosaDetail(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <i className="text-sm fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="p-5 space-y-3.5 text-xs">
                            <div className="p-3 bg-slate-50 rounded-2xl">
                                <div className="font-bold text-slate-900 text-sm">
                                    {selectedDiagnosaDetail.judul}
                                </div>
                                <div className="text-slate-500 mt-0.5">
                                    {selectedDiagnosaDetail.dokter_poli}
                                </div>
                            </div>

                            {selectedDiagnosaDetail.keluhan_utama && (
                                <div>
                                    <span className="font-bold text-slate-700">Anamnesis / Keluhan:</span>
                                    <p className="mt-1 leading-relaxed text-slate-600">
                                        {selectedDiagnosaDetail.keluhan_utama}
                                    </p>
                                </div>
                            )}

                            {selectedDiagnosaDetail.catatan_dokter && (
                                <div>
                                    <span className="font-bold text-slate-700">Instruksi Dokter:</span>
                                    <p className="mt-1 leading-relaxed text-[#145e5b] font-medium">
                                        {selectedDiagnosaDetail.catatan_dokter}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setSelectedDiagnosaDetail(null)}
                                className="w-full py-2 text-xs font-bold text-white rounded-xl bg-[#145e5b] hover:bg-[#0c4442]"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 4: Preview Gambar Scan Radiologi */}
            {showImagePreviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs"
                        onClick={() => setShowImagePreviewModal(null)}
                    />
                    <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl rounded-3xl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e4f6f2] text-[#145e5b]">
                                    <i className="text-sm fa-solid fa-x-ray"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Pratinjau Citra Radiologi
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        {showImagePreviewModal.judul_pemeriksaan}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowImagePreviewModal(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <i className="text-sm fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="flex-1 p-5 overflow-y-auto space-y-4">
                            {/* High-Res Radiology Scan Visualizer */}
                            <div className="relative flex flex-col items-center justify-center overflow-hidden bg-black rounded-2xl p-6 text-center border border-slate-800">
                                <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                                    AXIAL 5.0mm • NON-CONTRAST
                                </div>
                                <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                                    RS SENTOSA MEDIKA
                                </div>

                                <div className="my-6 flex h-48 w-48 items-center justify-center rounded-full border-2 border-dashed border-teal-500/40 bg-radial from-slate-800 to-black text-teal-400">
                                    <i className="text-6xl fa-solid fa-brain opacity-80"></i>
                                </div>

                                <div className="text-xs font-mono text-slate-300">
                                    Parenkim serebri simetris • Sulci & Gyri intak • Midline normal
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1">
                                <div className="font-bold text-slate-800">
                                    Kesimpulan Radiologis:
                                </div>
                                <div className="text-slate-600 leading-relaxed">
                                    {showImagePreviewModal.kesimpulan}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowImagePreviewModal(null)}
                                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-[#145e5b] hover:bg-[#0c4442] flex items-center gap-1.5"
                            >
                                <i className="fa-solid fa-print"></i>
                                <span>Cetak Hasil</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 5: Edit Health Snapshot */}
            {showSnapshotEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => !isSubmittingSnapshot && setShowSnapshotEditModal(false)}
                    />
                    <div className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e4f6f2] text-[#145e5b]">
                                    <i className="text-sm fa-solid fa-heart-pulse"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Perbarui Health Snapshot
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Informasi data kesehatan penting
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSnapshotEditModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <i className="text-sm fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitSnapshot} className="p-5 space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700">
                                    Riwayat Alergi (Pisahkan koma jika lebih dari 1)
                                </label>
                                <input
                                    type="text"
                                    value={snapshotForm.alergi}
                                    onChange={(e) =>
                                        setSnapshotForm({
                                            ...snapshotForm,
                                            alergi: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Alergi Penisilin, Alergi Makanan Laut"
                                    className="w-full mt-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#145e5b] focus:outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700">
                                    Kondisi Kronis Terkontrol
                                </label>
                                <input
                                    type="text"
                                    value={snapshotForm.kondisi_kronis}
                                    onChange={(e) =>
                                        setSnapshotForm({
                                            ...snapshotForm,
                                            kondisi_kronis: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Hipertensi (Terkontrol)"
                                    className="w-full mt-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#145e5b] focus:outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700">
                                    Golongan Darah
                                </label>
                                <select
                                    value={snapshotForm.golongan_darah}
                                    onChange={(e) =>
                                        setSnapshotForm({
                                            ...snapshotForm,
                                            golongan_darah: e.target.value,
                                        })
                                    }
                                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#145e5b] focus:outline-hidden"
                                >
                                    <option value="O+">O+</option>
                                    <option value="A+">A+</option>
                                    <option value="B+">B+</option>
                                    <option value="AB+">AB+</option>
                                    <option value="O-">O-</option>
                                    <option value="A-">A-</option>
                                    <option value="B-">B-</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSnapshotEditModal(false)}
                                    disabled={isSubmittingSnapshot}
                                    className="w-1/2 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingSnapshot}
                                    className="w-1/2 py-2 text-xs font-bold text-white rounded-xl bg-[#145e5b] hover:bg-[#0c4442] disabled:opacity-50"
                                >
                                    {isSubmittingSnapshot ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PatientLayout>
    );
}
