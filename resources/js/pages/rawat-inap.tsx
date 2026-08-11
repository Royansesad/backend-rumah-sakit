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
    kelas: 'VIP' | 'Kelas 1' | 'Kelas 2' | 'Kelas 3' | 'ICU' | 'HCU' | 'Isolasi';
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
    status: 'aktif' | 'pulang_sembuh' | 'pulang_paksa' | 'dirujuk' | 'meninggal';
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
    const [activeTab, setActiveTab] = useState<'matrix' | 'admissions' | 'manage_beds'>('matrix');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [kelasFilter, setKelasFilter] = useState<string>('all');
    const [bangsalFilter, setBangsalFilter] = useState<string>('all');

    // Modal States
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showPindahModal, setShowPindahModal] = useState(false);
    const [showDischargeModal, setShowDischargeModal] = useState(false);
    const [showBedModal, setShowBedModal] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState<AdmissionItem | null>(null);

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
        status: 'pulang_sembuh' as 'pulang_sembuh' | 'pulang_paksa' | 'dirujuk' | 'meninggal',
        ringkasan_pulang: '',
    });

    // Bed Master Form Data
    const [bedForm, setBedForm] = useState({
        id: '',
        nomor_bed: '',
        ruangan_id: '',
        bangsal_id: '',
        kelas: 'Kelas 3' as const,
        tarif_per_hari: 200000,
        status: 'tersedia' as const,
        catatan: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    // Filter beds for matrix view
    const filteredBeds = beds.filter((bed) => {
        const matchSearch =
            bed.nomor_bed.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (bed.ruangan?.nama_ruangan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (bed.bangsal?.nama_bangsal || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (bed.active_admission?.pasien?.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchStatus = statusFilter === 'all' || bed.status === statusFilter;
        const matchKelas = kelasFilter === 'all' || bed.kelas === kelasFilter;
        const matchBangsal = bangsalFilter === 'all' || bed.bangsal_id === bangsalFilter;

        return matchSearch && matchStatus && matchKelas && matchBangsal;
    });

    // Filter active admissions table
    const filteredAdmissions = admissions.filter((adm) => {
        const matchSearch =
            adm.nomor_admission.toLowerCase().includes(searchQuery.toLowerCase()) ||
            adm.pasien.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
            adm.pasien.nomor_rekam_medis.toLowerCase().includes(searchQuery.toLowerCase()) ||
            adm.bed.nomor_bed.toLowerCase().includes(searchQuery.toLowerCase());

        const matchStatus = statusFilter === 'all' || adm.status === statusFilter;
        return matchSearch && matchStatus;
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
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(checkInForm),
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify('Pasien berhasil Check-In ke Rawat Inap!', 'success');
                setShowCheckInModal(false);
                router.reload();
            } else {
                showNotify(data.message || 'Gagal mendaftarkan Check-In.', 'error');
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
            const res = await fetch(`/api/v1/rawat-inap/${selectedAdmission.id}/pindah-bed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(pindahForm),
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify('Pasien berhasil dipindahkan ke Bed baru!', 'success');
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
            const res = await fetch(`/api/v1/rawat-inap/${selectedAdmission.id}/check-out`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(dischargeForm),
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify('Pasien berhasil di-Discharge (Check-Out) dari Rawat Inap!', 'success');
                setShowDischargeModal(false);
                router.reload();
            } else {
                showNotify(data.message || 'Gagal memproses check-out.', 'error');
            }
        } catch (err: any) {
            showNotify('Terjadi kesalahan koneksi server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleBedStatus = async (bedId: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'dibersihkan' ? 'tersedia' : 'dibersihkan';
        try {
            const res = await fetch(`/api/v1/beds/${bedId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ status: nextStatus, catatan: `Status diubah ke ${nextStatus} oleh petugas` }),
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify(`Status Bed berhasil diperbarui ke ${nextStatus.toUpperCase()}`, 'success');
                router.reload();
            } else {
                showNotify(data.message || 'Gagal memperbarui status bed.', 'error');
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
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(bedForm),
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                showNotify(isEdit ? 'Data Bed berhasil diperbarui!' : 'Bed baru berhasil ditambahkan!', 'success');
                setShowBedModal(false);
                router.reload();
            } else {
                showNotify(data.message || 'Gagal menyimpan data bed.', 'error');
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
                return <span className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-full">● Tersedia</span>;
            case 'terisi':
                return <span className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-100 rounded-full">● Terisi Pasien</span>;
            case 'dibersihkan':
                return <span className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">● Sterilisasi</span>;
            case 'pemeliharaan':
                return <span className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-200 rounded-full">● Pemeliharaan</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">{status}</span>;
        }
    };

    return (
        <Layout user={user} role={role} title="Manajemen Bed & Rawat Inap">
            <div className="space-y-6 pb-12 bg-slate-50 min-h-screen p-2 sm:p-4">
                {/* Header & Title - Clean Light Mode Sentosa Medika Design */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0d4f42] tracking-tight">
                                Sistem Manajemen Bed & Rawat Inap
                            </h1>
                            <span className="bg-[#e4f6f2] text-[#0d4f42] text-xs font-bold px-3 py-1 rounded-full border border-[#145e5b]/20">
                                SIMRS Bed Management
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                            Pemantauan ketersediaan tempat tidur (BOR), admisi rawat inap, mutasi bed, dan proses discharge pasien.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                setCheckInForm({
                                    pasien_id: '',
                                    bed_id: '',
                                    dpjp_id: '',
                                    tanggal_masuk: new Date().toISOString().slice(0, 16),
                                    tanggal_keluar_rencana: '',
                                    alasan_masuk: '',
                                    diagnosa_awal: '',
                                });
                                setShowCheckInModal(true);
                            }}
                            className="inline-flex items-center gap-2 bg-[#0d4f42] hover:bg-[#145e5b] text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-[#0d4f42]/20"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
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
                            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium px-4 py-2.5 rounded-xl text-sm transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Bed Master
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {notification && (
                    <div
                        className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm border ${
                            notification.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                    >
                        <span>{notification.message}</span>
                        <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    </div>
                )}

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-[#0d4f42]"></div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BOR (Occupancy)</span>
                        <div className="text-2xl font-bold text-slate-900 mt-2">{statistik.bor_percentage}%</div>
                        <p className="text-xs text-slate-400 mt-1">Target Ideal: 60-85%</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bed</span>
                        <div className="text-2xl font-bold text-slate-900 mt-2">{statistik.total_bed}</div>
                        <p className="text-xs text-slate-400 mt-1">Kapasitas RS</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed Tersedia</span>
                        <div className="text-2xl font-bold text-emerald-600 mt-2">{statistik.tersedia}</div>
                        <p className="text-xs text-emerald-600 mt-1">Siap Ditempati</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed Terisi</span>
                        <div className="text-2xl font-bold text-rose-600 mt-2">{statistik.terisi}</div>
                        <p className="text-xs text-rose-600 mt-1">Pasien Rawat Inap</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sterilisasi</span>
                        <div className="text-2xl font-bold text-amber-600 mt-2">{statistik.dibersihkan}</div>
                        <p className="text-xs text-amber-600 mt-1">Proses Pembersihan</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-slate-400"></div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemeliharaan</span>
                        <div className="text-2xl font-bold text-slate-700 mt-2">{statistik.pemeliharaan}</div>
                        <p className="text-xs text-slate-400 mt-1">Perbaikan Non-Aktif</p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-2xl pt-2">
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`py-3.5 px-5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'matrix'
                                ? 'border-[#0d4f42] text-[#0d4f42]'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Bed Occupancy Matrix (Visual Grid)
                    </button>

                    <button
                        onClick={() => setActiveTab('admissions')}
                        className={`py-3.5 px-5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'admissions'
                                ? 'border-[#0d4f42] text-[#0d4f42]'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Daftar Pasien Rawat Inap ({admissions.filter((a) => a.status === 'aktif').length})
                    </button>

                    <button
                        onClick={() => setActiveTab('manage_beds')}
                        className={`py-3.5 px-5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'manage_beds'
                                ? 'border-[#0d4f42] text-[#0d4f42]'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Kelola Master Bed ({beds.length})
                    </button>
                </div>

                {/* Filters Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        <div className="relative min-w-[240px]">
                            <input
                                type="text"
                                placeholder="Cari Bed, Pasien, atau Bangsal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d4f42]"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:outline-none"
                        >
                            <option value="all">Semua Status</option>
                            <option value="tersedia">Tersedia</option>
                            <option value="terisi">Terisi Pasien</option>
                            <option value="dibersihkan">Sterilisasi</option>
                            <option value="pemeliharaan">Pemeliharaan</option>
                        </select>

                        <select
                            value={kelasFilter}
                            onChange={(e) => setKelasFilter(e.target.value)}
                            className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:outline-none"
                        >
                            <option value="all">Semua Kelas</option>
                            <option value="VIP">VIP</option>
                            <option value="Kelas 1">Kelas 1</option>
                            <option value="Kelas 2">Kelas 2</option>
                            <option value="Kelas 3">Kelas 3</option>
                            <option value="ICU">ICU</option>
                            <option value="HCU">HCU</option>
                        </select>

                        <select
                            value={bangsalFilter}
                            onChange={(e) => setBangsalFilter(e.target.value)}
                            className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:outline-none"
                        >
                            <option value="all">Semua Bangsal</option>
                            {bangsals.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.nama_bangsal}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                        Menampilkan {filteredBeds.length} item tempat tidur
                    </div>
                </div>

                {/* TAB 1: VISUAL MATRIX BOARD */}
                {activeTab === 'matrix' && (
                    <div className="space-y-6">
                        {filteredBeds.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
                                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="text-slate-500 font-medium">Tidak ada bed yang sesuai dengan filter pencarian.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredBeds.map((bed) => {
                                    const isOccupied = bed.status === 'terisi';
                                    const isCleaning = bed.status === 'dibersihkan';
                                    const isMaintenance = bed.status === 'pemeliharaan';
                                    const isAvailable = bed.status === 'tersedia';

                                    let cardBg = 'bg-white border-slate-200';
                                    if (isOccupied) cardBg = 'bg-rose-50/70 border-rose-200';
                                    if (isCleaning) cardBg = 'bg-amber-50/70 border-amber-200';
                                    if (isMaintenance) cardBg = 'bg-slate-100 border-slate-300';

                                    return (
                                        <div key={bed.id} className={`p-4 rounded-2xl border ${cardBg} shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative group`}>
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-base">{bed.nomor_bed}</h3>
                                                        <p className="text-xs text-slate-500">
                                                            {bed.bangsal?.nama_bangsal || bed.ruangan?.nama_ruangan || 'Tanpa Bangsal'}
                                                        </p>
                                                    </div>
                                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                                        {bed.kelas}
                                                    </span>
                                                </div>

                                                <div className="my-2">{getStatusBadge(bed.status)}</div>

                                                {/* Patient info if occupied */}
                                                {isOccupied && bed.active_admission && (
                                                    <div className="mt-3 p-2.5 rounded-xl bg-white border border-rose-100 text-xs space-y-1 shadow-2xs">
                                                        <div className="font-semibold text-slate-900 truncate">
                                                            {bed.active_admission.pasien?.nama_lengkap}
                                                        </div>
                                                        <div className="text-slate-500">RM: {bed.active_admission.pasien?.nomor_rekam_medis}</div>
                                                        {bed.active_admission.dpjp && (
                                                            <div className="text-[#0d4f42] font-medium">DPJP: {bed.active_admission.dpjp.nama_lengkap}</div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="text-xs text-slate-400 mt-2">
                                                    Rp {Number(bed.tarif_per_hari).toLocaleString('id-ID')} / hari
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5 justify-end">
                                                {isAvailable && (
                                                    <button
                                                        onClick={() => openCheckInForBed(bed.id)}
                                                        className="w-full py-1.5 px-3 bg-[#0d4f42] hover:bg-[#145e5b] text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                        </svg>
                                                        Check-In Bed Ini
                                                    </button>
                                                )}

                                                {isCleaning && (
                                                    <button
                                                        onClick={() => handleToggleBedStatus(bed.id, 'dibersihkan')}
                                                        className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                                                    >
                                                        ✓ Set Siap (Tersedia)
                                                    </button>
                                                )}

                                                {isOccupied && bed.active_admission && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                const adm = admissions.find((a) => a.id === bed.active_admission?.id);
                                                                if (adm) {
                                                                    setSelectedAdmission(adm);
                                                                    setShowPindahModal(true);
                                                                }
                                                            }}
                                                            className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
                                                        >
                                                            Pindah Bed
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                const adm = admissions.find((a) => a.id === bed.active_admission?.id);
                                                                if (adm) {
                                                                    setSelectedAdmission(adm);
                                                                    setShowDischargeModal(true);
                                                                }
                                                            }}
                                                            className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium border border-rose-200"
                                                        >
                                                            Discharge
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: DAFTAR ADMISI PASIEN RAWAT INAP */}
                {activeTab === 'admissions' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">No. Admisi</th>
                                        <th className="px-6 py-4">Pasien</th>
                                        <th className="px-6 py-4">Bed & Ruangan</th>
                                        <th className="px-6 py-4">DPJP</th>
                                        <th className="px-6 py-4">Tgl Masuk</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAdmissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                Belum ada data pendaftaran admisi rawat inap.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdmissions.map((adm) => (
                                            <tr key={adm.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900">
                                                    {adm.nomor_admission}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">{adm.pasien.nama_lengkap}</div>
                                                    <div className="text-xs text-slate-400">RM: {adm.pasien.nomor_rekam_medis}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-800">{adm.bed?.nomor_bed || '-'}</div>
                                                    <div className="text-xs text-slate-400">{adm.bangsal?.nama_bangsal || adm.ruangan?.nama_ruangan || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    {adm.dpjp?.nama_lengkap || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {new Date(adm.tanggal_masuk).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {adm.status === 'aktif' ? (
                                                        <span className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-full">
                                                            ● Rawat Inap Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
                                                            {adm.status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    {adm.status === 'aktif' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAdmission(adm);
                                                                    setShowPindahModal(true);
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                                                            >
                                                                Pindah Bed
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAdmission(adm);
                                                                    setShowDischargeModal(true);
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                                                            >
                                                                Check-Out
                                                            </button>
                                                        </>
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

                {/* TAB 3: KELOLA MASTER BED */}
                {activeTab === 'manage_beds' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">Daftar Tempat Tidur (Master Bed)</h2>
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
                                className="px-4 py-2 bg-[#0d4f42] hover:bg-[#145e5b] text-white rounded-xl text-xs font-semibold transition-all"
                            >
                                + Tambah Bed Baru
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Nomor Bed</th>
                                        <th className="px-6 py-4">Bangsal / Ruangan</th>
                                        <th className="px-6 py-4">Kelas</th>
                                        <th className="px-6 py-4">Tarif / Hari</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {beds.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-bold text-slate-900">{b.nomor_bed}</td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {b.bangsal?.nama_bangsal || b.ruangan?.nama_ruangan || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                                                    {b.kelas}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                Rp {Number(b.tarif_per_hari).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(b.status)}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setBedForm({
                                                            id: b.id,
                                                            nomor_bed: b.nomor_bed,
                                                            ruangan_id: b.ruangan_id || '',
                                                            bangsal_id: b.bangsal_id || '',
                                                            kelas: b.kelas,
                                                            tarif_per_hari: Number(b.tarif_per_hari),
                                                            status: b.status,
                                                            catatan: b.catatan || '',
                                                        });
                                                        setShowBedModal(true);
                                                    }}
                                                    className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MODAL 1: CHECK-IN RAWAT INAP */}
                {showCheckInModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">Form Check-In Rawat Inap Pasien</h3>
                                <button onClick={() => setShowCheckInModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <form onSubmit={handleCheckInSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Pasien *</label>
                                    <select
                                        value={checkInForm.pasien_id}
                                        onChange={(e) => setCheckInForm({ ...checkInForm, pasien_id: e.target.value })}
                                        required
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    >
                                        <option value="">-- Pilih Pasien --</option>
                                        {pasiens.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_lengkap} (RM: {p.nomor_rekam_medis})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Bed Kosong (Tersedia) *</label>
                                    <select
                                        value={checkInForm.bed_id}
                                        onChange={(e) => setCheckInForm({ ...checkInForm, bed_id: e.target.value })}
                                        required
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    >
                                        <option value="">-- Pilih Tempat Tidur --</option>
                                        {beds
                                            .filter((b) => b.status === 'tersedia')
                                            .map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.nomor_bed} - {b.bangsal?.nama_bangsal || b.ruangan?.nama_ruangan} ({b.kelas} - Rp {Number(b.tarif_per_hari).toLocaleString('id-ID')})
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Dokter DPJP (Penanggung Jawab)</label>
                                    <select
                                        value={checkInForm.dpjp_id}
                                        onChange={(e) => setCheckInForm({ ...checkInForm, dpjp_id: e.target.value })}
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    >
                                        <option value="">-- Pilih DPJP --</option>
                                        {dokters.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.nama_lengkap} ({d.spesialisasi || 'Spesialis'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosa Awal / Alasan Masuk</label>
                                    <textarea
                                        rows={2}
                                        value={checkInForm.diagnosa_awal}
                                        onChange={(e) => setCheckInForm({ ...checkInForm, diagnosa_awal: e.target.value })}
                                        placeholder="Diagnosa awal admisi pasien..."
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowCheckInModal(false)}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-xs font-semibold text-white bg-[#0d4f42] hover:bg-[#145e5b] rounded-xl transition-all shadow-md"
                                    >
                                        {isSubmitting ? 'Memproses...' : 'Proses Check-In Pasien'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: PINDAH BED / KAMAR */}
                {showPindahModal && selectedAdmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">Pindah Bed Pasien</h3>
                                <button onClick={() => setShowPindahModal(false)} className="text-slate-400">✕</button>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs space-y-1">
                                <div className="font-bold text-blue-900">Pasien: {selectedAdmission.pasien.nama_lengkap}</div>
                                <div className="text-blue-700">Bed Saat Ini: {selectedAdmission.bed.nomor_bed} ({selectedAdmission.bed.kelas})</div>
                            </div>

                            <form onSubmit={handlePindahSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Bed Tujuan (Tersedia) *</label>
                                    <select
                                        value={pindahForm.bed_tujuan_id}
                                        onChange={(e) => setPindahForm({ ...pindahForm, bed_tujuan_id: e.target.value })}
                                        required
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    >
                                        <option value="">-- Pilih Bed Tujuan --</option>
                                        {beds
                                            .filter((b) => b.status === 'tersedia' && b.id !== selectedAdmission.bed_id)
                                            .map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.nomor_bed} - {b.bangsal?.nama_bangsal || b.ruangan?.nama_ruangan} ({b.kelas})
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Pindah Bed</label>
                                    <input
                                        type="text"
                                        value={pindahForm.alasan_pindah}
                                        onChange={(e) => setPindahForm({ ...pindahForm, alasan_pindah: e.target.value })}
                                        placeholder="Misal: Permintaan upgrade kelas, rekomendasi medis..."
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowPindahModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl">Batal</button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-semibold text-white bg-[#0d4f42] hover:bg-[#145e5b] rounded-xl">
                                        {isSubmitting ? 'Memindahkan...' : 'Konfirmasi Pindah Bed'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: DISCHARGE / PULANG PASIEN */}
                {showDischargeModal && selectedAdmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">Proses Discharge (Check-Out) Pasien</h3>
                                <button onClick={() => setShowDischargeModal(false)} className="text-slate-400">✕</button>
                            </div>

                            <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-xs space-y-1">
                                <div className="font-bold text-rose-900">Pasien: {selectedAdmission.pasien.nama_lengkap}</div>
                                <div className="text-rose-700">Bed: {selectedAdmission.bed.nomor_bed} (Akan otomatis di-set ke Sterilisasi)</div>
                            </div>

                            <form onSubmit={handleDischargeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Keadaan Pulang *</label>
                                    <select
                                        value={dischargeForm.status}
                                        onChange={(e) => setDischargeForm({ ...dischargeForm, status: e.target.value as any })}
                                        required
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    >
                                        <option value="pulang_sembuh">Pulang Sembuh / Diizinkan Pulang</option>
                                        <option value="pulang_paksa">Pulang Atas Permintaan Sendiri (PAPS)</option>
                                        <option value="dirujuk">Dirujuk ke Rumah Sakit Lain</option>
                                        <option value="meninggal">Meninggal Dunia</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan Resume Pulang / Catatan Discharge</label>
                                    <textarea
                                        rows={3}
                                        value={dischargeForm.ringkasan_pulang}
                                        onChange={(e) => setDischargeForm({ ...dischargeForm, ringkasan_pulang: e.target.value })}
                                        placeholder="Ringkasan medis saat discharge..."
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowDischargeModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl">Batal</button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl">
                                        {isSubmitting ? 'Memproses...' : 'Proses Pulang / Discharge'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 4: TAMBAH / EDIT BED MASTER */}
                {showBedModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {bedForm.id ? 'Edit Master Bed' : 'Tambah Tempat Tidur (Bed) Baru'}
                                </h3>
                                <button onClick={() => setShowBedModal(false)} className="text-slate-400">✕</button>
                            </div>

                            <form onSubmit={handleBedFormSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Bed *</label>
                                    <input
                                        type="text"
                                        value={bedForm.nomor_bed}
                                        onChange={(e) => setBedForm({ ...bedForm, nomor_bed: e.target.value })}
                                        required
                                        placeholder="Contoh: BED-VIP-05"
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Bangsal</label>
                                        <select
                                            value={bedForm.bangsal_id}
                                            onChange={(e) => setBedForm({ ...bedForm, bangsal_id: e.target.value })}
                                            className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                        >
                                            <option value="">-- Pilih Bangsal --</option>
                                            {bangsals.map((b) => (
                                                <option key={b.id} value={b.id}>{b.nama_bangsal}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Ruangan</label>
                                        <select
                                            value={bedForm.ruangan_id}
                                            onChange={(e) => setBedForm({ ...bedForm, ruangan_id: e.target.value })}
                                            className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                        >
                                            <option value="">-- Pilih Ruangan --</option>
                                            {ruangans.map((r) => (
                                                <option key={r.id} value={r.id}>{r.nama_ruangan}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
                                        <select
                                            value={bedForm.kelas}
                                            onChange={(e) => setBedForm({ ...bedForm, kelas: e.target.value as any })}
                                            className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                        >
                                            <option value="VIP">VIP</option>
                                            <option value="Kelas 1">Kelas 1</option>
                                            <option value="Kelas 2">Kelas 2</option>
                                            <option value="Kelas 3">Kelas 3</option>
                                            <option value="ICU">ICU</option>
                                            <option value="HCU">HCU</option>
                                            <option value="Isolasi">Isolasi</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Tarif Per Hari (Rp) *</label>
                                        <input
                                            type="number"
                                            value={bedForm.tarif_per_hari}
                                            onChange={(e) => setBedForm({ ...bedForm, tarif_per_hari: Number(e.target.value) })}
                                            required
                                            min={0}
                                            className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Awal</label>
                                    <select
                                        value={bedForm.status}
                                        onChange={(e) => setBedForm({ ...bedForm, status: e.target.value as any })}
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    >
                                        <option value="tersedia">Tersedia</option>
                                        <option value="terisi">Terisi</option>
                                        <option value="dibersihkan">Sterilisasi</option>
                                        <option value="pemeliharaan">Pemeliharaan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Fasilitas</label>
                                    <input
                                        type="text"
                                        value={bedForm.catatan}
                                        onChange={(e) => setBedForm({ ...bedForm, catatan: e.target.value })}
                                        placeholder="Fasilitas kamar / catatan..."
                                        className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowBedModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl">Batal</button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-semibold text-white bg-[#0d4f42] hover:bg-[#145e5b] rounded-xl">
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan Data Bed'}
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
