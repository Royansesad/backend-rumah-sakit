import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';

interface PasienItem {
    id: string;
    nama_lengkap: string;
    nomor_rekam_medis: string;
    nik?: string;
    jenis_layanan?: string;
}

interface DokterItem {
    id: string;
    nama_lengkap: string;
    spesialisasi?: string;
}

interface BangsalItem {
    id: string;
    kode_bangsal: string;
    nama_bangsal: string;
    kapasitas: number;
    is_aktif: boolean;
}

interface RuanganItem {
    id: string;
    nama_ruangan: string;
    tipe_ruangan: string;
}

interface ActiveAdmission {
    id: string;
    nomor_admission: string;
    tanggal_masuk: string;
    pasien: PasienItem;
    dpjp?: DokterItem;
}

interface BedItem {
    id: string;
    nomor_bed: string;
    ruangan_id?: string;
    bangsal_id?: string;
    kelas:
        'VIP' | 'Kelas 1' | 'Kelas 2' | 'Kelas 3' | 'ICU' | 'HCU' | 'Isolasi';
    tarif_per_hari: number | string;
    status: 'tersedia' | 'terisi' | 'pemeliharaan' | 'dibersihkan';
    catatan?: string;
    ruangan?: RuanganItem;
    bangsal?: BangsalItem;
    active_admission?: ActiveAdmission;
}

interface RiwayatPindah {
    id: string;
    tanggal_pindah: string;
    alasan_pindah?: string;
    bed_asal?: { nomor_bed: string };
    bed_tujuan?: { nomor_bed: string };
}

interface AdmissionItem {
    id: string;
    nomor_admission: string;
    pasien_id: string;
    bed_id: string;
    ruangan_id?: string;
    bangsal_id?: string;
    dpjp_id?: string;
    tanggal_masuk: string;
    tanggal_keluar_rencana?: string;
    tanggal_keluar_aktual?: string;
    status:
        'aktif' | 'pulang_sembuh' | 'pulang_paksa' | 'dirujuk' | 'meninggal';
    alasan_masuk?: string;
    diagnosa_awal?: string;
    ringkasan_pulang?: string;
    pasien: PasienItem;
    bed: BedItem;
    ruangan?: RuanganItem;
    bangsal?: BangsalItem;
    dpjp?: DokterItem;
    riwayat_pindah?: RiwayatPindah[];
}

interface Statistik {
    total_bed: number;
    tersedia: number;
    terisi: number;
    dibersihkan: number;
    pemeliharaan: number;
    bor_percentage: number;
    pasien_aktif: number;
}

interface Props {
    user?: any;
    role?: Role;
    pasiens?: PasienItem[];
    dokters?: DokterItem[];
    bangsals?: BangsalItem[];
    ruangans?: RuanganItem[];
    beds?: BedItem[];
    admissions?: AdmissionItem[];
    statistik?: Statistik;
}

export default function RawatInapPage({
    user,
    role = 'admin',
    pasiens = [],
    dokters = [],
    bangsals = [],
    ruangans = [],
    beds = [],
    admissions = [],
    statistik = {
        total_bed: 0,
        tersedia: 0,
        terisi: 0,
        dibersihkan: 0,
        pemeliharaan: 0,
        bor_percentage: 0,
        pasien_aktif: 0,
    },
}: Props) {
    const [activeTab, setActiveTab] = useState<
        'matrix' | 'admissions' | 'manage_beds'
    >('admissions');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [kelasFilter, setKelasFilter] = useState<string>('all');
    const [bangsalFilter, setBangsalFilter] = useState<string>('all');

    // Modal States
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showPindahModal, setShowPindahModal] = useState(false);
    const [showDischargeModal, setShowDischargeModal] = useState(false);
    const [showBedModal, setShowBedModal] = useState(false);
    const [selectedAdmission, setSelectedAdmission] =
        useState<AdmissionItem | null>(null);

    // Check-in Form Data
    const [checkInForm, setCheckInForm] = useState({
        pasien_id: '',
        bed_id: '',
        dpjp_id: '',
        tanggal_masuk: new Date().toISOString().slice(0, 16),
        tanggal_keluar_rencana: '',
        alasan_masuk: '',
        diagnosa_awal: '',
    });

    // Pindah Bed Form Data
    const [pindahForm, setPindahForm] = useState({
        bed_tujuan_id: '',
        alasan_pindah: '',
    });

    // Discharge Form Data
    const [dischargeForm, setDischargeForm] = useState({
        status: 'pulang_sembuh' as
            'pulang_sembuh' | 'pulang_paksa' | 'dirujuk' | 'meninggal',
        ringkasan_pulang: '',
    });

    // Bed Master Form Data
    const [bedForm, setBedForm] = useState<{
        id: string;
        nomor_bed: string;
        ruangan_id: string;
        bangsal_id: string;
        kelas: BedItem['kelas'];
        tarif_per_hari: number;
        status: BedItem['status'];
        catatan: string;
    }>({
        id: '',
        nomor_bed: '',
        ruangan_id: '',
        bangsal_id: '',
        kelas: 'Kelas 3',
        tarif_per_hari: 200000,
        status: 'tersedia',
        catatan: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    const showNotify = (
        message: string,
        type: 'success' | 'error' = 'success',
    ) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const formatDateIndo = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Filter beds for matrix view
    const filteredBeds = beds.filter((bed) => {
        const matchSearch =
            bed.nomor_bed.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (bed.ruangan?.nama_ruangan || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (bed.bangsal?.nama_bangsal || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (bed.active_admission?.pasien?.nama_lengkap || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchStatus =
            statusFilter === 'all' || bed.status === statusFilter;
        const matchKelas = kelasFilter === 'all' || bed.kelas === kelasFilter;
        const matchBangsal =
            bangsalFilter === 'all' || bed.bangsal_id === bangsalFilter;

        return matchSearch && matchStatus && matchKelas && matchBangsal;
    });

    // Filter active admissions table
    const filteredAdmissions = admissions.filter((adm) => {
        const matchSearch =
            adm.nomor_admission
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (adm.pasien?.nama_lengkap || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (adm.pasien?.nomor_rekam_medis || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (adm.bed?.nomor_bed || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (adm.bangsal?.nama_bangsal || adm.bed?.bangsal?.nama_bangsal || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (adm.ruangan?.nama_ruangan || adm.bed?.ruangan?.nama_ruangan || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (adm.dpjp?.nama_lengkap || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchStatus =
            statusFilter === 'all' || adm.status === statusFilter;
        const matchKelas =
            kelasFilter === 'all' || adm.bed?.kelas === kelasFilter;
        const matchBangsal =
            bangsalFilter === 'all' ||
            adm.bangsal_id === bangsalFilter ||
            adm.bed?.bangsal_id === bangsalFilter;

        return matchSearch && matchStatus && matchKelas && matchBangsal;
    });

    // Actions
    const handleCheckInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkInForm.pasien_id || !checkInForm.bed_id) {
            showNotify('Harap pilih pasien dan tempat tidur (bed).', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/v1/rawat-inap/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(checkInForm),
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify(
                    'Pasien berhasil Check-In ke Rawat Inap!',
                    'success',
                );
                setShowCheckInModal(false);
                router.reload();
            } else {
                showNotify(
                    data.message || 'Gagal mendaftarkan Check-In.',
                    'error',
                );
            }
        } catch (err: any) {
            showNotify('Terjadi kesalahan koneksi server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePindahSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmission || !pindahForm.bed_tujuan_id) {
            showNotify('Harap pilih bed tujuan perpindahan.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(
                `/api/v1/rawat-inap/${selectedAdmission.id}/pindah-bed`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(pindahForm),
                },
            );
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify(
                    'Pasien berhasil dipindahkan ke Bed baru!',
                    'success',
                );
                setShowPindahModal(false);
                router.reload();
            } else {
                showNotify(data.message || 'Gagal memindahkan bed.', 'error');
            }
        } catch (err: any) {
            showNotify('Terjadi kesalahan koneksi server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDischargeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmission) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(
                `/api/v1/rawat-inap/${selectedAdmission.id}/check-out`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(dischargeForm),
                },
            );
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify(
                    'Pasien berhasil di-Discharge (Check-Out) dari Rawat Inap!',
                    'success',
                );
                setShowDischargeModal(false);
                router.reload();
            } else {
                showNotify(
                    data.message || 'Gagal memproses check-out.',
                    'error',
                );
            }
        } catch (err: any) {
            showNotify('Terjadi kesalahan koneksi server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleBedStatus = async (
        bedId: string,
        currentStatus: string,
    ) => {
        const nextStatus =
            currentStatus === 'dibersihkan' ? 'tersedia' : 'dibersihkan';
        try {
            const res = await fetch(`/api/v1/beds/${bedId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    status: nextStatus,
                    catatan: `Status diubah ke ${nextStatus} oleh petugas`,
                }),
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify(
                    `Status Bed berhasil diperbarui ke ${nextStatus.toUpperCase()}`,
                    'success',
                );
                router.reload();
            } else {
                showNotify(
                    data.message || 'Gagal memperbarui status bed.',
                    'error',
                );
            }
        } catch (err) {
            showNotify('Gagal memperbarui status bed.', 'error');
        }
    };

    const handleBedFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bedForm.nomor_bed) {
            showNotify('Nomor bed wajib diisi.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const isEdit = !!bedForm.id;
            const url = isEdit ? `/api/v1/beds/${bedForm.id}` : '/api/v1/beds';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(bedForm),
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify(
                    isEdit
                        ? 'Data Bed berhasil diperbarui!'
                        : 'Bed baru berhasil ditambahkan!',
                    'success',
                );
                setShowBedModal(false);
                router.reload();
            } else {
                showNotify(
                    data.message || 'Gagal menyimpan data bed.',
                    'error',
                );
            }
        } catch (err) {
            showNotify('Terjadi kesalahan koneksi server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCheckInForBed = (bedId: string) => {
        setCheckInForm((prev) => ({ ...prev, bed_id: bedId }));
        setShowCheckInModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'tersedia':
                return (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        ● Tersedia
                    </span>
                );
            case 'terisi':
                return (
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
                        ● Terisi Pasien
                    </span>
                );
            case 'dibersihkan':
                return (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        ● Sterilisasi
                    </span>
                );
            case 'pemeliharaan':
                return (
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800">
                        ● Pemeliharaan
                    </span>
                );
            default:
                return (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <Layout user={user} role={role} title="Manajemen Bed & Rawat Inap">
            <div className="mx-auto min-h-screen max-w-[1400px] space-y-4 bg-slate-50/50 p-4 pb-12 sm:p-6">
                {/* Header & Title - Exactly matching reference */}
                <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs md:flex-row md:items-center">
                    <div>
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                            <span>Dashboard</span>
                            <span className="text-slate-300">&gt;</span>
                            <span className="text-slate-600">
                                Manajemen Bed
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Sistem Manajemen Bed & Rawat Inap
                            </h1>
                            <span className="rounded bg-[#e4f2f0] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#0d5c56] uppercase">
                                SIMRS BED MANAGEMENT
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Pemantauan ketersediaan tempat tidur (BOR), admisi
                            rawat inap, mutasi bed, dan proses discharge pasien.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={() => {
                                setCheckInForm({
                                    pasien_id: '',
                                    bed_id: '',
                                    dpjp_id: '',
                                    tanggal_masuk: new Date()
                                        .toISOString()
                                        .slice(0, 16),
                                    tanggal_keluar_rencana: '',
                                    alasan_masuk: '',
                                    diagnosa_awal: '',
                                });
                                setShowCheckInModal(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c56] px-4.5 py-2.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#0a4843]"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                            Check-In Rawat Inap
                        </button>

                        <button
                            onClick={() => {
                                setBedForm({
                                    id: '',
                                    nomor_bed: '',
                                    ruangan_id: '',
                                    bangsal_id: '',
                                    kelas: 'Kelas 3',
                                    tarif_per_hari: 200000,
                                    status: 'tersedia',
                                    catatan: '',
                                });
                                setShowBedModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4.5 py-2.5 text-xs font-medium text-slate-800 shadow-xs transition-colors hover:bg-slate-50"
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Tambah Bed Master
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {notification && (
                    <div
                        className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-medium shadow-xs ${
                            notification.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-rose-200 bg-rose-50 text-rose-800'
                        }`}
                    >
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* KPI Summary Cards - With vertical color strip on left */}
                <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
                    {/* 1. BOR */}
                    <div className="relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs">
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 rounded-r bg-[#0d5c56]"></div>
                        <span className="pl-1 text-[11px] leading-tight font-semibold tracking-wider text-slate-500 uppercase">
                            BOR
                            <br />
                            (OCCUPANCY)
                        </span>
                        <div className="pl-1">
                            <div className="text-2xl font-bold text-slate-900">
                                {statistik.bor_percentage}%
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Target Ideal: 60-85%
                            </p>
                        </div>
                    </div>

                    {/* 2. TOTAL BED */}
                    <div className="relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs">
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 rounded-r bg-[#0d4f42]"></div>
                        <span className="pl-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                            TOTAL BED
                        </span>
                        <div className="pl-1">
                            <div className="text-2xl font-bold text-slate-900">
                                {statistik.total_bed}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Kapasitas RS
                            </p>
                        </div>
                    </div>

                    {/* 3. BED TERSEDIA */}
                    <div className="relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs">
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 rounded-r bg-[#10b981]"></div>
                        <span className="pl-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                            BED TERSEDIA
                        </span>
                        <div className="pl-1">
                            <div className="text-2xl font-bold text-[#10b981]">
                                {statistik.tersedia}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Siap Ditempati
                            </p>
                        </div>
                    </div>

                    {/* 4. BED TERISI */}
                    <div className="relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs">
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 rounded-r bg-[#f59e0b]"></div>
                        <span className="pl-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                            BED TERISI
                        </span>
                        <div className="pl-1">
                            <div className="text-2xl font-bold text-[#f59e0b]">
                                {statistik.terisi}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Pasien Rawat Inap
                            </p>
                        </div>
                    </div>

                    {/* 5. STERILISASI */}
                    <div className="relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs">
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 rounded-r bg-[#3b82f6]"></div>
                        <span className="pl-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                            STERILISASI
                        </span>
                        <div className="pl-1">
                            <div className="text-2xl font-bold text-[#3b82f6]">
                                {statistik.dibersihkan}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Proses Pembersihan
                            </p>
                        </div>
                    </div>

                    {/* 6. PEMELIHARAAN */}
                    <div className="relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs">
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 rounded-r bg-[#ef4444]"></div>
                        <span className="pl-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                            PEMELIHARAAN
                        </span>
                        <div className="pl-1">
                            <div className="text-2xl font-bold text-[#ef4444]">
                                {statistik.pemeliharaan}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Perbaikan Non-Aktif
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-6 shadow-xs">
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition-all ${
                            activeTab === 'matrix'
                                ? 'border-[#0d5c56] text-[#0d5c56]'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        Bed Occupancy Matrix
                    </button>

                    <button
                        onClick={() => setActiveTab('admissions')}
                        className={`flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition-all ${
                            activeTab === 'admissions'
                                ? 'border-[#0d5c56] text-[#0d5c56]'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect x="8" y="2" width="8" height="4" rx="1" />
                            <path d="M9 12h6" />
                            <path d="M9 16h6" />
                        </svg>
                        Daftar Pasien Rawat Inap (
                        {admissions.filter((a) => a.status === 'aktif').length})
                    </button>

                    <button
                        onClick={() => setActiveTab('manage_beds')}
                        className={`flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition-all ${
                            activeTab === 'manage_beds'
                                ? 'border-[#0d5c56] text-[#0d5c56]'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M2 4v16" />
                            <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                            <path d="M2 17h20" />
                            <path d="M6 8v9" />
                        </svg>
                        Kelola Master Bed ({beds.length})
                    </button>
                </div>

                {/* Filters Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="flex flex-1 flex-wrap items-center gap-2.5">
                        <div className="relative min-w-[240px]">
                            <svg
                                className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari Bed, Pasien, Bangsal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pr-3 pl-10 text-xs text-slate-800 focus:border-[#0d5c56] focus:ring-2 focus:ring-[#0d5c56]/20 focus:outline-none"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="appearance-none rounded-xl border border-slate-300 bg-white py-1.5 pr-8 pl-3 text-xs text-slate-700 focus:border-[#0d5c56] focus:ring-2 focus:ring-[#0d5c56]/20 focus:outline-none"
                            >
                                <option value="all">Semua Status</option>
                                <option value="aktif">Rawat Inap Aktif</option>
                                <option value="tersedia">Tersedia</option>
                                <option value="terisi">Terisi Pasien</option>
                                <option value="dibersihkan">Sterilisasi</option>
                                <option value="pemeliharaan">
                                    Pemeliharaan
                                </option>
                                <option value="pulang_sembuh">
                                    Pulang Sembuh
                                </option>
                                <option value="pulang_paksa">
                                    Pulang Paksa
                                </option>
                                <option value="dirujuk">Dirujuk</option>
                                <option value="meninggal">Meninggal</option>
                            </select>
                            <svg
                                className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>

                        <div className="relative">
                            <select
                                value={kelasFilter}
                                onChange={(e) => setKelasFilter(e.target.value)}
                                className="appearance-none rounded-xl border border-slate-300 bg-white py-1.5 pr-8 pl-3 text-xs text-slate-700 focus:border-[#0d5c56] focus:ring-2 focus:ring-[#0d5c56]/20 focus:outline-none"
                            >
                                <option value="all">Semua Kelas</option>
                                <option value="VIP">VIP</option>
                                <option value="Kelas 1">Kelas 1</option>
                                <option value="Kelas 2">Kelas 2</option>
                                <option value="Kelas 3">Kelas 3</option>
                                <option value="ICU">ICU</option>
                                <option value="HCU">HCU</option>
                                <option value="Isolasi">Isolasi</option>
                            </select>
                            <svg
                                className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>

                        <div className="relative">
                            <select
                                value={bangsalFilter}
                                onChange={(e) =>
                                    setBangsalFilter(e.target.value)
                                }
                                className="appearance-none rounded-xl border border-slate-300 bg-white py-1.5 pr-8 pl-3 text-xs text-slate-700 focus:border-[#0d5c56] focus:ring-2 focus:ring-[#0d5c56]/20 focus:outline-none"
                            >
                                <option value="all">Semua Bangsal</option>
                                {bangsals.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nama_bangsal}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="text-xs font-normal text-slate-500">
                        menampilkan{' '}
                        {activeTab === 'admissions'
                            ? filteredAdmissions.length
                            : filteredBeds.length}{' '}
                        item tempat tidur
                    </div>
                </div>

                {/* TAB 1: VISUAL MATRIX BOARD - Pixel Perfect to Reference Image */}
                {activeTab === 'matrix' && (
                    <div className="space-y-6">
                        {filteredBeds.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                                <svg
                                    className="mx-auto mb-3 h-12 w-12 text-slate-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                                <p className="text-sm font-medium text-slate-500">
                                    Tidak ada bed yang sesuai dengan filter
                                    pencarian.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filteredBeds.map((bed) => {
                                    const isOccupied = bed.status === 'terisi';
                                    const isCleaning =
                                        bed.status === 'dibersihkan';
                                    const isMaintenance =
                                        bed.status === 'pemeliharaan';
                                    const isAvailable =
                                        bed.status === 'tersedia';

                                    let topBorderColor = 'border-t-rose-300';
                                    if (isAvailable)
                                        topBorderColor = 'border-t-emerald-400';
                                    if (isCleaning)
                                        topBorderColor = 'border-t-blue-400';
                                    if (isMaintenance)
                                        topBorderColor = 'border-t-rose-400';

                                    return (
                                        <div
                                            key={bed.id}
                                            className={`rounded-2xl border border-t-[3px] border-slate-200 bg-white p-4 ${topBorderColor} flex flex-col justify-between shadow-xs transition-all hover:shadow-sm`}
                                        >
                                            <div>
                                                {/* Header Bed Name & Class Badge */}
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                                            {bed.nomor_bed}
                                                        </h3>
                                                        <p className="mt-0.5 truncate text-xs font-normal text-slate-500">
                                                            {bed.bangsal
                                                                ?.nama_bangsal ||
                                                                bed.ruangan
                                                                    ?.nama_ruangan ||
                                                                'Tanpa Bangsal'}
                                                        </p>
                                                    </div>
                                                    {bed.kelas === 'ICU' ? (
                                                        <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-500">
                                                            ICU
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                                            {bed.kelas}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Status Pill Badge */}
                                                <div className="mt-2">
                                                    {isOccupied && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-500">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                                            Terisi Pasien
                                                        </span>
                                                    )}
                                                    {isAvailable && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                            Tersedia
                                                        </span>
                                                    )}
                                                    {isCleaning && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                                            Sterilisasi
                                                        </span>
                                                    )}
                                                    {isMaintenance && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                                                            Pemeliharaan
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Middle Box: Occupied info or Bed Kosong placeholder */}
                                                {isOccupied && (
                                                    <div className="mt-3 flex min-h-[90px] flex-col justify-center space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                                                        <div className="truncate text-xs font-bold text-slate-900">
                                                            {bed
                                                                .active_admission
                                                                ?.pasien
                                                                ?.nama_lengkap ||
                                                                'Pasien Rawat Inap'}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500">
                                                            RM: &nbsp;
                                                            {bed
                                                                .active_admission
                                                                ?.pasien
                                                                ?.nomor_rekam_medis ||
                                                                '-'}
                                                        </div>
                                                        <div className="text-[11px] text-slate-600">
                                                            DPJP: &nbsp;
                                                            {bed
                                                                .active_admission
                                                                ?.dpjp
                                                                ?.nama_lengkap ||
                                                                '-'}
                                                        </div>
                                                    </div>
                                                )}

                                                {isAvailable && (
                                                    <div className="mt-3 flex min-h-[90px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/40 p-3 text-center">
                                                        <svg
                                                            className="mb-1 h-6 w-6 text-slate-300"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                        >
                                                            <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
                                                        </svg>
                                                        <span className="text-xs font-medium text-slate-400">
                                                            Bed Kosong
                                                        </span>
                                                    </div>
                                                )}

                                                {isCleaning && (
                                                    <div className="mt-3 flex min-h-[90px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-3 text-center">
                                                        <svg
                                                            className="mb-1 h-6 w-6 text-blue-300"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                                            />
                                                        </svg>
                                                        <span className="text-xs font-medium text-blue-500">
                                                            Proses Sterilisasi
                                                        </span>
                                                    </div>
                                                )}

                                                {isMaintenance && (
                                                    <div className="mt-3 flex min-h-[90px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/50 p-3 text-center">
                                                        <svg
                                                            className="mb-1 h-6 w-6 text-slate-400"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                        <span className="text-xs font-medium text-slate-500">
                                                            Dalam Pemeliharaan
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Tarif per hari */}
                                                <div className="mt-3 border-b border-slate-200 pb-2.5 text-[11px] text-slate-400">
                                                    Rp{' '}
                                                    {Number(
                                                        bed.tarif_per_hari,
                                                    ).toLocaleString(
                                                        'id-ID',
                                                    )}{' '}
                                                    / hari
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-3">
                                                {isAvailable && (
                                                    <button
                                                        onClick={() =>
                                                            openCheckInForBed(
                                                                bed.id,
                                                            )
                                                        }
                                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0d5c56] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#0a4843]"
                                                    >
                                                        <svg
                                                            className="h-3.5 w-3.5"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                            />
                                                        </svg>
                                                        Check-in
                                                    </button>
                                                )}

                                                {isCleaning && (
                                                    <button
                                                        onClick={() =>
                                                            handleToggleBedStatus(
                                                                bed.id,
                                                                'dibersihkan',
                                                            )
                                                        }
                                                        className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700"
                                                    >
                                                        ✓ Set Siap (Tersedia)
                                                    </button>
                                                )}

                                                {isMaintenance && (
                                                    <button
                                                        onClick={() =>
                                                            handleToggleBedStatus(
                                                                bed.id,
                                                                'pemeliharaan',
                                                            )
                                                        }
                                                        className="w-full rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-slate-800"
                                                    >
                                                        ✓ Aktifkan Bed
                                                    </button>
                                                )}

                                                {isOccupied && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const adm =
                                                                    admissions.find(
                                                                        (a) =>
                                                                            a.id ===
                                                                            bed
                                                                                .active_admission
                                                                                ?.id,
                                                                    );
                                                                if (adm) {
                                                                    setSelectedAdmission(
                                                                        adm,
                                                                    );
                                                                    setShowPindahModal(
                                                                        true,
                                                                    );
                                                                }
                                                            }}
                                                            className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
                                                        >
                                                            Pindah Bed
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                const adm =
                                                                    admissions.find(
                                                                        (a) =>
                                                                            a.id ===
                                                                            bed
                                                                                .active_admission
                                                                                ?.id,
                                                                    );
                                                                if (adm) {
                                                                    setSelectedAdmission(
                                                                        adm,
                                                                    );
                                                                    setShowDischargeModal(
                                                                        true,
                                                                    );
                                                                }
                                                            }}
                                                            className="flex-1 rounded-lg border border-rose-300 bg-white px-2 py-1.5 text-center text-xs font-semibold text-rose-500 shadow-2xs transition-colors hover:bg-rose-50"
                                                        >
                                                            Discharge
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: DAFTAR ADMISI PASIEN RAWAT INAP - Pixel Perfect to Reference */}
                {activeTab === 'admissions' && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200 bg-[#f8fafc] text-xs font-semibold text-slate-600">
                                    <tr>
                                        <th className="px-6 py-3.5">
                                            No. Admisi
                                        </th>
                                        <th className="px-6 py-3.5">Pasien</th>
                                        <th className="px-6 py-3.5">
                                            Bed & Ruangan
                                        </th>
                                        <th className="px-6 py-3.5">DPJP</th>
                                        <th className="px-6 py-3.5">
                                            Tgl Masuk
                                        </th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-center">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAdmissions.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-12 text-center text-slate-400"
                                            >
                                                Belum ada data pendaftaran
                                                admisi rawat inap.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdmissions.map((adm) => (
                                            <tr
                                                key={adm.id}
                                                className="transition-colors hover:bg-slate-50/70"
                                            >
                                                <td className="px-6 py-4 text-xs font-bold tracking-tight text-slate-900">
                                                    {adm.nomor_admission}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold text-slate-900">
                                                        {adm.pasien
                                                            ?.nama_lengkap ||
                                                            '-'}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] text-slate-400">
                                                        RM:{' '}
                                                        {adm.pasien
                                                            ?.nomor_rekam_medis ||
                                                            '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold text-slate-900 uppercase">
                                                        {adm.bed?.nomor_bed ||
                                                            '-'}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] text-slate-400">
                                                        {adm.bangsal
                                                            ?.nama_bangsal ||
                                                            adm.bed?.bangsal
                                                                ?.nama_bangsal ||
                                                            adm.ruangan
                                                                ?.nama_ruangan ||
                                                            adm.bed?.ruangan
                                                                ?.nama_ruangan ||
                                                            '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-normal text-slate-700">
                                                    {adm.dpjp?.nama_lengkap ||
                                                        '-'}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-normal text-slate-700">
                                                    {formatDateIndo(
                                                        adm.tanggal_masuk,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {adm.status === 'aktif' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bce3db] bg-[#e6f4f1] px-3 py-1 text-xs font-semibold text-[#0d5c56]">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#0d5c56]"></span>
                                                            Rawat Inap Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                            {adm.status
                                                                .replace(
                                                                    '_',
                                                                    ' ',
                                                                )
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {adm.status === 'aktif' && (
                                                        <div className="mx-auto flex w-24 flex-col items-center gap-1.5">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAdmission(
                                                                        adm,
                                                                    );
                                                                    setShowPindahModal(
                                                                        true,
                                                                    );
                                                                }}
                                                                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-center text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
                                                            >
                                                                Pindah Bed
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAdmission(
                                                                        adm,
                                                                    );
                                                                    setShowDischargeModal(
                                                                        true,
                                                                    );
                                                                }}
                                                                className="w-full rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-center text-xs font-semibold text-rose-500 shadow-2xs transition-colors hover:bg-rose-50"
                                                            >
                                                                Check-Out
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: KELOLA MASTER BED - Pixel Perfect to Reference Image */}
                {activeTab === 'manage_beds' && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 p-5">
                            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                                Daftar Tempat Tidur (Master Bed)
                            </h2>
                            <button
                                onClick={() => {
                                    setBedForm({
                                        id: '',
                                        nomor_bed: '',
                                        ruangan_id: '',
                                        bangsal_id: '',
                                        kelas: 'Kelas 3',
                                        tarif_per_hari: 200000,
                                        status: 'tersedia',
                                        catatan: '',
                                    });
                                    setShowBedModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d5c56] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#0a4843]"
                            >
                                <span className="text-sm leading-none font-bold">
                                    +
                                </span>
                                Tambah Bed Baru
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200 bg-white text-xs font-semibold text-slate-700">
                                    <tr>
                                        <th className="px-6 py-3.5">
                                            Nomor Bed
                                        </th>
                                        <th className="px-6 py-3.5">
                                            Bangsal / Ruangan
                                        </th>
                                        <th className="px-6 py-3.5 text-center">
                                            Kelas
                                        </th>
                                        <th className="px-6 py-3.5">
                                            Tarif / Hari
                                        </th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-center">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredBeds.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-12 text-center text-slate-400"
                                            >
                                                Tidak ada tempat tidur yang
                                                sesuai.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBeds.map((b) => (
                                            <tr
                                                key={b.id}
                                                className="transition-colors hover:bg-slate-50/60"
                                            >
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                    {b.nomor_bed}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-semibold text-slate-900">
                                                        {b.bangsal
                                                            ?.nama_bangsal ||
                                                            b.ruangan
                                                                ?.nama_ruangan ||
                                                            '-'}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] font-normal text-slate-500">
                                                        {b.bangsal
                                                            ? `(${b.bangsal.nama_bangsal.includes('VIP') ? 'Rawat Inap VIP' : b.bangsal.nama_bangsal.includes('Intensif') ? 'Perawatan Intensif' : 'Rawat Inap Utama'})`
                                                            : ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block rounded-md bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                                        {b.kelas}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                    Rp{' '}
                                                    {Number(
                                                        b.tarif_per_hari,
                                                    ).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {b.status === 'terisi' && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-500">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                                            Terisi Pasien
                                                        </span>
                                                    )}
                                                    {b.status ===
                                                        'tersedia' && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                            Tersedia
                                                        </span>
                                                    )}
                                                    {b.status ===
                                                        'dibersihkan' && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                                            Sterilisasi
                                                        </span>
                                                    )}
                                                    {b.status ===
                                                        'pemeliharaan' && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                                                            Pemeliharaan
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setBedForm({
                                                                id: b.id,
                                                                nomor_bed:
                                                                    b.nomor_bed,
                                                                ruangan_id:
                                                                    b.ruangan_id ||
                                                                    '',
                                                                bangsal_id:
                                                                    b.bangsal_id ||
                                                                    '',
                                                                kelas: b.kelas,
                                                                tarif_per_hari:
                                                                    Number(
                                                                        b.tarif_per_hari,
                                                                    ),
                                                                status: b.status,
                                                                catatan:
                                                                    b.catatan ||
                                                                    '',
                                                            });
                                                            setShowBedModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="rounded-lg border border-slate-300 bg-white px-3.5 py-1 text-center text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MODAL 1: CHECK-IN RAWAT INAP */}
                {showCheckInModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Form Check-In Rawat Inap Pasien
                                </h3>
                                <button
                                    onClick={() => setShowCheckInModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <form
                                onSubmit={handleCheckInSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Pilih Pasien *
                                    </label>
                                    <select
                                        value={checkInForm.pasien_id}
                                        onChange={(e) =>
                                            setCheckInForm({
                                                ...checkInForm,
                                                pasien_id: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    >
                                        <option value="">
                                            -- Pilih Pasien --
                                        </option>
                                        {pasiens.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_lengkap} (RM:{' '}
                                                {p.nomor_rekam_medis})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Pilih Bed Kosong (Tersedia) *
                                    </label>
                                    <select
                                        value={checkInForm.bed_id}
                                        onChange={(e) =>
                                            setCheckInForm({
                                                ...checkInForm,
                                                bed_id: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    >
                                        <option value="">
                                            -- Pilih Tempat Tidur --
                                        </option>
                                        {beds
                                            .filter(
                                                (b) => b.status === 'tersedia',
                                            )
                                            .map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.nomor_bed} -{' '}
                                                    {b.bangsal?.nama_bangsal ||
                                                        b.ruangan
                                                            ?.nama_ruangan}{' '}
                                                    ({b.kelas} - Rp{' '}
                                                    {Number(
                                                        b.tarif_per_hari,
                                                    ).toLocaleString('id-ID')}
                                                    )
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Dokter DPJP (Penanggung Jawab)
                                    </label>
                                    <select
                                        value={checkInForm.dpjp_id}
                                        onChange={(e) =>
                                            setCheckInForm({
                                                ...checkInForm,
                                                dpjp_id: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    >
                                        <option value="">
                                            -- Pilih DPJP --
                                        </option>
                                        {dokters.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.nama_lengkap} (
                                                {d.spesialisasi || 'Spesialis'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Diagnosa Awal / Alasan Masuk
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={checkInForm.diagnosa_awal}
                                        onChange={(e) =>
                                            setCheckInForm({
                                                ...checkInForm,
                                                diagnosa_awal: e.target.value,
                                            })
                                        }
                                        placeholder="Diagnosa awal admisi pasien..."
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCheckInModal(false)
                                        }
                                        className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-[#0d4f42] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#145e5b]"
                                    >
                                        {isSubmitting
                                            ? 'Memproses...'
                                            : 'Proses Check-In Pasien'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: PINDAH BED / KAMAR */}
                {showPindahModal && selectedAdmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Pindah Bed Pasien
                                </h3>
                                <button
                                    onClick={() => setShowPindahModal(false)}
                                    className="text-slate-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-1 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs">
                                <div className="font-bold text-blue-900">
                                    Pasien:{' '}
                                    {selectedAdmission.pasien.nama_lengkap}
                                </div>
                                <div className="text-blue-700">
                                    Bed Saat Ini:{' '}
                                    {selectedAdmission.bed.nomor_bed} (
                                    {selectedAdmission.bed.kelas})
                                </div>
                            </div>

                            <form
                                onSubmit={handlePindahSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Pilih Bed Tujuan (Tersedia) *
                                    </label>
                                    <select
                                        value={pindahForm.bed_tujuan_id}
                                        onChange={(e) =>
                                            setPindahForm({
                                                ...pindahForm,
                                                bed_tujuan_id: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    >
                                        <option value="">
                                            -- Pilih Bed Tujuan --
                                        </option>
                                        {beds
                                            .filter(
                                                (b) =>
                                                    b.status === 'tersedia' &&
                                                    b.id !==
                                                        selectedAdmission.bed_id,
                                            )
                                            .map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.nomor_bed} -{' '}
                                                    {b.bangsal?.nama_bangsal ||
                                                        b.ruangan
                                                            ?.nama_ruangan}{' '}
                                                    ({b.kelas})
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Alasan Pindah Bed
                                    </label>
                                    <input
                                        type="text"
                                        value={pindahForm.alasan_pindah}
                                        onChange={(e) =>
                                            setPindahForm({
                                                ...pindahForm,
                                                alasan_pindah: e.target.value,
                                            })
                                        }
                                        placeholder="Misal: Permintaan upgrade kelas, rekomendasi medis..."
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPindahModal(false)
                                        }
                                        className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-[#0d4f42] px-4 py-2 text-xs font-semibold text-white hover:bg-[#145e5b]"
                                    >
                                        {isSubmitting
                                            ? 'Memindahkan...'
                                            : 'Konfirmasi Pindah Bed'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: DISCHARGE / PULANG PASIEN */}
                {showDischargeModal && selectedAdmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Proses Discharge (Check-Out) Pasien
                                </h3>
                                <button
                                    onClick={() => setShowDischargeModal(false)}
                                    className="text-slate-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-1 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs">
                                <div className="font-bold text-rose-900">
                                    Pasien:{' '}
                                    {selectedAdmission.pasien.nama_lengkap}
                                </div>
                                <div className="text-rose-700">
                                    Bed: {selectedAdmission.bed.nomor_bed} (Akan
                                    otomatis di-set ke Sterilisasi)
                                </div>
                            </div>

                            <form
                                onSubmit={handleDischargeSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Status Keadaan Pulang *
                                    </label>
                                    <select
                                        value={dischargeForm.status}
                                        onChange={(e) =>
                                            setDischargeForm({
                                                ...dischargeForm,
                                                status: e.target.value as any,
                                            })
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    >
                                        <option value="pulang_sembuh">
                                            Pulang Sembuh / Diizinkan Pulang
                                        </option>
                                        <option value="pulang_paksa">
                                            Pulang Atas Permintaan Sendiri
                                            (PAPS)
                                        </option>
                                        <option value="dirujuk">
                                            Dirujuk ke Rumah Sakit Lain
                                        </option>
                                        <option value="meninggal">
                                            Meninggal Dunia
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Ringkasan Resume Pulang / Catatan
                                        Discharge
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={dischargeForm.ringkasan_pulang}
                                        onChange={(e) =>
                                            setDischargeForm({
                                                ...dischargeForm,
                                                ringkasan_pulang:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="Ringkasan medis saat discharge..."
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDischargeModal(false)
                                        }
                                        className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                    >
                                        {isSubmitting
                                            ? 'Memproses...'
                                            : 'Proses Pulang / Discharge'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 4: TAMBAH / EDIT BED MASTER */}
                {showBedModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {bedForm.id
                                        ? 'Edit Master Bed'
                                        : 'Tambah Tempat Tidur (Bed) Baru'}
                                </h3>
                                <button
                                    onClick={() => setShowBedModal(false)}
                                    className="text-slate-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <form
                                onSubmit={handleBedFormSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Nomor Bed *
                                    </label>
                                    <input
                                        type="text"
                                        value={bedForm.nomor_bed}
                                        onChange={(e) =>
                                            setBedForm({
                                                ...bedForm,
                                                nomor_bed: e.target.value,
                                            })
                                        }
                                        required
                                        placeholder="Contoh: BED-VIP-05"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Bangsal
                                        </label>
                                        <select
                                            value={bedForm.bangsal_id}
                                            onChange={(e) =>
                                                setBedForm({
                                                    ...bedForm,
                                                    bangsal_id: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                        >
                                            <option value="">
                                                -- Pilih Bangsal --
                                            </option>
                                            {bangsals.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.nama_bangsal}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Ruangan
                                        </label>
                                        <select
                                            value={bedForm.ruangan_id}
                                            onChange={(e) =>
                                                setBedForm({
                                                    ...bedForm,
                                                    ruangan_id: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                        >
                                            <option value="">
                                                -- Pilih Ruangan --
                                            </option>
                                            {ruangans.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.nama_ruangan}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Kelas *
                                        </label>
                                        <select
                                            value={bedForm.kelas}
                                            onChange={(e) =>
                                                setBedForm({
                                                    ...bedForm,
                                                    kelas: e.target
                                                        .value as any,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                        >
                                            <option value="VIP">VIP</option>
                                            <option value="Kelas 1">
                                                Kelas 1
                                            </option>
                                            <option value="Kelas 2">
                                                Kelas 2
                                            </option>
                                            <option value="Kelas 3">
                                                Kelas 3
                                            </option>
                                            <option value="ICU">ICU</option>
                                            <option value="HCU">HCU</option>
                                            <option value="Isolasi">
                                                Isolasi
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Tarif Per Hari (Rp) *
                                        </label>
                                        <input
                                            type="number"
                                            value={bedForm.tarif_per_hari}
                                            onChange={(e) =>
                                                setBedForm({
                                                    ...bedForm,
                                                    tarif_per_hari: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            required
                                            min={0}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Status Awal
                                    </label>
                                    <select
                                        value={bedForm.status}
                                        onChange={(e) =>
                                            setBedForm({
                                                ...bedForm,
                                                status: e.target.value as any,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    >
                                        <option value="tersedia">
                                            Tersedia
                                        </option>
                                        <option value="terisi">Terisi</option>
                                        <option value="dibersihkan">
                                            Sterilisasi
                                        </option>
                                        <option value="pemeliharaan">
                                            Pemeliharaan
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Catatan Fasilitas
                                    </label>
                                    <input
                                        type="text"
                                        value={bedForm.catatan}
                                        onChange={(e) =>
                                            setBedForm({
                                                ...bedForm,
                                                catatan: e.target.value,
                                            })
                                        }
                                        placeholder="Fasilitas kamar / catatan..."
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowBedModal(false)}
                                        className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-[#0d4f42] px-4 py-2 text-xs font-semibold text-white hover:bg-[#145e5b]"
                                    >
                                        {isSubmitting
                                            ? 'Menyimpan...'
                                            : 'Simpan Data Bed'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
