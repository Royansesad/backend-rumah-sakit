import { Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { EditPatientModal } from '../../components/edit-patient-modal';
import { Layout } from '../../components/layout';
import { PatientDetailModal } from '../../components/patient-detail-modal';
import { ToastContainer, type ToastMessage } from '../../components/toast';
import type { Role } from '../../types/simrs';

interface PasienProps {
    user: any;
    role: Role;
    patients: any;
    totalCount?: number;
    filters?: { search?: string; asuransi?: string; tanggal?: string };
}

export default function PasienIndex({
    user,
    role = 'admin',
    patients = [],
    totalCount = 0,
    filters = {},
}: PasienProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [asuransiFilter, setAsuransiFilter] = useState(filters.asuransi ?? '');
    const [tanggalFilter, setTanggalFilter] = useState(filters.tanggal ?? '');

    // Toast Notifications State (Gambar 3)
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Detail Modal State (Gambar 2)
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Edit Modal State
    const [editPatient, setEditPatient] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const addToast = (toast: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastMessage = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Extract paginated database list
    const patientData = Array.isArray(patients)
        ? patients
        : ((patients as any)?.data ?? []);

    const totalDataCount = (patients as any)?.total ?? totalCount ?? patientData.length;
    const fromCount = (patients as any)?.from ?? (patientData.length > 0 ? 1 : 0);
    const toCount = (patients as any)?.to ?? patientData.length;
    const paginationLinks = (patients as any)?.links ?? [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/pasien',
            {
                search: search.trim() || undefined,
                asuransi: asuransiFilter || undefined,
                tanggal: tanggalFilter || undefined,
            },
            { preserveState: true, replace: true },
        );
        addToast({
            type: 'system',
            title: 'Sistem',
            description: 'Sistem sedang melakukan sinkronisasi data.',
        });
    };

    const handleReset = () => {
        setSearch('');
        setAsuransiFilter('');
        setTanggalFilter('');
        router.get('/pasien', {}, { preserveState: true, replace: true });
        addToast({
            type: 'info',
            title: 'Informasi',
            description: 'Filter pencarian telah direset.',
        });
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams();
        if (search.trim()) params.append('search', search.trim());
        if (asuransiFilter) params.append('asuransi', asuransiFilter);
        if (tanggalFilter) params.append('tanggal', tanggalFilter);

        const exportUrl = `/pasien/export?${params.toString()}`;
        window.location.href = exportUrl;

        addToast({
            type: 'success',
            title: 'Berhasil',
            description: 'Ekspor data ke Excel berhasil diunduh.',
        });
    };

    const handleOpenDetail = (p: any) => {
        setSelectedPatient(p);
        setIsDetailModalOpen(true);
    };

    const handleOpenEdit = (p: any) => {
        setIsDetailModalOpen(false);
        setEditPatient(p);
        setIsEditModalOpen(true);
    };

    const handleDeletePatient = (p: any) => {
        setIsDetailModalOpen(false);
        if (p.id) {
            router.delete(`/pasien/${p.id}`, {
                onSuccess: () => {
                    addToast({
                        type: 'success',
                        title: 'Berhasil',
                        description: 'Pasien berhasil dihapus.',
                    });
                },
                onError: () => {
                    addToast({
                        type: 'error',
                        title: 'Gagal',
                        description: 'Gagal menghapus data pasien.',
                    });
                },
            });
        } else {
            addToast({
                type: 'success',
                title: 'Berhasil',
                description: 'Pasien berhasil dihapus.',
            });
        }
    };

    const handleEditSuccess = (msg?: string) => {
        addToast({
            type: 'info',
            title: 'Informasi',
            description: msg || 'Data pasien berhasil diperbarui.',
        });
    };

    const getAsuransiBadge = (penjamin: string | null) => {
        const p = (penjamin || '').toLowerCase();
        if (p === 'bpjs') {
            return (
                <span className="inline-flex items-center rounded-md bg-[#dcebf7] px-2.5 py-0.5 text-[11px] font-semibold text-[#2b6cb0]">
                    BPJS
                </span>
            );
        }
        if (p === 'asuransi' || p.includes('swasta')) {
            return (
                <span className="inline-flex items-center rounded-md bg-[#d4f2ee] px-2.5 py-0.5 text-[11px] font-semibold text-[#145e5b]">
                    Asuransi Swasta
                </span>
            );
        }
        return (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                Umum
            </span>
        );
    };

    const getStatusBadge = (status: string | null) => {
        const s = (status || 'aktif').toLowerCase();
        if (s === 'aktif') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#276749]">
                    <span className="h-2 w-2 rounded-full bg-[#276749]"></span>
                    Aktif
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                Tidak Aktif
            </span>
        );
    };

    return (
        <Layout user={user} role={role}>
            {/* Toast Container (Gambar 3) */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            {/* Pop Up Detail Pasien Modal (Gambar 2) */}
            <PatientDetailModal
                isOpen={isDetailModalOpen}
                patient={selectedPatient}
                onClose={() => setIsDetailModalOpen(false)}
                onDelete={handleDeletePatient}
                onEdit={handleOpenEdit}
                onViewHistory={(p) => {
                    addToast({
                        type: 'info',
                        title: 'Informasi',
                        description: `Membuka riwayat kunjungan ${p.nama_lengkap || 'pasien'}...`,
                    });
                }}
            />

            {/* Edit Patient Modal */}
            <EditPatientModal
                isOpen={isEditModalOpen}
                patient={editPatient}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleEditSuccess}
            />

            {/* Top Breadcrumb */}
            <nav className="flex text-xs font-medium text-gray-500 mb-2">
                <span>Dashboard</span>
                <span className="mx-2">&gt;</span>
                <span className="text-gray-800 font-semibold">Manajemen Pasien</span>
            </nav>

            {/* Page Title & Action Bar (Gambar 1) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#145e5b]">
                        Manajemen Pasien
                    </h1>
                    <p className="mt-1 text-xs text-gray-500">
                        Total {totalDataCount.toLocaleString('id-ID')} pasien terdaftar
                    </p>
                </div>

                <Link
                    href="/pendaftaran-pasien"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#145e5b] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0f4947]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Daftarkan Pasien Baru
                </Link>
            </div>

            {/* Filter Section Card (Gambar 1) */}
            <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs">
                <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
                    {/* Pencarian Input */}
                    <div className="flex-1 min-w-[240px]">
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Pencarian
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari nama pasien, NIK, atau nomor RM ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#145e5b] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Status Asuransi Dropdown */}
                    <div className="w-full sm:w-44">
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Status Asuransi
                        </label>
                        <select
                            value={asuransiFilter}
                            onChange={(e) => setAsuransiFilter(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="bpjs">BPJS</option>
                            <option value="asuransi">Asuransi Swasta</option>
                            <option value="umum">Umum</option>
                        </select>
                    </div>

                    {/* Tanggal Daftar Rentang */}
                    <div className="w-full sm:w-48">
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Tanggal Daftar (Rentang)
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Pilih tanggal"
                                value={tanggalFilter}
                                onChange={(e) => setTanggalFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#145e5b] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Filter Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 sm:pt-0">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-[#72d6c9] px-4 py-2 text-xs font-semibold text-teal-950 hover:bg-[#5ec4b7] transition shadow-2xs"
                        >
                            Terapkan Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#145e5b] bg-white px-4 py-2 text-xs font-semibold text-[#145e5b] hover:bg-[#f0faf7] transition cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Ekspor ke Excel
                        </button>
                    </div>
                </form>
            </div>

            {/* Data Table Section (Gambar 1) */}
            <div className="overflow-x-auto rounded-xl border border-gray-200/80 bg-white shadow-2xs">
                <table className="w-full min-w-[800px] text-left text-xs">
                    <thead className="border-b border-gray-200 bg-[#fafcfc] font-bold text-gray-700">
                        <tr>
                            <th className="p-4">No. RM</th>
                            <th className="p-4">Nama Pasien</th>
                            <th className="p-4">NIK</th>
                            <th className="p-4">Asuransi</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {patientData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    Belum ada data pasien terdaftar di database.
                                </td>
                            </tr>
                        ) : (
                            patientData.map((p: any, idx: number) => (
                                <tr key={p.id || idx} className="hover:bg-[#f7fcfb] transition-colors">
                                    <td className="p-4 font-mono font-bold text-gray-900">
                                        {p.nomor_rekam_medis || '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900 text-xs">
                                            {p.nama_lengkap}
                                        </div>
                                        <div className="text-[11px] text-gray-500 mt-0.5">
                                            {p.alamat || '-'}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-gray-700">
                                        {p.nik || '-'}
                                    </td>
                                    <td className="p-4">
                                        {getAsuransiBadge(p.penjamin)}
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(p.status_aktif)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* Eye / View Detail Icon */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDetail(p)}
                                                className="rounded-md p-1.5 text-gray-500 hover:bg-[#e4f6f2] hover:text-[#145e5b] transition"
                                                title="Detail Pasien"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            {/* Edit Icon */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(p)}
                                                className="rounded-md p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                                                title="Edit Pasien"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            {/* Delete Icon */}
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePatient(p)}
                                                className="rounded-md p-1.5 text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                                title="Hapus Pasien"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Table Footer / Pagination (Gambar 1) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-600">
                    <div>
                        Menampilkan {fromCount} - {toCount} dari {totalDataCount.toLocaleString('id-ID')} data
                    </div>

                    <div className="flex items-center gap-1">
                        {paginationLinks.length > 0 ? (
                            paginationLinks.map((link: any, lIdx: number) => {
                                const label = link.label
                                    .replace('&laquo; Previous', '<')
                                    .replace('Next &raquo;', '>');

                                if (!link.url) {
                                    return (
                                        <span
                                            key={lIdx}
                                            className="rounded-md px-2.5 py-1 text-gray-400 opacity-50"
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                }

                                return (
                                    <Link
                                        key={lIdx}
                                        href={link.url}
                                        preserveState
                                        replace
                                        className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                                            link.active
                                                ? 'bg-[#145e5b] text-white shadow-2xs'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })
                        ) : (
                            <>
                                <span className="rounded-md px-2.5 py-1 text-gray-400">&lt;</span>
                                <span className="rounded-md bg-[#145e5b] px-3 py-1 font-bold text-white shadow-2xs">1</span>
                                <span className="rounded-md px-2.5 py-1 text-gray-400">&gt;</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
