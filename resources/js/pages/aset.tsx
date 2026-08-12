import { router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';

interface Asset {
    id: string;
    kode_aset: string;
    nama_aset: string;
    asset_category_id: string | null;
    merk: string | null;
    model: string | null;
    nomor_seri: string | null;
    tanggal_perolehan: string | null;
    nilai_perolehan: number;
    umur_ekonomis_tahun: number;
    nilai_residu: number;
    ruangan_id: string | null;
    lokasi: string | null;
    status: 'aktif' | 'rusak' | 'maintenance' | 'dipinjam' | 'dihapuskan';
    nilai_buku: number;
    nilai_penyusutan: number;
    penanggung_jawab: string | null;
    supplier_id: string | null;
    garansi_sampai: string | null;
    deskripsi: string | null;
    is_aktif: boolean;
    category?: { id: string; nama_kategori: string } | null;
    ruangan?: { id: string; nama_ruangan: string } | null;
    supplier?: { id: string; nama_supplier: string } | null;
}

interface Maintenance {
    id: string;
    tanggal: string;
    jenis: string;
    biaya: number;
    vendor: string | null;
    keterangan: string | null;
    status: string;
    operator_role: string | null;
}

interface Loan {
    id: string;
    unit_peminjam: string;
    penanggung_jawab: string | null;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    keterangan: string | null;
    status: string;
    operator_role: string | null;
}

interface RefOption {
    id: string;
    nama_kategori?: string;
    nama_ruangan?: string;
    nama_supplier?: string;
}

interface AsetProps {
    user: any;
    role: Role;
    assets: Asset[];
    kategori: RefOption[];
    ruangan: RefOption[];
    supplier: RefOption[];
    kpi: {
        total_aset: number;
        nilai_perolehan: number;
        nilai_buku: number;
        rusak: number;
        maintenance: number;
        dipinjam: number;
    };
    filters: { search: string; kategori: string; status: string };
}

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

async function apiCall(url: string, method: string, body?: any) {
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
    });

    return res.json();
}

const formatRupiah = (val: number) =>
    'Rp ' + (val || 0).toLocaleString('id-ID');

const emptyForm = () => ({
    kode_aset: '',
    nama_aset: '',
    asset_category_id: '',
    merk: '',
    model: '',
    nomor_seri: '',
    tanggal_perolehan: '',
    nilai_perolehan: 0,
    umur_ekonomis_tahun: 5,
    nilai_residu: 0,
    ruangan_id: '',
    lokasi: '',
    status: 'aktif',
    penanggung_jawab: '',
    supplier_id: '',
    garansi_sampai: '',
    deskripsi: '',
});

const emptyMaintenance = () => ({
    tanggal: new Date().toISOString().slice(0, 10),
    jenis: 'rutin',
    biaya: 0,
    vendor: '',
    keterangan: '',
});

const emptyLoan = () => ({
    unit_peminjam: '',
    penanggung_jawab: '',
    tanggal_pinjam: new Date().toISOString().slice(0, 10),
    tanggal_kembali: '',
    keterangan: '',
});

export default function Aset({
    user,
    role = 'admin',
    assets,
    kategori,
    ruangan,
    supplier,
    kpi,
    filters,
}: AsetProps) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);
    const [detailAsset, setDetailAsset] = useState<Asset | null>(null);
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [showMaintenance, setShowMaintenance] = useState(false);
    const [maintenanceForm, setMaintenanceForm] = useState(emptyMaintenance());
    const [isMaintenanceSaving, setIsMaintenanceSaving] = useState(false);
    const [showPinjam, setShowPinjam] = useState(false);
    const [loanForm, setLoanForm] = useState(emptyLoan());
    const [isLoanSaving, setIsLoanSaving] = useState(false);

    const notify = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const applyFilter = (
        overrides: Partial<{
            search: string;
            status: string;
            kategori: string;
        }>,
    ) => {
        const params: Record<string, string> = {
            search: overrides.search ?? search,
            status: overrides.status ?? status,
            kategori: overrides.kategori ?? kategoriFilter,
        };
        const clean = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v),
        );
        router.get('/aset', clean, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openCreate = () => {
        setEditId(null);
        setForm(emptyForm());
        setShowForm(true);
    };

    const openEdit = (asset: Asset) => {
        setEditId(asset.id);
        setForm({
            kode_aset: asset.kode_aset,
            nama_aset: asset.nama_aset,
            asset_category_id: asset.asset_category_id || '',
            merk: asset.merk || '',
            model: asset.model || '',
            nomor_seri: asset.nomor_seri || '',
            tanggal_perolehan: asset.tanggal_perolehan || '',
            nilai_perolehan: asset.nilai_perolehan,
            umur_ekonomis_tahun: asset.umur_ekonomis_tahun,
            nilai_residu: asset.nilai_residu,
            ruangan_id: asset.ruangan_id || '',
            lokasi: asset.lokasi || '',
            status: asset.status,
            penanggung_jawab: asset.penanggung_jawab || '',
            supplier_id: asset.supplier_id || '',
            garansi_sampai: asset.garansi_sampai || '',
            deskripsi: asset.deskripsi || '',
        });
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editId ? `/api/v1/aset/${editId}` : '/api/v1/aset';
            const method = editId ? 'PUT' : 'POST';
            const res = await apiCall(url, method, form);

            if (res.status === 'success') {
                notify(res.message);
                setShowForm(false);
                router.reload();
            } else {
                notify(res.message || 'Gagal menyimpan aset.', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const openDetail = async (asset: Asset) => {
        setDetailAsset(asset);
        const res = await apiCall(`/api/v1/aset/${asset.id}`, 'GET');

        if (res.status === 'success') {
            setDetailAsset(res.data.asset);
            setMaintenances(res.data.asset.maintenances || []);
            setLoans(res.data.asset.loans || []);
        } else {
            setMaintenances([]);
            setLoans([]);
        }
    };

    const openMaintenance = (asset: Asset) => {
        setDetailAsset(asset);
        setMaintenanceForm(emptyMaintenance());
        setShowMaintenance(true);
    };

    const handleMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!detailAsset) {
            return;
        }

        setIsMaintenanceSaving(true);

        try {
            const res = await apiCall(
                `/api/v1/aset/${detailAsset.id}/maintenance`,
                'POST',
                maintenanceForm,
            );

            if (res.status === 'success') {
                notify(res.message);
                setShowMaintenance(false);
                router.reload();
            } else {
                notify(res.message || 'Gagal mencatat pemeliharaan.', 'error');
            }
        } finally {
            setIsMaintenanceSaving(false);
        }
    };

    const handleMaintenanceSelesai = async (maint: Maintenance) => {
        if (
            !window.confirm(
                'Tandai pemeliharaan selesai? Status aset akan kembali aktif.',
            )
        ) {
            return;
        }

        const res = await apiCall(
            `/api/v1/aset/maintenance/${maint.id}/selesai`,
            'PATCH',
        );
        notify(res.message, res.status === 'success' ? 'success' : 'error');

        if (res.status === 'success') {
            setShowMaintenance(false);

            if (detailAsset) {
                openDetail(detailAsset);
            }

            router.reload();
        }
    };

    const openPinjam = (asset: Asset) => {
        setDetailAsset(asset);
        setLoanForm(emptyLoan());
        setShowPinjam(true);
    };

    const handlePinjam = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!detailAsset) {
            return;
        }

        setIsLoanSaving(true);

        try {
            const res = await apiCall(
                `/api/v1/aset/${detailAsset.id}/pinjam`,
                'POST',
                loanForm,
            );

            if (res.status === 'success') {
                notify(res.message);
                setShowPinjam(false);
                router.reload();
            } else {
                notify(res.message || 'Gagal mencatat peminjaman.', 'error');
            }
        } finally {
            setIsLoanSaving(false);
        }
    };

    const handleKembalikan = async (asset: Asset) => {
        if (!window.confirm(`Proses pengembalian aset '${asset.nama_aset}'?`)) {
            return;
        }

        const res = await apiCall(
            `/api/v1/aset/${asset.id}/kembalikan`,
            'POST',
        );
        notify(res.message, res.status === 'success' ? 'success' : 'error');

        if (res.status === 'success') {
            if (detailAsset) {
                openDetail(detailAsset);
            }

            router.reload();
        }
    };

    const handleDelete = async (asset: Asset) => {
        if (
            !window.confirm(
                `Hapus aset '${asset.nama_aset}' (${asset.kode_aset})?`,
            )
        ) {
            return;
        }

        const res = await apiCall(`/api/v1/aset/${asset.id}`, 'DELETE');
        notify(res.message, res.status === 'success' ? 'success' : 'error');

        if (res.status === 'success') {
            router.reload();
        }
    };

    const statusBadge = (status: string) => {
        const map: Record<string, { cls: string; label: string }> = {
            aktif: { cls: 'bg-emerald-100 text-emerald-800', label: 'Aktif' },
            rusak: { cls: 'bg-rose-100 text-rose-700', label: 'Rusak' },
            maintenance: {
                cls: 'bg-amber-100 text-amber-700',
                label: 'Maintenance',
            },
            dipinjam: {
                cls: 'bg-indigo-100 text-indigo-700',
                label: 'Dipinjam',
            },
            dihapuskan: {
                cls: 'bg-slate-200 text-slate-600',
                label: 'Dihapuskan',
            },
        };
        const s = map[status] || {
            cls: 'bg-slate-100 text-slate-600',
            label: status,
        };

        return (
            <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}
            >
                ● {s.label}
            </span>
        );
    };

    const maintenanceJenisLabel: Record<string, string> = {
        rutin: 'Rutin',
        perbaikan: 'Perbaikan',
        kalibrasi: 'Kalibrasi',
    };

    const loanStatusLabel: Record<string, string> = {
        dipinjam: 'Dipinjam',
        dikembalikan: 'Dikembalikan',
    };

    return (
        <Layout user={user} role={role} title="Manajemen Aset">
            <div className="min-h-screen space-y-6 bg-slate-50 p-2 sm:p-4">
                {toast && (
                    <div
                        className={`fixed top-5 right-5 z-50 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl ${toast.type === 'success' ? 'bg-emerald-700' : 'bg-rose-700'}`}
                    >
                        {toast.message}
                    </div>
                )}

                <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#0d4f42] sm:text-3xl">
                                Manajemen Aset
                            </h1>
                            <span className="rounded-full border border-[#145e5b]/20 bg-[#e4f6f2] px-3 py-1 text-xs font-bold text-[#0d4f42]">
                                SIMRS Aset Tetap
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Pengelolaan aset tetap rumah sakit, pemeliharaan,
                            dan peminjaman antar unit.
                        </p>
                        <button
                            onClick={() => router.get('/dashboard')}
                            className="mt-3 text-xs font-bold text-[#145e5b] hover:underline"
                        >
                            ← Kembali ke Dashboard
                        </button>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0d4f42] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0d4f42]/20 transition-all hover:bg-[#145e5b]"
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
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Tambah Aset
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500">
                            Total Aset
                        </p>
                        <p className="mt-2 text-3xl font-extrabold text-gray-900">
                            {kpi.total_aset}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-teal-600">
                            Aset terdaftar
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500">
                            Nilai Buku
                        </p>
                        <p className="mt-2 text-3xl font-extrabold text-[#0d4f42]">
                            {formatRupiah(kpi.nilai_buku)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                            dari {formatRupiah(kpi.nilai_perolehan)} perolehan
                        </p>
                    </div>
                    <button
                        onClick={() => applyFilter({ status: 'rusak' })}
                        className="rounded-2xl border border-rose-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
                    >
                        <p className="text-xs font-semibold text-rose-600">
                            Rusak
                        </p>
                        <p className="mt-2 text-3xl font-extrabold text-rose-700">
                            {kpi.rusak}
                        </p>
                        <p className="mt-1 text-[11px] text-rose-500">
                            Perlu perbaikan
                        </p>
                    </button>
                    <button
                        onClick={() => applyFilter({ status: 'maintenance' })}
                        className="rounded-2xl border border-amber-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
                    >
                        <p className="text-xs font-semibold text-amber-600">
                            Maintenance
                        </p>
                        <p className="mt-2 text-3xl font-extrabold text-amber-700">
                            {kpi.maintenance}
                        </p>
                        <p className="mt-1 text-[11px] text-amber-500">
                            Sedang diperbaiki
                        </p>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                    <div className="relative flex-1">
                        <svg
                            className="absolute top-3 left-3.5 h-4 w-4 text-gray-400"
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
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applyFilter({ search })
                            }
                            placeholder="Cari kode / nama / no. seri aset..."
                            className="w-full rounded-xl border border-gray-200 py-2 pr-4 pl-10 text-xs font-medium focus:border-teal-700 focus:outline-none"
                        />
                    </div>
                    <select
                        value={kategoriFilter}
                        onChange={(e) => {
                            setKategoriFilter(e.target.value);
                            applyFilter({ kategori: e.target.value });
                        }}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:border-teal-700 focus:outline-none"
                    >
                        <option value="all">Semua Kategori</option>
                        {kategori.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.nama_kategori}
                            </option>
                        ))}
                    </select>
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            applyFilter({ status: e.target.value });
                        }}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:border-teal-700 focus:outline-none"
                    >
                        <option value="all">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="rusak">Rusak</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="dipinjam">Dipinjam</option>
                        <option value="dihapuskan">Dihapuskan</option>
                    </select>
                </div>

                {/* Assets Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
                        <h3 className="text-sm font-bold text-gray-800">
                            Daftar Aset ({assets.length})
                        </h3>
                        <span className="text-xs text-slate-400">
                            Klik baris untuk detail aset
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                                <tr>
                                    <th className="p-3.5">Kode / Aset</th>
                                    <th className="p-3.5">Kategori</th>
                                    <th className="p-3.5">Lokasi</th>
                                    <th className="p-3.5">Nilai Buku</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {assets.length > 0 ? (
                                    assets.map((asset) => (
                                        <tr
                                            key={asset.id}
                                            onClick={() => openDetail(asset)}
                                            className="cursor-pointer transition-colors hover:bg-teal-50/40"
                                        >
                                            <td className="p-3.5">
                                                <div className="font-bold text-gray-900">
                                                    {asset.nama_aset}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    {asset.kode_aset} •{' '}
                                                    {asset.merk || '-'}{' '}
                                                    {asset.model
                                                        ? '/' + asset.model
                                                        : ''}
                                                </div>
                                            </td>
                                            <td className="p-3.5 text-gray-600">
                                                {asset.category
                                                    ?.nama_kategori || '-'}
                                            </td>
                                            <td className="p-3.5 text-gray-600">
                                                {asset.ruangan?.nama_ruangan ||
                                                    asset.lokasi ||
                                                    '-'}
                                            </td>
                                            <td className="p-3.5 font-semibold text-gray-800">
                                                {formatRupiah(asset.nilai_buku)}
                                            </td>
                                            <td className="p-3.5">
                                                {statusBadge(asset.status)}
                                            </td>
                                            <td
                                                className="p-3.5 text-right whitespace-nowrap"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {asset.status === 'aktif' && (
                                                    <button
                                                        onClick={() =>
                                                            openMaintenance(
                                                                asset,
                                                            )
                                                        }
                                                        className="rounded-lg bg-amber-100 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-200"
                                                    >
                                                        Maintenance
                                                    </button>
                                                )}
                                                {asset.status !== 'dipinjam' &&
                                                    asset.status !==
                                                        'dihapuskan' && (
                                                        <button
                                                            onClick={() =>
                                                                openPinjam(
                                                                    asset,
                                                                )
                                                            }
                                                            className="ml-1.5 rounded-lg bg-indigo-100 px-2.5 py-1.5 text-[11px] font-bold text-indigo-800 hover:bg-indigo-200"
                                                        >
                                                            Pinjam
                                                        </button>
                                                    )}
                                                {asset.status ===
                                                    'dipinjam' && (
                                                    <button
                                                        onClick={() =>
                                                            handleKembalikan(
                                                                asset,
                                                            )
                                                        }
                                                        className="ml-1.5 rounded-lg bg-teal-100 px-2.5 py-1.5 text-[11px] font-bold text-teal-800 hover:bg-teal-200"
                                                    >
                                                        Kembalikan
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        openEdit(asset)
                                                    }
                                                    className="ml-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-slate-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(asset)
                                                    }
                                                    className="ml-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center font-medium text-gray-400"
                                        >
                                            Tidak ada aset ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Form Tambah/Edit */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
                        <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="font-serif text-lg font-bold text-[#0d4f42]">
                                    {editId ? 'Edit Aset' : 'Tambah Aset Baru'}
                                </h3>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <form
                                onSubmit={handleSave}
                                className="space-y-4 text-xs"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Kode Aset *
                                        </label>
                                        <input
                                            required
                                            value={form.kode_aset}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    kode_aset:
                                                        e.target.value.toUpperCase(),
                                                })
                                            }
                                            placeholder="AST-001"
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Kategori *
                                        </label>
                                        <select
                                            required
                                            value={form.asset_category_id}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    asset_category_id:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        >
                                            <option value="">
                                                -- Pilih Kategori --
                                            </option>
                                            {kategori.map((k) => (
                                                <option key={k.id} value={k.id}>
                                                    {k.nama_kategori}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-gray-700">
                                        Nama Aset *
                                    </label>
                                    <input
                                        required
                                        value={form.nama_aset}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                nama_aset: e.target.value,
                                            })
                                        }
                                        placeholder="Contoh: Ultrasonografi (USG)"
                                        className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Merk
                                        </label>
                                        <input
                                            value={form.merk}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    merk: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Model
                                        </label>
                                        <input
                                            value={form.model}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    model: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            No. Seri
                                        </label>
                                        <input
                                            value={form.nomor_seri}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    nomor_seri: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Tanggal Perolehan
                                        </label>
                                        <input
                                            type="date"
                                            value={form.tanggal_perolehan}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    tanggal_perolehan:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Nilai Perolehan (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={form.nilai_perolehan}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    nilai_perolehan:
                                                        parseInt(
                                                            e.target.value,
                                                            10,
                                                        ) || 0,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Umur Ekonomis (Tahun)
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={form.umur_ekonomis_tahun}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    umur_ekonomis_tahun:
                                                        parseInt(
                                                            e.target.value,
                                                            10,
                                                        ) || 5,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Nilai Residu (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={form.nilai_residu}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    nilai_residu:
                                                        parseInt(
                                                            e.target.value,
                                                            10,
                                                        ) || 0,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Ruangan
                                        </label>
                                        <select
                                            value={form.ruangan_id}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    ruangan_id: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        >
                                            <option value="">
                                                -- Tidak ada --
                                            </option>
                                            {ruangan.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.nama_ruangan}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Lokasi
                                        </label>
                                        <input
                                            value={form.lokasi}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    lokasi: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                {editId && (
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            value={form.status}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    status: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="rusak">Rusak</option>
                                            <option value="maintenance">
                                                Maintenance
                                            </option>
                                            <option value="dipinjam">
                                                Dipinjam
                                            </option>
                                            <option value="dihapuskan">
                                                Dihapuskan
                                            </option>
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Penanggung Jawab
                                        </label>
                                        <input
                                            value={form.penanggung_jawab}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    penanggung_jawab:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Supplier
                                        </label>
                                        <select
                                            value={form.supplier_id}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    supplier_id: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        >
                                            <option value="">
                                                -- Tidak ada --
                                            </option>
                                            {supplier.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nama_supplier}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Garansi Sampai
                                        </label>
                                        <input
                                            type="date"
                                            value={form.garansi_sampai}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    garansi_sampai:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-gray-700">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={form.deskripsi}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                deskripsi: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="rounded-xl bg-[#0d4f42] px-5 py-2 font-bold text-white shadow-sm hover:bg-[#08382f] disabled:opacity-50"
                                    >
                                        {isSaving
                                            ? 'Menyimpan...'
                                            : editId
                                              ? 'Simpan Perubahan'
                                              : 'Tambah Aset'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Detail Aset */}
                {detailAsset && !showMaintenance && !showPinjam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
                        <div className="max-h-[90vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#0d4f42]">
                                        Detail Aset — {detailAsset.nama_aset}
                                    </h3>
                                    <p className="text-[11px] text-gray-400">
                                        {detailAsset.kode_aset} •{' '}
                                        {detailAsset.category?.nama_kategori ||
                                            '-'}{' '}
                                        • {statusBadge(detailAsset.status)} •
                                        Nilai Buku:{' '}
                                        <b className="text-[#0d4f42]">
                                            {formatRupiah(
                                                detailAsset.nilai_buku,
                                            )}
                                        </b>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDetailAsset(null)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        MERK / MODEL
                                    </p>
                                    <p className="mt-0.5 font-semibold text-gray-800">
                                        {detailAsset.merk || '-'}{' '}
                                        {detailAsset.model
                                            ? '/' + detailAsset.model
                                            : ''}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        NO. SERI
                                    </p>
                                    <p className="mt-0.5 font-semibold text-gray-800">
                                        {detailAsset.nomor_seri || '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        LOKASI
                                    </p>
                                    <p className="mt-0.5 font-semibold text-gray-800">
                                        {detailAsset.ruangan?.nama_ruangan ||
                                            detailAsset.lokasi ||
                                            '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        TGL PEROLEHAN
                                    </p>
                                    <p className="mt-0.5 font-semibold text-gray-800">
                                        {detailAsset.tanggal_perolehan || '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        NILAI PEROLEHAN
                                    </p>
                                    <p className="mt-0.5 font-semibold text-gray-800">
                                        {formatRupiah(
                                            detailAsset.nilai_perolehan,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        PENYUSUTAN
                                    </p>
                                    <p className="mt-0.5 font-semibold text-gray-800">
                                        {formatRupiah(
                                            detailAsset.nilai_penyusutan,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        PENANGGUNG JAWAB
                                    </p>
                                    <p className="mt-0.5 font-semibold text-gray-800">
                                        {detailAsset.penanggung_jawab || '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        SUPPLIER
                                    </p>
                                    <p className="mt-0.5 font-semibold text-gray-800">
                                        {detailAsset.supplier?.nama_supplier ||
                                            '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        GARANSI
                                    </p>
                                    <p className="mt-0.5 font-semibold text-gray-800">
                                        {detailAsset.garansi_sampai || '-'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-2 text-xs font-bold text-gray-700">
                                    Riwayat Pemeliharaan
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-slate-100">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                                            <tr>
                                                <th className="p-3">Tanggal</th>
                                                <th className="p-3">Jenis</th>
                                                <th className="p-3">Biaya</th>
                                                <th className="p-3">Vendor</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {maintenances.length > 0 ? (
                                                maintenances.map((m) => (
                                                    <tr key={m.id}>
                                                        <td className="p-3 text-gray-600">
                                                            {m.tanggal}
                                                        </td>
                                                        <td className="p-3 font-semibold text-gray-800">
                                                            {maintenanceJenisLabel[
                                                                m.jenis
                                                            ] || m.jenis}
                                                        </td>
                                                        <td className="p-3 text-gray-600">
                                                            {formatRupiah(
                                                                m.biaya,
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-gray-600">
                                                            {m.vendor || '-'}
                                                        </td>
                                                        <td className="p-3">
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${m.status === 'selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-700'}`}
                                                            >
                                                                {m.status ===
                                                                'selesai'
                                                                    ? 'Selesai'
                                                                    : 'Menunggu'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            {m.status !==
                                                                'selesai' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleMaintenanceSelesai(
                                                                            m,
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-200"
                                                                >
                                                                    Selesaikan
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="p-6 text-center text-gray-400"
                                                    >
                                                        Belum ada pemeliharaan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-2 text-xs font-bold text-gray-700">
                                    Riwayat Peminjaman
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-slate-100">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                                            <tr>
                                                <th className="p-3">
                                                    Unit Peminjam
                                                </th>
                                                <th className="p-3">
                                                    Penanggung Jawab
                                                </th>
                                                <th className="p-3">
                                                    Tgl Pinjam
                                                </th>
                                                <th className="p-3">
                                                    Tgl Kembali
                                                </th>
                                                <th className="p-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {loans.length > 0 ? (
                                                loans.map((l) => (
                                                    <tr key={l.id}>
                                                        <td className="p-3 font-semibold text-gray-800">
                                                            {l.unit_peminjam}
                                                        </td>
                                                        <td className="p-3 text-gray-600">
                                                            {l.penanggung_jawab ||
                                                                '-'}
                                                        </td>
                                                        <td className="p-3 text-gray-600">
                                                            {l.tanggal_pinjam}
                                                        </td>
                                                        <td className="p-3 text-gray-600">
                                                            {l.tanggal_kembali ||
                                                                '-'}
                                                        </td>
                                                        <td className="p-3">
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${l.status === 'dipinjam' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-800'}`}
                                                            >
                                                                {loanStatusLabel[
                                                                    l.status
                                                                ] || l.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="p-6 text-center text-gray-400"
                                                    >
                                                        Belum ada peminjaman.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                <button
                                    onClick={() => setDetailAsset(null)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Tutup
                                </button>
                                {detailAsset.status !== 'dipinjam' &&
                                    detailAsset.status !== 'dihapuskan' && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    openMaintenance(detailAsset)
                                                }
                                                className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800"
                                            >
                                                + Maintenance
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openPinjam(detailAsset)
                                                }
                                                className="rounded-xl bg-indigo-700 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-800"
                                            >
                                                + Pinjam
                                            </button>
                                        </>
                                    )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Maintenance */}
                {showMaintenance && detailAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="font-serif text-lg font-bold text-[#0d4f42]">
                                    Pemeliharaan — {detailAsset.nama_aset}
                                </h3>
                                <button
                                    onClick={() => setShowMaintenance(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <form
                                onSubmit={handleMaintenance}
                                className="space-y-4 text-xs"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Tanggal *
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            value={maintenanceForm.tanggal}
                                            onChange={(e) =>
                                                setMaintenanceForm({
                                                    ...maintenanceForm,
                                                    tanggal: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Jenis *
                                        </label>
                                        <select
                                            required
                                            value={maintenanceForm.jenis}
                                            onChange={(e) =>
                                                setMaintenanceForm({
                                                    ...maintenanceForm,
                                                    jenis: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        >
                                            <option value="rutin">Rutin</option>
                                            <option value="perbaikan">
                                                Perbaikan
                                            </option>
                                            <option value="kalibrasi">
                                                Kalibrasi
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-gray-700">
                                        Biaya (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={maintenanceForm.biaya}
                                        onChange={(e) =>
                                            setMaintenanceForm({
                                                ...maintenanceForm,
                                                biaya:
                                                    parseInt(
                                                        e.target.value,
                                                        10,
                                                    ) || 0,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-gray-700">
                                        Vendor
                                    </label>
                                    <input
                                        value={maintenanceForm.vendor}
                                        onChange={(e) =>
                                            setMaintenanceForm({
                                                ...maintenanceForm,
                                                vendor: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-gray-700">
                                        Keterangan
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={maintenanceForm.keterangan}
                                        onChange={(e) =>
                                            setMaintenanceForm({
                                                ...maintenanceForm,
                                                keterangan: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowMaintenance(false)
                                        }
                                        className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isMaintenanceSaving}
                                        className="rounded-xl bg-amber-700 px-5 py-2 font-bold text-white shadow-sm hover:bg-amber-800 disabled:opacity-50"
                                    >
                                        {isMaintenanceSaving
                                            ? 'Menyimpan...'
                                            : 'Catat Pemeliharaan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Pinjam */}
                {showPinjam && detailAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="font-serif text-lg font-bold text-[#0d4f42]">
                                    Peminjaman — {detailAsset.nama_aset}
                                </h3>
                                <button
                                    onClick={() => setShowPinjam(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <form
                                onSubmit={handlePinjam}
                                className="space-y-4 text-xs"
                            >
                                <div>
                                    <label className="mb-1 block font-bold text-gray-700">
                                        Unit Peminjam *
                                    </label>
                                    <input
                                        required
                                        value={loanForm.unit_peminjam}
                                        onChange={(e) =>
                                            setLoanForm({
                                                ...loanForm,
                                                unit_peminjam: e.target.value,
                                            })
                                        }
                                        placeholder="Contoh: IGD, Poli Anak"
                                        className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-gray-700">
                                        Penanggung Jawab
                                    </label>
                                    <input
                                        value={loanForm.penanggung_jawab}
                                        onChange={(e) =>
                                            setLoanForm({
                                                ...loanForm,
                                                penanggung_jawab:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Tanggal Pinjam *
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            value={loanForm.tanggal_pinjam}
                                            onChange={(e) =>
                                                setLoanForm({
                                                    ...loanForm,
                                                    tanggal_pinjam:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-gray-700">
                                            Tgl Kembali
                                        </label>
                                        <input
                                            type="date"
                                            value={loanForm.tanggal_kembali}
                                            onChange={(e) =>
                                                setLoanForm({
                                                    ...loanForm,
                                                    tanggal_kembali:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block font-bold text-gray-700">
                                        Keterangan
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={loanForm.keterangan}
                                        onChange={(e) =>
                                            setLoanForm({
                                                ...loanForm,
                                                keterangan: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPinjam(false)}
                                        className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoanSaving}
                                        className="rounded-xl bg-indigo-700 px-5 py-2 font-bold text-white shadow-sm hover:bg-indigo-800 disabled:opacity-50"
                                    >
                                        {isLoanSaving
                                            ? 'Menyimpan...'
                                            : 'Proses Pinjam'}
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
