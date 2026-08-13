import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Banknote,
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Pencil,
    Plus,
    Printer,
    Search,
    Trash2,
    Wrench,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
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
    maintenances?: Maintenance[];
    loans?: Loan[];
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

const formatRupiah = (val: number) => {
    const num = Math.round(val || 0);
    return 'Rp ' + num.toLocaleString('id-ID');
};

const formatDateOnly = (d: string | null) => {
    if (!d) return '-';
    try {
        const str = d.split('T')[0];
        const parts = str.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return str;
    } catch {
        return d;
    }
};

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
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [kategoriFilter, setKategoriFilter] = useState(
        filters.kategori || 'all',
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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
        const nextSearch = overrides.search ?? search;
        const nextStatus = overrides.status ?? status;
        const nextKategori = overrides.kategori ?? kategoriFilter;

        setSearch(nextSearch);
        setStatus(nextStatus);
        setKategoriFilter(nextKategori);
        setCurrentPage(1);

        const params: Record<string, string> = {
            search: nextSearch,
            status: nextStatus,
            kategori: nextKategori,
        };
        const clean = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v && v !== 'all'),
        );
        router.get('/aset', clean, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Client side filtering & pagination for fast responsive UX
    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            if (status !== 'all' && asset.status !== status) {
                return false;
            }
            if (
                kategoriFilter !== 'all' &&
                asset.asset_category_id !== kategoriFilter
            ) {
                return false;
            }
            if (search.trim()) {
                const q = search.toLowerCase();
                const matchKode = asset.kode_aset?.toLowerCase().includes(q);
                const matchNama = asset.nama_aset?.toLowerCase().includes(q);
                const matchSeri = asset.nomor_seri?.toLowerCase().includes(q);
                const matchMerk = asset.merk?.toLowerCase().includes(q);
                const matchModel = asset.model?.toLowerCase().includes(q);
                const matchLokasi = (
                    asset.ruangan?.nama_ruangan ||
                    asset.lokasi ||
                    ''
                )
                    .toLowerCase()
                    .includes(q);
                if (
                    !matchKode &&
                    !matchNama &&
                    !matchSeri &&
                    !matchMerk &&
                    !matchModel &&
                    !matchLokasi
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [assets, status, kategoriFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
    const paginatedAssets = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredAssets.slice(start, start + pageSize);
    }, [filteredAssets, currentPage, pageSize]);

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
        } catch {
            notify('Terjadi kesalahan saat menyimpan aset.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const openDetail = async (asset: Asset) => {
        setDetailAsset(asset);
        try {
            const res = await apiCall(`/api/v1/aset/${asset.id}`, 'GET');
            if (res.status === 'success') {
                setDetailAsset(res.data.asset);
                setMaintenances(res.data.asset.maintenances || []);
                setLoans(res.data.asset.loans || []);
            } else {
                setMaintenances(asset.maintenances || []);
                setLoans(asset.loans || []);
            }
        } catch {
            setMaintenances(asset.maintenances || []);
            setLoans(asset.loans || []);
        }
    };

    const openMaintenance = (asset: Asset) => {
        setDetailAsset(asset);
        setMaintenanceForm(emptyMaintenance());
        setShowMaintenance(true);
    };

    const handleMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!detailAsset) return;

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
        } catch {
            notify('Terjadi kesalahan saat mencatat pemeliharaan.', 'error');
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

        try {
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
        } catch {
            notify('Gagal memperbarui status pemeliharaan.', 'error');
        }
    };

    const openPinjam = (asset: Asset) => {
        setDetailAsset(asset);
        setLoanForm(emptyLoan());
        setShowPinjam(true);
    };

    const handlePinjam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!detailAsset) return;

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
        } catch {
            notify('Terjadi kesalahan saat mencatat peminjaman.', 'error');
        } finally {
            setIsLoanSaving(false);
        }
    };

    const handleKembalikan = async (asset: Asset) => {
        if (!window.confirm(`Proses pengembalian aset '${asset.nama_aset}'?`)) {
            return;
        }

        try {
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
        } catch {
            notify('Gagal memproses pengembalian aset.', 'error');
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

        try {
            const res = await apiCall(`/api/v1/aset/${asset.id}`, 'DELETE');
            notify(res.message, res.status === 'success' ? 'success' : 'error');

            if (res.status === 'success') {
                router.reload();
            }
        } catch {
            notify('Gagal menghapus aset.', 'error');
        }
    };

    // Export real CSV file
    const handleExportCSV = () => {
        const dataToExport =
            filteredAssets.length > 0 ? filteredAssets : assets;
        if (dataToExport.length === 0) {
            notify('Tidak ada data aset untuk diekspor.', 'error');
            return;
        }

        const headers = [
            'No',
            'Kode Aset',
            'Nama Aset',
            'Kategori',
            'Merk',
            'Model',
            'Nomor Seri',
            'Ruangan / Lokasi',
            'Tanggal Perolehan',
            'Nilai Perolehan (Rp)',
            'Umur Ekonomis (Tahun)',
            'Nilai Residu (Rp)',
            'Nilai Buku (Rp)',
            'Status',
            'Penanggung Jawab',
            'Supplier',
            'Garansi Sampai',
            'Deskripsi',
        ];

        const escapeCsv = (val: any) => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

        const rows = dataToExport.map((a, idx) => [
            idx + 1,
            escapeCsv(a.kode_aset),
            escapeCsv(a.nama_aset),
            escapeCsv(a.category?.nama_kategori || '-'),
            escapeCsv(a.merk || '-'),
            escapeCsv(a.model || '-'),
            escapeCsv(a.nomor_seri || '-'),
            escapeCsv(a.ruangan?.nama_ruangan || a.lokasi || '-'),
            escapeCsv(a.tanggal_perolehan || '-'),
            a.nilai_perolehan || 0,
            a.umur_ekonomis_tahun || 0,
            a.nilai_residu || 0,
            a.nilai_buku || 0,
            escapeCsv(a.status),
            escapeCsv(a.penanggung_jawab || '-'),
            escapeCsv(a.supplier?.nama_supplier || '-'),
            escapeCsv(a.garansi_sampai || '-'),
            escapeCsv(a.deskripsi || '-'),
        ]);

        const csvContent =
            '\uFEFF' +
            [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const now = new Date().toISOString().slice(0, 10);
        link.setAttribute('href', url);
        link.setAttribute('download', `laporan-aset-rs-${now}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        notify(`Berhasil mengunduh CSV (${dataToExport.length} aset).`);
    };

    // Direct 1-Page Landscape Print with clean document title
    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = '';
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };

    const statusBadge = (statusVal: string) => {
        switch (statusVal) {
            case 'aktif':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-semibold text-[#15803d]">
                        ● Aktif/Tersedia
                    </span>
                );
            case 'rusak':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ffe4e6] px-2.5 py-0.5 text-[11px] font-semibold text-[#be123c]">
                        ● Rusak
                    </span>
                );
            case 'maintenance':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[11px] font-semibold text-[#b45309]">
                        ● Maintenance
                    </span>
                );
            case 'dipinjam':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#dbeafe] px-2.5 py-0.5 text-[11px] font-semibold text-[#1d4ed8]">
                        ● Dipinjam
                    </span>
                );
            case 'dihapuskan':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        ● Dihapuskan
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        ● {statusVal}
                    </span>
                );
        }
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

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + paginatedAssets.length;
    const dataForReport = filteredAssets.length > 0 ? filteredAssets : assets;

    return (
        <Layout user={user} role={role} title="Manajemen Aset">
            {/* Custom Embedded CSS for 1-Page Landscape Print */}
            <style>{`
                @page {
                    size: A4 landscape;
                    margin: 0 !important;
                }
                @media print {
                    html, body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        font-size: 8.5pt !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print\\:hidden, aside, nav, header, button {
                        display: none !important;
                    }
                    #print-area {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 8mm 10mm !important;
                        box-sizing: border-box !important;
                    }
                }
            `}</style>

            {/* Printable Report (Visible ONLY in Print Mode - Designed to fit 1 Page) */}
            <div id="print-area" className="hidden print:block font-sans text-black p-0 m-0">
                {/* Kop RS */}
                <div className="flex items-center justify-between border-b-2 border-[#0d5c58] pb-1.5 mb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[#0d5c58] text-white flex items-center justify-center font-black text-lg">
                            +
                        </div>
                        <div>
                            <h1 className="text-sm font-extrabold tracking-wide uppercase text-[#0d5c58] leading-tight">
                                RUMAH SAKIT SENTOSA MEDIKA
                            </h1>
                            <p className="text-[8.5px] text-slate-600">
                                Sistem Informasi Manajemen Rumah Sakit (SIMRS) • Divisi Sarana & Prasarana
                            </p>
                        </div>
                    </div>
                    <div className="text-right text-[8.5px] text-slate-600 leading-tight">
                        <p><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p><strong>Petugas:</strong> {user?.nama_lengkap || user?.name || 'Budi Santoso'}</p>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-2">
                    <h2 className="text-xs font-black tracking-wide uppercase text-slate-900 leading-tight">
                        LAPORAN INVENTARISASI & REKAPITULASI ASET TETAP
                    </h2>
                    <p className="text-[8px] text-slate-500">
                        Rekapitulasi Fisik, Nilai Buku, dan Status Operasional Aset Rumah Sakit
                    </p>
                </div>

                {/* KPI Summary Bar */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                    <div className="border border-slate-300 bg-slate-50/80 rounded px-2.5 py-1 flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-slate-600 uppercase">Total Aset</span>
                        <span className="text-xs font-extrabold text-slate-900">{kpi.total_aset} Unit</span>
                    </div>
                    <div className="border border-slate-300 bg-slate-50/80 rounded px-2.5 py-1 flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-slate-600 uppercase">Nilai Buku</span>
                        <span className="text-xs font-extrabold text-[#0d5c58]">{formatRupiah(kpi.nilai_buku)}</span>
                    </div>
                    <div className="border border-rose-200 bg-rose-50/80 rounded px-2.5 py-1 flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-rose-600 uppercase">Aset Rusak</span>
                        <span className="text-xs font-extrabold text-rose-700">{kpi.rusak} Unit</span>
                    </div>
                    <div className="border border-teal-200 bg-teal-50/80 rounded px-2.5 py-1 flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-teal-700 uppercase">Maintenance</span>
                        <span className="text-xs font-extrabold text-[#0d5c58]">{kpi.maintenance} Unit</span>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full border-collapse border border-slate-300 text-[8.5px] mb-2">
                    <thead>
                        <tr className="bg-[#0d5c58] text-white">
                            <th className="border border-[#0d5c58] p-1 text-center w-6 font-bold">No</th>
                            <th className="border border-[#0d5c58] p-1 text-left w-20 font-bold">Kode Aset</th>
                            <th className="border border-[#0d5c58] p-1 text-left font-bold">Nama Aset & Spesifikasi</th>
                            <th className="border border-[#0d5c58] p-1 text-left w-24 font-bold">Kategori</th>
                            <th className="border border-[#0d5c58] p-1 text-left w-24 font-bold">Lokasi</th>
                            <th className="border border-[#0d5c58] p-1 text-center w-16 font-bold">Perolehan</th>
                            <th className="border border-[#0d5c58] p-1 text-right w-24 font-bold">Nilai Perolehan</th>
                            <th className="border border-[#0d5c58] p-1 text-right w-24 font-bold">Nilai Buku</th>
                            <th className="border border-[#0d5c58] p-1 text-center w-18 font-bold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataForReport.map((a, i) => (
                            <tr key={a.id} className={i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                                <td className="border border-slate-300 p-1 text-center text-slate-500">{i + 1}</td>
                                <td className="border border-slate-300 p-1 font-bold text-slate-900">{a.kode_aset}</td>
                                <td className="border border-slate-300 p-1 text-slate-800">
                                    <span className="font-bold">{a.nama_aset}</span>
                                    {(a.merk || a.model) && <span className="text-slate-500 ml-1">({[a.merk, a.model].filter(Boolean).join(' / ')})</span>}
                                </td>
                                <td className="border border-slate-300 p-1 text-slate-700">{a.category?.nama_kategori || '-'}</td>
                                <td className="border border-slate-300 p-1 text-slate-700">{a.ruangan?.nama_ruangan || a.lokasi || '-'}</td>
                                <td className="border border-slate-300 p-1 text-center text-slate-600">{formatDateOnly(a.tanggal_perolehan)}</td>
                                <td className="border border-slate-300 p-1 text-right text-slate-700">{formatRupiah(a.nilai_perolehan)}</td>
                                <td className="border border-slate-300 p-1 text-right font-bold text-[#0d5c58]">{formatRupiah(a.nilai_buku)}</td>
                                <td className="border border-slate-300 p-1 text-center">
                                    <span className={`font-bold text-[8px] uppercase px-1.5 py-0.5 rounded-full inline-block ${
                                        a.status === 'aktif'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : a.status === 'rusak'
                                              ? 'bg-rose-100 text-rose-800'
                                              : a.status === 'maintenance'
                                                ? 'bg-amber-100 text-amber-800'
                                                : a.status === 'dipinjam'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-slate-100 text-slate-700'
                                    }`}>
                                        {a.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-100 font-bold border-t-2 border-[#0d5c58]">
                            <td colSpan={6} className="border border-slate-300 p-1 text-right pr-2 font-bold text-slate-900">
                                TOTAL REKAPITULASI ({dataForReport.length} ASET)
                            </td>
                            <td className="border border-slate-300 p-1 text-right font-bold text-slate-900">
                                {formatRupiah(dataForReport.reduce((acc, a) => acc + (Number(a.nilai_perolehan) || 0), 0))}
                            </td>
                            <td className="border border-slate-300 p-1 text-right font-bold text-[#0d5c58]">
                                {formatRupiah(dataForReport.reduce((acc, a) => acc + (Number(a.nilai_buku) || 0), 0))}
                            </td>
                            <td className="border border-slate-300 p-1"></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signatures */}
                <div className="flex justify-between items-end text-[9px] pt-1">
                    <div className="text-center w-48">
                        <p className="text-slate-600">Petugas Logistik & Aset,</p>
                        <p className="mt-8 font-bold text-slate-900 border-b border-slate-600 pb-0.5 inline-block min-w-[140px]">
                            {user?.nama_lengkap || user?.name || 'Budi Santoso'}
                        </p>
                        <p className="text-[8px] text-slate-500">Staff SIMRS</p>
                    </div>
                    <div className="text-center w-48">
                        <p className="text-slate-600">Mengetahui,</p>
                        <p className="text-slate-700 font-medium">Kepala Bagian Sarana & Prasarana</p>
                        <p className="mt-8 font-bold text-slate-900 border-b border-slate-600 pb-0.5 inline-block min-w-[140px]">
                            dr. Hendra Wijaya, Sp.M
                        </p>
                        <p className="text-[8px] text-slate-500">Direktur Operasional & Fasilitas</p>
                    </div>
                </div>
            </div>

            {/* Screen View */}
            <div className="min-h-screen space-y-5 bg-[#f8fafc] p-3 sm:p-6 print:hidden">
                {toast && (
                    <div
                        className={`fixed top-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all ${
                            toast.type === 'success'
                                ? 'bg-emerald-700'
                                : 'bg-rose-700'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Top Header Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                <span>Dashboard</span>
                                <span className="font-normal text-slate-400">
                                    ›
                                </span>
                                <span className="font-semibold text-slate-700">
                                    Aset
                                </span>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <h1 className="text-2xl font-bold tracking-tight text-[#0f2d29] sm:text-[26px]">
                                    Manajemen Aset
                                </h1>
                                <span className="rounded-full border border-[#b2e5df] bg-[#e0f3f1] px-3 py-0.5 text-xs font-semibold text-[#0d5c58]">
                                    SIMRS Aset Tetap
                                </span>
                            </div>

                            <p className="text-xs text-slate-500">
                                Pengelolaan aset tetap rumah sakit,
                                pemeliharaan, dan peminjaman antar unit.
                            </p>

                            <div className="pt-2">
                                <button
                                    onClick={() => router.get('/dashboard')}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0d5c58] hover:text-[#094744] hover:underline"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Kembali ke Dashboard
                                </button>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900"
                            >
                                <Printer className="h-4 w-4 text-slate-600" />
                                Print
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900"
                            >
                                <Download className="h-4 w-4 text-slate-600" />
                                Export
                            </button>
                            <button
                                onClick={openCreate}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0d5c58] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#08423e]"
                            >
                                <Plus className="h-4 w-4 stroke-[2.5]" />
                                Tambah Aset
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4 KPI Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Aset */}
                    <div
                        onClick={() => applyFilter({ status: 'all' })}
                        className="group relative cursor-pointer rounded-xl border border-[#2dd4bf]/80 bg-white p-5 shadow-xs transition-all hover:border-[#14b8a6] hover:shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-medium text-slate-600">
                                Total Aset
                            </p>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdfa] text-[#0d9488]">
                                <Building2 className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {kpi.total_aset}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Aset terdaftar
                        </p>
                    </div>

                    {/* Card 2: Nilai Buku */}
                    <div className="group relative rounded-xl border border-[#2dd4bf]/80 bg-white p-5 shadow-xs">
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-medium text-slate-600">
                                Nilai Buku
                            </p>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdfa] text-[#0d9488]">
                                <Banknote className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {formatRupiah(kpi.nilai_buku)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Nilai total aset perkiraan
                        </p>
                    </div>

                    {/* Card 3: Rusak */}
                    <button
                        onClick={() =>
                            applyFilter({
                                status: status === 'rusak' ? 'all' : 'rusak',
                            })
                        }
                        className={`group relative rounded-xl border p-5 text-left shadow-xs transition-all ${
                            status === 'rusak'
                                ? 'border-rose-400 bg-rose-100/80 ring-2 ring-rose-400/20'
                                : 'border-[#fecdd3] bg-[#fff5f5] hover:border-rose-300 hover:shadow-sm'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold text-rose-600">
                                Rusak
                            </p>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fee2e2] text-rose-600">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-rose-700 sm:text-3xl">
                            {kpi.rusak}
                        </p>
                        <p className="mt-1 text-xs font-medium text-rose-600">
                            Perlu perbaikan
                        </p>
                    </button>

                    {/* Card 4: Maintenance */}
                    <button
                        onClick={() =>
                            applyFilter({
                                status:
                                    status === 'maintenance'
                                        ? 'all'
                                        : 'maintenance',
                            })
                        }
                        className={`group relative rounded-xl border p-5 text-left shadow-xs transition-all ${
                            status === 'maintenance'
                                ? 'border-teal-400 bg-[#ccfbf1] ring-2 ring-teal-400/20'
                                : 'border-[#99f6e4] bg-[#e6f7f5] hover:border-teal-300 hover:shadow-sm'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold text-[#0f766e]">
                                Maintenance
                            </p>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#99f6e4] text-[#0d5c58]">
                                <Wrench className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-[#0f766e] sm:text-3xl">
                            {kpi.maintenance}
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#0d9488]">
                            Sedang diperbaiki
                        </p>
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && applyFilter({ search })
                                }
                                placeholder="Cari kode / nama / no. seri, aset..."
                                className="w-full rounded-lg border border-slate-200 py-2 pr-4 pl-10 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
                            <div className="relative">
                                <select
                                    value={kategoriFilter}
                                    onChange={(e) => {
                                        setKategoriFilter(e.target.value);
                                        applyFilter({
                                            kategori: e.target.value,
                                        });
                                    }}
                                    className="min-w-[140px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3 text-xs font-medium text-slate-700 focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {kategori.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            {k.nama_kategori}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-400" />
                            </div>

                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        applyFilter({ status: e.target.value });
                                    }}
                                    className="min-w-[130px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3 text-xs font-medium text-slate-700 focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="aktif">Aktif</option>
                                    <option value="rusak">Rusak</option>
                                    <option value="maintenance">
                                        Maintenance
                                    </option>
                                    <option value="dipinjam">Dipinjam</option>
                                    <option value="dihapuskan">
                                        Dihapuskan
                                    </option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assets Table Container */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                        <h3 className="text-sm font-bold text-slate-900">
                            Daftar Aset ({filteredAssets.length})
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 italic">
                            Klik baris untuk detail aset
                            <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-white">
                                <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                    <th className="px-5 py-3.5">
                                        KODE / NAMA ASET
                                    </th>
                                    <th className="px-4 py-3.5">KATEGORI</th>
                                    <th className="px-4 py-3.5">LOKASI</th>
                                    <th className="px-4 py-3.5">NILAI BUKU</th>
                                    <th className="px-4 py-3.5">STATUS</th>
                                    <th className="px-5 py-3.5 text-right">
                                        AKSI
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedAssets.length > 0 ? (
                                    paginatedAssets.map((asset) => {
                                        const activeLoan =
                                            asset.loans?.find(
                                                (l) => l.status === 'dipinjam',
                                            ) || asset.loans?.[0];

                                        return (
                                            <tr
                                                key={asset.id}
                                                onClick={() =>
                                                    openDetail(asset)
                                                }
                                                className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                                            >
                                                {/* Kolom 1: Kode & Nama Aset */}
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-slate-900">
                                                        {asset.nama_aset}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] text-slate-500">
                                                        <span
                                                            className={
                                                                asset.status ===
                                                                'rusak'
                                                                    ? 'font-medium text-rose-600'
                                                                    : 'text-slate-500'
                                                            }
                                                        >
                                                            {asset.kode_aset}
                                                        </span>
                                                        {' • '}
                                                        {asset.merk ||
                                                        asset.model
                                                            ? [
                                                                  asset.merk,
                                                                  asset.model,
                                                              ]
                                                                  .filter(
                                                                      Boolean,
                                                                  )
                                                                  .join(' / ')
                                                            : '-'}
                                                    </div>
                                                </td>

                                                {/* Kolom 2: Kategori */}
                                                <td className="px-4 py-4 text-slate-600">
                                                    {asset.category
                                                        ?.nama_kategori || '-'}
                                                </td>

                                                {/* Kolom 3: Lokasi & Status Peminjaman */}
                                                <td className="px-4 py-4 text-slate-600">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span>
                                                            {asset.ruangan
                                                                ?.nama_ruangan ||
                                                                asset.lokasi ||
                                                                '-'}
                                                        </span>
                                                        {asset.status ===
                                                            'dipinjam' && (
                                                            <span className="text-[11px] font-medium text-blue-600">
                                                                |Dipinjam ke{' '}
                                                                {activeLoan?.unit_peminjam ||
                                                                    'ICU'}
                                                                |
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Kolom 4: Nilai Buku */}
                                                <td className="px-4 py-4 font-semibold text-slate-800">
                                                    {formatRupiah(
                                                        asset.nilai_buku,
                                                    )}
                                                </td>

                                                {/* Kolom 5: Status */}
                                                <td className="px-4 py-4">
                                                    {statusBadge(asset.status)}
                                                </td>

                                                {/* Kolom 6: Aksi */}
                                                <td
                                                    className="px-5 py-4 text-right whitespace-nowrap"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Button Maintenance */}
                                                        {asset.status !==
                                                            'dipinjam' &&
                                                            asset.status !==
                                                                'dihapuskan' && (
                                                                <button
                                                                    onClick={() =>
                                                                        openMaintenance(
                                                                            asset,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-bold text-[#b45309] transition hover:bg-[#fde68a]"
                                                                >
                                                                    ●
                                                                    Maintenance
                                                                </button>
                                                            )}

                                                        {/* Button Pinjam / Kembalikan */}
                                                        {asset.status !==
                                                            'dipinjam' &&
                                                            asset.status !==
                                                                'dihapuskan' && (
                                                                <button
                                                                    onClick={() =>
                                                                        openPinjam(
                                                                            asset,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 rounded-full bg-[#dbeafe] px-2.5 py-0.5 text-[10px] font-bold text-[#1d4ed8] transition hover:bg-[#bfdbfe]"
                                                                >
                                                                    ● Pinjam
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
                                                                className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[10px] font-bold text-[#15803d] transition hover:bg-[#bbf7d0]"
                                                            >
                                                                ● Kembalikan
                                                            </button>
                                                        )}

                                                        {/* Icon Edit */}
                                                        <button
                                                            onClick={() =>
                                                                openEdit(asset)
                                                            }
                                                            title="Edit Data Aset"
                                                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>

                                                        {/* Icon Hapus */}
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    asset,
                                                                )
                                                            }
                                                            title="Hapus Aset"
                                                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-10 text-center font-medium text-slate-400"
                                        >
                                            Tidak ada aset ditemukan sesuai
                                            kriteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3.5 sm:flex-row">
                        <div className="text-xs font-medium text-slate-500">
                            Menampilkan{' '}
                            {filteredAssets.length > 0 ? startIdx + 1 : 0}-
                            {Math.min(endIdx, filteredAssets.length)} dari{' '}
                            {filteredAssets.length.toLocaleString('id-ID')} aset
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                disabled={currentPage <= 1}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    if (totalPages <= 5) return true;
                                    if (page === 1 || page === totalPages)
                                        return true;
                                    return Math.abs(page - currentPage) <= 1;
                                })
                                .map((page, idx, arr) => {
                                    const prevPage = arr[idx - 1];
                                    const showEllipsis =
                                        prevPage && page - prevPage > 1;

                                    return (
                                        <React.Fragment key={page}>
                                            {showEllipsis && (
                                                <span className="px-1 text-xs text-slate-400">
                                                    ...
                                                </span>
                                            )}
                                            <button
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className={`h-8 min-w-[32px] rounded-lg px-2 text-xs font-semibold transition ${
                                                    currentPage === page
                                                        ? 'border border-[#b2e5df] bg-[#e0f3f1] text-[#0d5c58]'
                                                        : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    );
                                })}

                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Form Tambah/Edit Aset */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                        <div className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-[#0d5c58]">
                                        {editId
                                            ? 'Edit Data Aset'
                                            : 'Tambah Registrasi Aset Baru'}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Lengkapi informasi inventaris dan
                                        spesifikasi aset
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleSave}
                                className="space-y-4 text-xs"
                            >
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
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
                                            placeholder="Contoh: AST-MED-0006"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold uppercase focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Kategori Aset *
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
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
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
                                    <label className="mb-1 block font-bold text-slate-700">
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
                                        placeholder="Contoh: Ultrasonografi (USG 4D)"
                                        className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
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
                                            placeholder="Contoh: GE / Samsung"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Model / Tipe
                                        </label>
                                        <input
                                            value={form.model}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    model: e.target.value,
                                                })
                                            }
                                            placeholder="Contoh: Voluson E8"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Nomor Seri
                                        </label>
                                        <input
                                            value={form.nomor_seri}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    nomor_seri: e.target.value,
                                                })
                                            }
                                            placeholder="SN-XXXX-XXXX"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
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
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
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
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
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
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
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
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Ruangan Standar
                                        </label>
                                        <select
                                            value={form.ruangan_id}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    ruangan_id: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        >
                                            <option value="">
                                                -- Pilih Ruangan --
                                            </option>
                                            {ruangan.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.nama_ruangan}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Keterangan Lokasi Spesifik
                                        </label>
                                        <input
                                            value={form.lokasi}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    lokasi: e.target.value,
                                                })
                                            }
                                            placeholder="Contoh: Kamar Operasi 2"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {editId && (
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Status Aset
                                        </label>
                                        <select
                                            value={form.status}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    status: e.target
                                                        .value as any,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-bold focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        >
                                            <option value="aktif">
                                                Aktif / Tersedia
                                            </option>
                                            <option value="rusak">
                                                Rusak (Perlu Perbaikan)
                                            </option>
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

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Penanggung Jawab (PIC)
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
                                            placeholder="Nama Dokter / Kepala Unit"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Supplier / Vendor
                                        </label>
                                        <select
                                            value={form.supplier_id}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    supplier_id: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        >
                                            <option value="">
                                                -- Tanpa Supplier --
                                            </option>
                                            {supplier.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nama_supplier}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
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
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-bold text-slate-700">
                                        Catatan & Deskripsi
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
                                        placeholder="Keterangan tambahan terkait aset..."
                                        className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-[#0d5c58] focus:ring-1 focus:ring-[#0d5c58] focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="rounded-xl bg-[#0d5c58] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#08423e] disabled:opacity-50"
                                    >
                                        {isSaving
                                            ? 'Menyimpan...'
                                            : editId
                                              ? 'Simpan Perubahan'
                                              : 'Daftarkan Aset'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Detail Aset */}
                {detailAsset && !showMaintenance && !showPinjam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                        <div className="max-h-[90vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {detailAsset.nama_aset}
                                        </h3>
                                        {statusBadge(detailAsset.status)}
                                    </div>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        <span className="font-semibold text-[#0d5c58]">
                                            {detailAsset.kode_aset}
                                        </span>
                                        {' • '}
                                        {detailAsset.category?.nama_kategori ||
                                            '-'}
                                        {' • '}
                                        Nilai Buku:{' '}
                                        <strong className="text-slate-900">
                                            {formatRupiah(
                                                detailAsset.nilai_buku,
                                            )}
                                        </strong>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDetailAsset(null)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Detail Cards */}
                            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Merk / Model
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {detailAsset.merk || '-'}{' '}
                                        {detailAsset.model
                                            ? '/' + detailAsset.model
                                            : ''}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Nomor Seri
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {detailAsset.nomor_seri || '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Lokasi / Ruangan
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {detailAsset.ruangan?.nama_ruangan ||
                                            detailAsset.lokasi ||
                                            '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Tgl Perolehan
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {detailAsset.tanggal_perolehan || '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Nilai Perolehan
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {formatRupiah(
                                            detailAsset.nilai_perolehan,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Penyusutan Akumulasi
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {formatRupiah(
                                            detailAsset.nilai_penyusutan || 0,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Penanggung Jawab
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {detailAsset.penanggung_jawab || '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Supplier / Rekanan
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {detailAsset.supplier?.nama_supplier ||
                                            '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Garansi Berlaku
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {detailAsset.garansi_sampai || '-'}
                                    </p>
                                </div>
                            </div>

                            {/* Riwayat Maintenance */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-800">
                                        Riwayat Pemeliharaan & Kalibrasi
                                    </h4>
                                    <button
                                        onClick={() =>
                                            openMaintenance(detailAsset)
                                        }
                                        className="text-xs font-semibold text-[#0d5c58] hover:underline"
                                    >
                                        + Catat Maintenance
                                    </button>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500">
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
                                        <tbody className="divide-y divide-slate-100">
                                            {maintenances.length > 0 ? (
                                                maintenances.map((m) => (
                                                    <tr key={m.id}>
                                                        <td className="p-3 text-slate-600">
                                                            {m.tanggal}
                                                        </td>
                                                        <td className="p-3 font-semibold text-slate-800">
                                                            {maintenanceJenisLabel[
                                                                m.jenis
                                                            ] || m.jenis}
                                                        </td>
                                                        <td className="p-3 text-slate-700">
                                                            {formatRupiah(
                                                                m.biaya,
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-slate-600">
                                                            {m.vendor || '-'}
                                                        </td>
                                                        <td className="p-3">
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                    m.status ===
                                                                    'selesai'
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}
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
                                                                    className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-200"
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
                                                        className="p-5 text-center font-medium text-slate-400"
                                                    >
                                                        Belum ada catatan
                                                        pemeliharaan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Riwayat Peminjaman */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-800">
                                        Riwayat Peminjaman Antar Unit
                                    </h4>
                                    {detailAsset.status !== 'dipinjam' && (
                                        <button
                                            onClick={() =>
                                                openPinjam(detailAsset)
                                            }
                                            className="text-xs font-semibold text-[#1d4ed8] hover:underline"
                                        >
                                            + Form Pinjam
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500">
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
                                        <tbody className="divide-y divide-slate-100">
                                            {loans.length > 0 ? (
                                                loans.map((l) => (
                                                    <tr key={l.id}>
                                                        <td className="p-3 font-semibold text-slate-800">
                                                            {l.unit_peminjam}
                                                        </td>
                                                        <td className="p-3 text-slate-600">
                                                            {l.penanggung_jawab ||
                                                                '-'}
                                                        </td>
                                                        <td className="p-3 text-slate-600">
                                                            {l.tanggal_pinjam}
                                                        </td>
                                                        <td className="p-3 text-slate-600">
                                                            {l.tanggal_kembali ||
                                                                '-'}
                                                        </td>
                                                        <td className="p-3">
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                    l.status ===
                                                                    'dipinjam'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-emerald-100 text-emerald-800'
                                                                }`}
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
                                                        className="p-5 text-center font-medium text-slate-400"
                                                    >
                                                        Belum ada catatan
                                                        peminjaman.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">
                                <button
                                    onClick={() => setDetailAsset(null)}
                                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => {
                                        const a = detailAsset;
                                        setDetailAsset(null);
                                        openEdit(a);
                                    }}
                                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900"
                                >
                                    Edit Aset
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Maintenance */}
                {showMaintenance && detailAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-amber-700">
                                        Catat Pemeliharaan Aset
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {detailAsset.nama_aset} (
                                        {detailAsset.kode_aset})
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowMaintenance(false)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleMaintenance}
                                className="space-y-4 text-xs"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Tanggal Pelaksanaan *
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
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold focus:border-amber-600 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Jenis Pemeliharaan *
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
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold focus:border-amber-600 focus:outline-none"
                                        >
                                            <option value="rutin">
                                                Rutin / Servis Berkala
                                            </option>
                                            <option value="perbaikan">
                                                Perbaikan Kerusakan
                                            </option>
                                            <option value="kalibrasi">
                                                Kalibrasi Akurasi
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-bold text-slate-700">
                                        Estimasi / Biaya Perbaikan (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={maintenanceForm.biaya}
                                        onChange={(e) =>
                                            setMaintenanceForm({
                                                ...maintenanceForm,
                                                biaya:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold focus:border-amber-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block font-bold text-slate-700">
                                        Vendor / Teknisi Pelaksana
                                    </label>
                                    <input
                                        value={maintenanceForm.vendor}
                                        onChange={(e) =>
                                            setMaintenanceForm({
                                                ...maintenanceForm,
                                                vendor: e.target.value,
                                            })
                                        }
                                        placeholder="Contoh: PT Medika Servis / Teknisi Internal"
                                        className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-amber-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block font-bold text-slate-700">
                                        Keterangan / Diagnosa Kerusakan
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
                                        placeholder="Detail pekerjaan atau penggantian sparepart..."
                                        className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-amber-600 focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowMaintenance(false)
                                        }
                                        className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isMaintenanceSaving}
                                        className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50"
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

                {/* Modal Pinjam Aset */}
                {showPinjam && detailAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-blue-700">
                                        Peminjaman Antar Unit
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {detailAsset.nama_aset} (
                                        {detailAsset.kode_aset})
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPinjam(false)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handlePinjam}
                                className="space-y-4 text-xs"
                            >
                                <div>
                                    <label className="mb-1 block font-bold text-slate-700">
                                        Unit / Ruangan Peminjam *
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
                                        placeholder="Contoh: IGD, Poliklinik Mata, Rawat Inap B"
                                        className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold focus:border-blue-600 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block font-bold text-slate-700">
                                        Penanggung Jawab Peminjam
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
                                        placeholder="Nama dokter / perawat penanggung jawab"
                                        className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
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
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold focus:border-blue-600 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-bold text-slate-700">
                                            Rencana Tgl Kembali
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
                                            className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-bold text-slate-700">
                                        Keterangan / Keperluan Peminjaman
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
                                        placeholder="Keperluan tindakan / rujukan sementara..."
                                        className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPinjam(false)}
                                        className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoanSaving}
                                        className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isLoanSaving
                                            ? 'Memproses...'
                                            : 'Proses Peminjaman'}
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
