import { Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Building2,
    Calendar,
    CalendarCheck,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    Download,
    FileText,
    Heart,
    HelpCircle,
    History,
    MapPin,
    MessageCircle,
    Phone,
    Pill,
    Printer,
    QrCode,
    Sparkles,
    User as UserIcon,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { PatientLayout } from '../../components/patient-layout';

interface BookingItem {
    id: string;
    nomor_antrian: string;
    dokter: string;
    spesialisasi?: string;
    poli: string;
    keluhan_layanan?: string;
    tanggal_label: string;
    tanggal_lengkap?: string;
    jam_label?: string;
    countdown_label?: string;
    status: string;
    status_label?: string;
    is_confirmed?: boolean;
}

interface StatusKesehatan {
    status: string;
    status_label: string;
    sistol: number;
    diastol: number;
    suhu_tubuh: number;
    spo2: number;
    denyut_nadi: number;
    update_label: string;
    terakhir_periksa: string;
}

interface ResepSummary {
    total_resep_aktif: number;
    siap_diambil: number;
    items: Array<{
        nama_obat: string;
        bentuk_sediaan?: string;
        aturan_pakai?: string;
        status_label: string;
        status: string;
    }>;
}

interface TagihanAktif {
    id: string;
    no_invoice: string;
    layanan: string;
    total_tagihan: number;
    total_tagihan_formatted: string;
    status: string;
    status_label: string;
    due_date: string;
    created_at: string;
}

interface ProfilKesehatan {
    golongan_darah: string;
    bmi: string;
    kondisi: string;
    alergi?: string;
    alamat?: string;
    no_hp?: string;
    nama_kontak_darurat?: string;
    no_hp_kontak_darurat?: string;
}

interface ReminderObat {
    nama_obat: string;
    jadwal: string;
    instruksi?: string;
    sudah_diminum?: boolean;
}

interface PortalDashboardProps {
    user?: any;
    role?: string;
    pasien?: any;
    jumlahRekamMedis?: number;
    jumlahKunjungan?: number;
    jumlahTagihan?: number;
    bookingAktif?: any[];
    janjiTemuTerdekat?: BookingItem | null;
    statusKesehatan?: StatusKesehatan;
    resepSummary?: ResepSummary;
    tagihanAktif?: TagihanAktif;
    profilKesehatan?: ProfilKesehatan;
    reminderObat?: ReminderObat;
    rekamMedisTerbaru?: any[];
}

export default function PortalDashboard({
    user,
    pasien,
    janjiTemuTerdekat,
    statusKesehatan = {
        status: 'stabil',
        status_label: 'Stabil',
        sistol: 120,
        diastol: 80,
        suhu_tubuh: 37.2,
        spo2: 98,
        denyut_nadi: 78,
        update_label: 'Update: 3 hari lalu',
        terakhir_periksa: '12 Agu 2026',
    },
    resepSummary = {
        total_resep_aktif: 2,
        siap_diambil: 1,
        items: [
            {
                nama_obat: 'Amlodipine 5mg',
                status_label: 'Ditebus',
                status: 'sudah_ditebus',
            },
            {
                nama_obat: 'Aspirin 100mg',
                status_label: 'Menunggu',
                status: 'menunggu_ditebus',
            },
        ],
    },
    tagihanAktif = {
        id: '1',
        no_invoice: 'INV-20260814-001',
        layanan: 'Konsultasi Poli Penyakit Dalam',
        total_tagihan: 750000,
        total_tagihan_formatted: 'Rp 750.000',
        status: 'belum_lunas',
        status_label: 'Belum Lunas',
        due_date: '10 Agt',
        created_at: '14 Agu 2026',
    },
    profilKesehatan = {
        golongan_darah: 'O+',
        bmi: '24.5',
        kondisi: 'Hipertensi',
        alergi: 'Tidak ada',
        alamat: 'Jl. Merdeka No. 10',
        no_hp: '081234567890',
    },
    reminderObat = {
        nama_obat: 'Aspirin 100mg',
        jadwal: '07.00 Pagi',
        instruksi: '1x sehari sesudah sarapan',
        sudah_diminum: false,
    },
    rekamMedisTerbaru = [],
}: PortalDashboardProps) {
    const p = pasien || user || {};
    const patientName = p.nama_lengkap || 'Siti Aminah';

    // State for interactive modals
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showDirectionModal, setShowDirectionModal] = useState(false);
    const [showContactDoctorModal, setShowContactDoctorModal] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [showResepModal, setShowResepModal] = useState(false);
    const [showDetailJanjiModal, setShowDetailJanjiModal] = useState(false);

    // Interactive Reminder check
    const [obatSudahDiminum, setObatSudahDiminum] = useState(
        reminderObat.sudah_diminum || false,
    );
    const [showObatToast, setShowObatToast] = useState(false);

    // Selected payment method for tagihan
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('QRIS');
    const [isPaying, setIsPaying] = useState(false);

    // Form for editing profile
    const profileForm = useForm({
        no_hp: profilKesehatan.no_hp || p.no_hp || '',
        alamat: profilKesehatan.alamat || p.alamat || '',
        golongan_darah:
            profilKesehatan.golongan_darah || p.golongan_darah || 'O',
        alergi: profilKesehatan.alergi || p.alergi || '',
        kondisi_terakhir: profilKesehatan.kondisi || p.kondisi_terakhir || '',
        nama_kontak_darurat:
            profilKesehatan.nama_kontak_darurat || p.nama_kontak_darurat || '',
        no_hp_kontak_darurat:
            profilKesehatan.no_hp_kontak_darurat ||
            p.no_hp_kontak_darurat ||
            '',
    });

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/portal/profil', {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditProfileModal(false);
            },
        });
    };

    const handleConfirmPayment = () => {
        setIsPaying(true);
        router.post(
            `/portal/tagihan/${tagihanAktif.id}/bayar`,
            { metode_pembayaran: selectedPaymentMethod },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsPaying(false);
                    setShowPayModal(false);
                },
            },
        );
    };

    const handleToggleReminder = () => {
        const nextState = !obatSudahDiminum;
        setObatSudahDiminum(nextState);
        if (nextState) {
            setShowObatToast(true);
            setTimeout(() => setShowObatToast(false), 4000);
        }
    };

    // Default appointment card data if none exists
    const upcoming = janjiTemuTerdekat || {
        id: 'default-apt',
        nomor_antrian: 'UMU-008',
        dokter: 'dr. Ahmad Fauzi, Sp.PD',
        spesialisasi: 'Spesialis Penyakit Dalam',
        poli: 'Poli Umum',
        keluhan_layanan: 'Poli Umum • Follow-up Tekanan Darah',
        tanggal_label: '6 Aug 2026',
        tanggal_lengkap: 'Rabu, 6 Agustus 2026',
        jam_label: '09.00 WIB',
        countdown_label: 'Jadwal dimulai dalam 1 hari',
        status: 'menunggu',
        status_label: 'Sudah Dikonfirmasi',
        is_confirmed: true,
    };

    return (
        <PatientLayout user={user}>
            {/* Toast Notification */}
            {showObatToast && (
                <div className="fixed top-20 right-6 z-50 flex animate-bounce items-center gap-3 rounded-2xl bg-[#145e5b] px-5 py-3.5 text-sm font-semibold text-white shadow-2xl transition-all">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <span>
                        Terima kasih! Anda telah menandai obat hari ini sudah
                        diminum.
                    </span>
                </div>
            )}

            {/* Greeting Header */}
            <div className="mb-6">
                <h1 className="font-serif text-3xl font-normal tracking-tight text-[#17524c] sm:text-4xl">
                    Selamat datang, {patientName}
                </h1>
                <p className="mt-1.5 text-sm font-medium text-slate-600">
                    Senin, 5 Agustus 2026 • Hari yang cerah — jaga kesehatan dan
                    penuhi kebutuhan cairan tubuh!
                </p>
            </div>

            {/* Top 3 Cards Row (Janji Temu, Status Kesehatan, Resep) */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* Card 1: Janji Temu */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#dce8e4] bg-white p-5 shadow-xs transition-all hover:shadow-md">
                    {/* Decorative subtle corner curved wave */}
                    <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-[#dff3ee]/50" />

                    <div>
                        <div className="flex items-center gap-2.5 text-[#145e5b]">
                            <Calendar className="h-5 w-5" />
                            <h3 className="text-sm font-bold text-slate-900">
                                Janji Temu
                            </h3>
                        </div>

                        <div className="mt-4 space-y-1">
                            <div className="text-sm font-bold text-slate-900">
                                {upcoming.tanggal_lengkap ||
                                    'Rabu, 6 Agustus 2026'}
                            </div>
                            <div className="text-xs font-medium text-slate-600">
                                {upcoming.dokter}
                            </div>
                            <div className="text-xs text-slate-500">
                                {upcoming.poli}, {upcoming.jam_label}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-1">
                        <button
                            type="button"
                            onClick={() => setShowDetailJanjiModal(true)}
                            className="w-full rounded-xl bg-[#aee7e2] py-2 text-center text-xs font-bold text-[#0e4b47] transition-all hover:bg-[#99ddd7] active:scale-[0.99]"
                        >
                            Lihat Detail
                        </button>
                    </div>
                </div>

                {/* Card 2: Status Kesehatan */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#dce8e4] bg-white p-5 shadow-xs transition-all hover:shadow-md">
                    <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-[#dff3ee]/50" />

                    <div>
                        <div className="flex items-center gap-2.5 text-[#145e5b]">
                            <Heart className="h-5 w-5" />
                            <h3 className="text-sm font-bold text-slate-900">
                                Status Kesehatan
                            </h3>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-[#d7f0ea] px-2.5 py-0.5 text-[11px] font-bold text-[#145e5b]">
                                    {statusKesehatan.status_label || 'Stabil'}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {statusKesehatan.update_label}
                                </span>
                            </div>
                            <div className="mt-2 text-xs font-medium text-slate-700">
                                TD: {statusKesehatan.sistol}/
                                {statusKesehatan.diastol} | Suhu:{' '}
                                {statusKesehatan.suhu_tubuh}°C | SpO2:{' '}
                                {statusKesehatan.spo2}%
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-1">
                        <Link
                            href="/portal/rekam-medis"
                            className="block w-full rounded-xl bg-[#e5ecea] py-2 text-center text-xs font-bold text-slate-700 transition-all hover:bg-[#d8e2df] active:scale-[0.99]"
                        >
                            Rekam Medis
                        </Link>
                    </div>
                </div>

                {/* Card 3: Resep */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#dce8e4] bg-white p-5 shadow-xs transition-all hover:shadow-md">
                    <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-[#dff3ee]/50" />

                    <div>
                        <div className="flex items-center gap-2.5 text-[#145e5b]">
                            <Pill className="h-5 w-5" />
                            <h3 className="text-sm font-bold text-slate-900">
                                Resep
                            </h3>
                        </div>

                        <div className="mt-4">
                            <div className="text-sm font-bold text-slate-900">
                                {resepSummary.total_resep_aktif} Resep Aktif (
                                {resepSummary.siap_diambil} siap diambil)
                            </div>
                            <div className="mt-1.5 space-y-0.5 text-xs text-slate-600">
                                {resepSummary.items.map((item, idx) => (
                                    <div key={idx} className="truncate">
                                        {item.nama_obat} ({item.status_label})
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-1">
                        <button
                            type="button"
                            onClick={() => setShowResepModal(true)}
                            className="w-full rounded-xl bg-[#145e5b] py-2 text-center text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0f4a47] active:scale-[0.99]"
                        >
                            Ambil Sekarang
                        </button>
                    </div>
                </div>
            </div>

            {/* Section: Janji Temu Terdekat */}
            <div className="mt-8">
                <h2 className="text-lg font-bold text-slate-900">
                    Janji Temu Terdekat
                </h2>

                <div className="mt-3.5 rounded-2xl border border-[#dce8e4] bg-white p-5 shadow-xs sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            {/* Doctor Avatar */}
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-teal-100 bg-[#e7f4f1] text-[#145e5b] shadow-xs">
                                <span className="font-serif text-lg font-bold">
                                    dr
                                </span>
                            </div>

                            {/* Doctor & Appointment Details */}
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {upcoming.dokter}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-600">
                                    {upcoming.keluhan_layanan ||
                                        'Poli Umum • Follow-up Tekanan Darah'}
                                </p>

                                <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        {upcoming.tanggal_label || '6 Aug 2026'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                        {upcoming.jam_label || '09.00 WIB'}
                                    </span>
                                </div>

                                <div className="mt-2.5">
                                    <span className="inline-block rounded-full bg-[#dff3f0] px-3 py-0.5 text-xs font-semibold text-[#145e5b]">
                                        {upcoming.countdown_label ||
                                            'Jadwal dimulai dalam 1 hari'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="self-start">
                            <span className="flex items-center gap-1.5 rounded-full border border-[#bfe2da] bg-[#eef8f6] px-3 py-1 text-xs font-semibold text-[#145e5b]">
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                {upcoming.status_label || 'Sudah Dikonfirmasi'}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                        <Link
                            href="/portal/booking"
                            className="rounded-xl bg-[#e5ecea] px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#d8e2df]"
                        >
                            Ubah Jadwal
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowDirectionModal(true)}
                            className="rounded-xl bg-[#e5ecea] px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#d8e2df]"
                        >
                            Lihat Arah
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowContactDoctorModal(true)}
                            className="rounded-xl bg-[#e5ecea] px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#d8e2df]"
                        >
                            Hubungi Dokter
                        </button>
                    </div>
                </div>
            </div>

            {/* Section: Aktivitas & Riwayat */}
            <div className="mt-8">
                <h2 className="text-lg font-bold text-slate-900">
                    Aktivitas & Riwayat
                </h2>

                <div className="mt-3.5 grid grid-cols-1 gap-5 md:grid-cols-3">
                    {/* Card 1: Riwayat */}
                    <div className="flex flex-col justify-between rounded-2xl border border-[#dce8e4] bg-white p-5 shadow-xs">
                        <div>
                            <div className="flex items-center gap-2 text-slate-800">
                                <History className="h-4 w-4 text-slate-700" />
                                <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                                    Riwayat
                                </span>
                            </div>

                            <div className="mt-3">
                                <div className="text-sm font-bold text-slate-900">
                                    Riwayat Kunjungan
                                </div>
                                <div className="mt-0.5 text-xs text-slate-500">
                                    {rekamMedisTerbaru[0]?.created_at?.slice(
                                        0,
                                        11,
                                    ) || '3 Agt 2026'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="rounded-full bg-[#d7f0ea] px-2.5 py-0.5 text-[10px] font-bold text-[#145e5b]">
                                Hasil Tersedia
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowPdfModal(true)}
                                className="flex items-center gap-1 text-xs font-semibold text-[#145e5b] hover:underline"
                            >
                                <Download className="h-3 w-3" />
                                <span>Unduh PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Tagihan */}
                    <div className="flex flex-col justify-between rounded-2xl border border-[#dce8e4] bg-white p-5 shadow-xs">
                        <div>
                            <div className="flex items-center gap-2 text-slate-800">
                                <CreditCard className="h-4 w-4 text-slate-700" />
                                <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                                    Tagihan
                                </span>
                            </div>

                            <div className="mt-3">
                                <div className="text-2xl font-bold tracking-tight text-slate-900">
                                    {tagihanAktif.total_tagihan_formatted ||
                                        'Rp 750.000'}
                                </div>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                            tagihanAktif.status === 'lunas'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-rose-50 text-rose-700'
                                        }`}
                                    >
                                        {tagihanAktif.status_label ||
                                            'Belum Lunas'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Due: {tagihanAktif.due_date || '10 Agt'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={() => setShowPayModal(true)}
                                className="w-full rounded-xl bg-[#145e5b] py-2 text-center text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0f4a47] active:scale-[0.99]"
                            >
                                {tagihanAktif.status === 'lunas'
                                    ? 'Lihat Bukti Bayar'
                                    : 'Bayar Sekarang'}
                            </button>
                        </div>
                    </div>

                    {/* Card 3: Profil Kesehatan */}
                    <div className="flex flex-col justify-between rounded-2xl border border-[#dce8e4] bg-white p-5 shadow-xs">
                        <div>
                            <div className="flex items-center gap-2 text-slate-800">
                                <UserIcon className="h-4 w-4 text-slate-700" />
                                <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                                    Profil Kesehatan
                                </span>
                            </div>

                            <div className="mt-3 space-y-2.5">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2">
                                        <div className="text-[10px] text-slate-500">
                                            Gol. Darah
                                        </div>
                                        <div className="mt-0.5 text-sm font-bold text-slate-900">
                                            {profilKesehatan.golongan_darah}
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2">
                                        <div className="text-[10px] text-slate-500">
                                            BMI
                                        </div>
                                        <div className="mt-0.5 text-sm font-bold text-slate-900">
                                            {profilKesehatan.bmi}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2">
                                    <div className="text-[10px] text-slate-500">
                                        Kondisi
                                    </div>
                                    <div className="mt-0.5 truncate text-sm font-bold text-slate-900">
                                        {profilKesehatan.kondisi}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => setShowEditProfileModal(true)}
                                className="w-full rounded-xl bg-[#e5ecea] py-2 text-center text-xs font-bold text-slate-700 transition-all hover:bg-[#d8e2df] active:scale-[0.99]"
                            >
                                Edit Profil
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Card: Reminder Obat */}
            <div className="mt-6 rounded-2xl border border-[#d6e7e2] bg-[#ebf4f2] p-4 shadow-xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#cde9e3] text-[#145e5b]">
                            <Pill className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-900">
                                Reminder Obat
                            </div>
                            <div className="text-xs text-slate-600">
                                {reminderObat.nama_obat} – {reminderObat.jadwal}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-1.5 transition-colors hover:bg-white/60">
                            <input
                                type="checkbox"
                                checked={obatSudahDiminum}
                                onChange={handleToggleReminder}
                                className="h-4 w-4 rounded border-slate-300 text-[#145e5b] focus:ring-[#145e5b]"
                            />
                            <span
                                className={`text-xs font-semibold ${obatSudahDiminum ? 'text-teal-900 line-through' : 'text-slate-700'}`}
                            >
                                {obatSudahDiminum
                                    ? 'Sudah Diminum'
                                    : 'Tandai Sudah Diminum'}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* MODALS FOR ALL REAL ACTIONS */}
            {/* ========================================================= */}

            {/* 1. Modal Edit Profil Pasien */}
            {showEditProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowEditProfileModal(false)}
                    />
                    <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Edit Data & Profil Pasien
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Perbarui kontak dan informasi medis
                                        pribadi
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEditProfileModal(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveProfile}
                            className="mt-5 space-y-4 text-xs"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700">
                                        Golongan Darah
                                    </label>
                                    <select
                                        value={profileForm.data.golongan_darah}
                                        onChange={(e) =>
                                            profileForm.setData(
                                                'golongan_darah',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b]"
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                        <option value="-">-</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700">
                                        No. WhatsApp / HP
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.data.no_hp}
                                        onChange={(e) =>
                                            profileForm.setData(
                                                'no_hp',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="08123456789"
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700">
                                    Kondisi / Riwayat Medis
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.kondisi_terakhir}
                                    onChange={(e) =>
                                        profileForm.setData(
                                            'kondisi_terakhir',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Hipertensi, Diabetes"
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b]"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700">
                                    Riwayat Alergi (Obat/Makanan)
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.alergi}
                                    onChange={(e) =>
                                        profileForm.setData(
                                            'alergi',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Alergi Amoxicillin, Seafood"
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b]"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700">
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    rows={2}
                                    value={profileForm.data.alamat}
                                    onChange={(e) =>
                                        profileForm.setData(
                                            'alamat',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Alamat domisili saat ini"
                                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700">
                                        Nama Kontak Darurat
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            profileForm.data.nama_kontak_darurat
                                        }
                                        onChange={(e) =>
                                            profileForm.setData(
                                                'nama_kontak_darurat',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Keluarga / Kerabat"
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b]"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700">
                                        No. HP Kontak Darurat
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            profileForm.data
                                                .no_hp_kontak_darurat
                                        }
                                        onChange={(e) =>
                                            profileForm.setData(
                                                'no_hp_kontak_darurat',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="08129876543"
                                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b]"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEditProfileModal(false)
                                    }
                                    className="rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="rounded-xl bg-[#145e5b] px-5 py-2.5 font-bold text-white shadow-xs hover:bg-[#0f4a47] disabled:opacity-50"
                                >
                                    {profileForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Profil'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Modal Bayar Sekarang */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowPayModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Pembayaran Tagihan
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Invoice: {tagihanAktif.no_invoice}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPayModal(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4 text-xs">
                            <div className="rounded-2xl bg-[#f0f7f5] p-4 text-center">
                                <div className="text-[11px] font-semibold text-[#145e5b]">
                                    Total Tagihan Yang Harus Dibayar
                                </div>
                                <div className="mt-1 text-2xl font-black text-slate-900">
                                    {tagihanAktif.total_tagihan_formatted}
                                </div>
                                <div className="mt-1 text-[11px] text-slate-500">
                                    {tagihanAktif.layanan}
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-800">
                                    Pilih Metode Pembayaran
                                </label>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {[
                                        'QRIS',
                                        'BCA Virtual Account',
                                        'Mandiri VA',
                                    ].map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() =>
                                                setSelectedPaymentMethod(method)
                                            }
                                            className={`rounded-xl border p-2.5 text-center font-bold transition-all ${
                                                selectedPaymentMethod === method
                                                    ? 'border-[#145e5b] bg-[#e7f4f1] text-[#145e5b] ring-1 ring-[#145e5b]'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedPaymentMethod === 'QRIS' && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
                                    <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                                        <QrCode className="h-28 w-28 text-slate-800" />
                                    </div>
                                    <p className="mt-2 text-[11px] text-slate-500">
                                        Scan QRIS menggunakan BCA, GoPay, OVO,
                                        ShopeePay, atau m-Banking
                                    </p>
                                </div>
                            )}

                            {selectedPaymentMethod !== 'QRIS' && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="text-slate-500">
                                        Nomor Virtual Account:
                                    </div>
                                    <div className="mt-1 font-mono text-base font-bold text-[#145e5b]">
                                        8920 1204 8839 0012
                                    </div>
                                    <p className="mt-2 text-[10px] text-slate-400">
                                        Silakan transfer sesuai nominal tepat
                                        sebelum tanggal jatuh tempo.
                                    </p>
                                </div>
                            )}

                            <div className="mt-5 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleConfirmPayment}
                                    disabled={isPaying}
                                    className="w-full rounded-xl bg-[#145e5b] py-3 text-xs font-bold text-white shadow-xs hover:bg-[#0f4a47] disabled:opacity-50"
                                >
                                    {isPaying
                                        ? 'Memproses Pembayaran...'
                                        : 'Konfirmasi & Selesaikan Pembayaran'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Modal Lihat Arah */}
            {showDirectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowDirectionModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Petunjuk Arah & Lokasi Poli
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        RS Sentosa Medika Gedung Utama
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDirectionModal(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3.5 text-xs">
                            <div className="space-y-2 rounded-2xl border border-teal-100 bg-[#f0f7f5] p-4">
                                <div className="flex items-center gap-2 font-bold text-[#145e5b]">
                                    <Building2 className="h-4 w-4" />
                                    <span>Gedung A, Lantai 2, Ruang 204</span>
                                </div>
                                <p className="leading-relaxed text-slate-600">
                                    Dari lobi utama, gunakan Lift Barat menuju
                                    Lantai 2. Belok kanan di lorong Poli
                                    Spesialis Penyakit Dalam.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="font-bold text-slate-800">
                                    Alamat Rumah Sakit:
                                </div>
                                <p className="mt-0.5 text-slate-600">
                                    Jl. Jenderal Sudirman No. 45, Jakarta
                                    Selatan
                                </p>
                            </div>

                            <a
                                href="https://maps.google.com"
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#145e5b] py-2.5 font-bold text-white shadow-xs hover:bg-[#0f4a47]"
                            >
                                <MapPin className="h-4 w-4" />
                                <span>Buka di Google Maps</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Modal Hubungi Dokter / Telemedisin */}
            {showContactDoctorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowContactDoctorModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <MessageCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Konsultasi & Kontak Dokter
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {upcoming.dokter}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowContactDoctorModal(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3 text-xs">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <div className="font-bold text-slate-800">
                                    Layanan Chat Asisten Dokter & Poli:
                                </div>
                                <p className="mt-1 leading-relaxed text-slate-600">
                                    Anda dapat berkonsultasi mengenai persiapan
                                    pemeriksaan, konfirmasi jadwal, atau keluhan
                                    pra-kunjungan.
                                </p>
                            </div>

                            <a
                                href={`https://wa.me/6281234567890?text=Halo%20Admin%20Poli,%20saya%20${encodeURIComponent(patientName)}%20ingin%20konsultasi%20jadwal%20dengan%20${encodeURIComponent(upcoming.dokter)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow-xs hover:bg-emerald-700"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>Hubungi via WhatsApp Poli</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Modal Unduh PDF / Ringkasan Medis */}
            {showPdfModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowPdfModal(false)}
                    />
                    <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Dokumen Rekam Medis Pasien
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Ringkasan hasil pemeriksaan medis resmi
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPdfModal(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Printable Certificate/Report */}
                        <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-800 shadow-xs">
                            <div className="border-b border-slate-200 pb-3 text-center">
                                <div className="font-serif text-base font-bold text-[#17524c]">
                                    RUMAH SAKIT SENTOSA MEDIKA
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    Jl. Jenderal Sudirman No. 45, Jakarta
                                    Selatan | Telp: (021) 555-0199
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                    <span className="text-slate-500">
                                        Nama Pasien:
                                    </span>{' '}
                                    <strong className="text-slate-900">
                                        {patientName}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-slate-500">
                                        No. RM:
                                    </span>{' '}
                                    <strong className="text-slate-900">
                                        {p.nomor_rekam_medis || 'RM-2026-0089'}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-slate-500">
                                        Tanggal Kunjungan:
                                    </span>{' '}
                                    <strong className="text-slate-900">
                                        {statusKesehatan.terakhir_periksa}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-slate-500">
                                        Status Pemeriksaan:
                                    </span>{' '}
                                    <strong className="text-emerald-700">
                                        Final / Terverifikasi
                                    </strong>
                                </div>
                            </div>

                            <div className="space-y-1 rounded-xl bg-slate-50 p-3">
                                <div className="font-bold text-slate-900">
                                    Tanda Vital:
                                </div>
                                <div className="text-slate-700">
                                    Tekanan Darah: {statusKesehatan.sistol}/
                                    {statusKesehatan.diastol} mmHg | Suhu:{' '}
                                    {statusKesehatan.suhu_tubuh}°C | SpO2:{' '}
                                    {statusKesehatan.spo2}%
                                </div>
                            </div>

                            <div className="space-y-1 rounded-xl bg-slate-50 p-3">
                                <div className="font-bold text-slate-900">
                                    Diagnosis Medis:
                                </div>
                                <div className="text-slate-700">
                                    {profilKesehatan.kondisi ||
                                        'Hipertensi Primer (I10)'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#145e5b] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0f4a47]"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Cetak / Simpan PDF</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPdfModal(false)}
                                className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Modal Resep & Pengambilan Obat */}
            {showResepModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowResepModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <Pill className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Pengambilan Resep Obat
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Unit Farmasi & Apotek RS Sentosa Medika
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowResepModal(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3.5 text-xs">
                            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="font-bold text-slate-900">
                                    Daftar Obat Resep Aktif:
                                </div>
                                {resepSummary.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5"
                                    >
                                        <div>
                                            <div className="font-bold text-slate-800">
                                                {item.nama_obat}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                {item.aturan_pakai ||
                                                    '1x sehari sesudah makan'}
                                            </div>
                                        </div>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                item.status === 'sudah_ditebus'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}
                                        >
                                            {item.status_label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-2xl bg-[#e7f4f1] p-4 text-center">
                                <div className="text-[11px] font-semibold text-[#145e5b]">
                                    Tunjukkan Barcode ini di Loket Farmasi:
                                </div>
                                <div className="mt-2 font-mono text-base font-bold text-[#145e5b]">
                                    FAR-20260814-0092
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowResepModal(false)}
                                className="w-full rounded-xl bg-[#145e5b] py-2.5 font-bold text-white shadow-xs hover:bg-[#0f4a47]"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. Modal Detail Janji Temu */}
            {showDetailJanjiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                        onClick={() => setShowDetailJanjiModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#145e5b]">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#17524c]">
                                        Detail Janji Temu
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Nomor Antrian: {upcoming.nomor_antrian}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDetailJanjiModal(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3 text-xs">
                            <div className="space-y-2.5 rounded-2xl bg-slate-50 p-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Dokter
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {upcoming.dokter}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Poli / Spesialisasi
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {upcoming.poli}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Tanggal & Jam
                                    </span>
                                    <span className="font-bold text-[#145e5b]">
                                        {upcoming.tanggal_lengkap},{' '}
                                        {upcoming.jam_label}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Status Booking
                                    </span>
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                                        Terkonfirmasi
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 flex gap-2">
                                <Link
                                    href="/portal/booking"
                                    className="flex-1 rounded-xl bg-[#145e5b] py-2.5 text-center font-bold text-white hover:bg-[#0f4a47]"
                                >
                                    Kelola Booking
                                </Link>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDetailJanjiModal(false)
                                    }
                                    className="rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-200"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PatientLayout>
    );
}
