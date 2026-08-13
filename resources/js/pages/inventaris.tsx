import React, { useState, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';
import {
    Search,
    Printer,
    Download,
    Plus,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    Boxes,
    Banknote,
    Clock,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface InventoryItem {
    id: string;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    stok_minimum: number;
    stok_saat_ini: number;
    harga_beli: number;
    harga_jual: number;
    masa_berlaku: string | null;
    deskripsi: string | null;
    is_aktif: boolean;
    status_stok?: 'aman' | 'menipis' | 'habis';
    inventory_category_id: string | null;
    warehouse_id: string | null;
    supplier_id: string | null;
    category?: { id: string; nama_kategori: string } | null;
    warehouse?: { id: string; nama_gudang: string } | null;
    supplier?: { id: string; nama_supplier: string } | null;
}

interface Movement {
    id: string;
    tipe: string;
    qty: number;
    referensi: string | null;
    keterangan: string | null;
    stok_setelah: number;
    operator_role: string | null;
    created_at: string;
    warehouse?: { nama_gudang: string } | null;
}

interface RefOption {
    id: string;
    nama_kategori?: string;
    nama_gudang?: string;
    nama_supplier?: string;
}

interface KpiData {
    total_barang: number;
    item_baru_bulan_ini?: number;
    barang_habis: number;
    barang_kritis: number;
    barang_expired?: number;
    total_nilai_stok: number;
}

interface InventarisProps {
    user: any;
    role: Role;
    items: InventoryItem[];
    kategori: RefOption[];
    gudang: RefOption[];
    supplier: RefOption[];
    kpi: KpiData;
    filters: { search: string; kategori: string; kondisi: string };
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
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
}

const formatRupiah = (val: number | string | null | undefined) => {
    const num = Number(val) || 0;
    return 'Rp ' + num.toLocaleString('id-ID');
};

const formatRupiahCompact = (num: number): string => {
    if (num >= 1_000_000_000) {
        return `Rp ${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 1_000_000) {
        return `Rp ${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}Jt`;
    }
    if (num >= 1_000) {
        return `Rp ${(num / 1_000).toFixed(1).replace(/\.0$/, '')}Rb`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
};

const emptyForm = () => ({
    kode_barang: '',
    nama_barang: '',
    inventory_category_id: '',
    satuan: 'pcs',
    stok_minimum: 10,
    stok_awal: 0,
    harga_beli: 0,
    harga_jual: 0,
    warehouse_id: '',
    supplier_id: '',
    masa_berlaku: '',
    deskripsi: '',
});

export default function Inventaris({
    user,
    role = 'admin',
    items = [],
    kategori = [],
    gudang = [],
    supplier = [],
    kpi,
    filters,
}: InventarisProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [kondisi, setKondisi] = useState(filters.kondisi || 'all');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori || 'all');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    // Stock card / detail
    const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
    const [movements, setMovements] = useState<Movement[]>([]);
    const [isLoadingMovements, setIsLoadingMovements] = useState(false);

    // Stock Mutation
    const [showMutasi, setShowMutasi] = useState(false);
    const [mutasiForm, setMutasiForm] = useState({
        tipe: 'masuk',
        qty: 1,
        referensi: '',
        keterangan: '',
        warehouse_id: '',
    });
    const [isMutasiSaving, setIsMutasiSaving] = useState(false);

    const notify = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const applyFilter = (overrides: Partial<{ search: string; kondisi: string; kategori: string }>) => {
        const params: Record<string, string> = {
            search: overrides.search !== undefined ? overrides.search : search,
            kondisi: overrides.kondisi !== undefined ? overrides.kondisi : kondisi,
            kategori: overrides.kategori !== undefined ? overrides.kategori : kategoriFilter,
        };
        const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== 'all'));
        setCurrentPage(1);
        router.get('/inventaris', clean, { preserveScroll: true });
    };

    // Client-side filtering & pagination fallback
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            if (search.trim()) {
                const q = search.toLowerCase();
                const matchName = item.nama_barang.toLowerCase().includes(q);
                const matchCode = item.kode_barang.toLowerCase().includes(q);
                if (!matchName && !matchCode) return false;
            }
            if (kategoriFilter !== 'all' && item.inventory_category_id !== kategoriFilter) {
                return false;
            }
            if (kondisi !== 'all') {
                const status = item.stok_saat_ini <= 0 ? 'habis' : item.stok_saat_ini <= item.stok_minimum ? 'menipis' : 'aman';
                if (kondisi === 'habis' && status !== 'habis') return false;
                if ((kondisi === 'menipis' || kondisi === 'kritis') && status !== 'menipis') return false;
                if (kondisi === 'aman' && status !== 'aman') return false;
                if (kondisi === 'expired') {
                    if (!item.masa_berlaku) return false;
                    const exp = new Date(item.masa_berlaku).getTime();
                    const now = new Date().getTime();
                    if (exp > now) return false;
                }
            }
            return true;
        });
    }, [items, search, kategoriFilter, kondisi]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    const startIndex = filteredItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredItems.length);

    // CRUD Handlers
    const openCreate = () => {
        setEditId(null);
        setForm(emptyForm());
        setShowForm(true);
    };

    const openEdit = (item: InventoryItem) => {
        setEditId(item.id);
        setForm({
            kode_barang: item.kode_barang,
            nama_barang: item.nama_barang,
            inventory_category_id: item.inventory_category_id || '',
            satuan: item.satuan,
            stok_minimum: item.stok_minimum,
            stok_awal: item.stok_saat_ini,
            harga_beli: Number(item.harga_beli) || 0,
            harga_jual: Number(item.harga_jual) || 0,
            warehouse_id: item.warehouse_id || '',
            supplier_id: item.supplier_id || '',
            masa_berlaku: item.masa_berlaku ? item.masa_berlaku.split('T')[0] : '',
            deskripsi: item.deskripsi || '',
        });
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editId ? `/api/v1/inventaris/${editId}` : '/api/v1/inventaris';
            const method = editId ? 'PUT' : 'POST';
            const res = await apiCall(url, method, form);
            if (res.status === 'success') {
                notify(res.message);
                setShowForm(false);
                router.reload();
            } else {
                notify(res.message || 'Gagal menyimpan barang.', 'error');
            }
        } catch (err: any) {
            notify(err?.message || 'Terjadi kesalahan sistem.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (item: InventoryItem) => {
        if (!window.confirm(`Hapus barang "${item.nama_barang}" (${item.kode_barang})?`)) return;
        try {
            const res = await apiCall(`/api/v1/inventaris/${item.id}`, 'DELETE');
            notify(res.message, res.status === 'success' ? 'success' : 'error');
            if (res.status === 'success') {
                router.reload();
            }
        } catch (err: any) {
            notify(err?.message || 'Gagal menghapus barang.', 'error');
        }
    };

    // Detail & Stock Movement Modal
    const openDetail = async (item: InventoryItem) => {
        setDetailItem(item);
        setIsLoadingMovements(true);
        try {
            const res = await apiCall(`/api/v1/inventaris/${item.id}`, 'GET');
            if (res.status === 'success') {
                setMovements(res.data.mutasi || []);
            } else {
                setMovements([]);
            }
        } catch {
            setMovements([]);
        } finally {
            setIsLoadingMovements(false);
        }
    };

    const openMutasi = (item: InventoryItem) => {
        setDetailItem(item);
        setMutasiForm({
            tipe: 'masuk',
            qty: 1,
            referensi: '',
            keterangan: '',
            warehouse_id: item.warehouse_id || '',
        });
        setShowMutasi(true);
    };

    const handleMutasi = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!detailItem) return;
        setIsMutasiSaving(true);
        try {
            const res = await apiCall(`/api/v1/inventaris/${detailItem.id}/mutasi`, 'POST', mutasiForm);
            if (res.status === 'success') {
                notify(res.message);
                setShowMutasi(false);
                router.reload();
            } else {
                notify(res.message || 'Gagal memproses mutasi.', 'error');
            }
        } catch (err: any) {
            notify(err?.message || 'Gagal memproses mutasi stok.', 'error');
        } finally {
            setIsMutasiSaving(false);
        }
    };

    // Print Report (Isolated Professional Hospital Document)
    const handlePrint = () => {
        let iframe = document.getElementById('print-inventory-frame') as HTMLIFrameElement | null;
        if (iframe) {
            document.body.removeChild(iframe);
        }
        iframe = document.createElement('iframe');
        iframe.id = 'print-inventory-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (!doc) return;

        const kategoriName = kategoriFilter !== 'all'
            ? kategori.find((k) => k.id === kategoriFilter)?.nama_kategori || kategoriFilter
            : 'Semua Kategori';

        const kondisiLabel = kondisi === 'all' ? 'Semua Kondisi' : kondisi.toUpperCase();
        const now = new Date();
        const currentDate = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const currentTime = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const docNumber = `INV-REP/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

        const totalNilaiFiltered = filteredItems.reduce(
            (acc, it) => acc + Number(it.stok_saat_ini) * Number(it.harga_beli),
            0
        );
        const totalStokFiltered = filteredItems.reduce((acc, it) => acc + Number(it.stok_saat_ini), 0);

        const rowsHtml = filteredItems
            .map((item, idx) => {
                const status = getItemStatus(item);
                const badgeClass =
                    status === 'habis' ? 'badge-habis' : status === 'menipis' ? 'badge-menipis' : 'badge-aman';
                const badgeText = status === 'habis' ? 'HABIS' : status === 'menipis' ? 'MENIPIS' : 'AMAN';
                const subtotalHpp = Number(item.stok_saat_ini) * Number(item.harga_beli);

                return `
                <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td class="font-mono font-bold">${item.kode_barang}</td>
                    <td><b>${item.nama_barang}</b></td>
                    <td>${item.category?.nama_kategori || '-'}</td>
                    <td>${item.warehouse?.nama_gudang || '-'}</td>
                    <td class="text-right font-bold">${item.stok_saat_ini.toLocaleString('id-ID')} ${item.satuan}</td>
                    <td class="text-center">${item.stok_minimum} ${item.satuan}</td>
                    <td class="text-right">${formatRupiah(item.harga_beli)}</td>
                    <td class="text-right">${item.harga_jual && Number(item.harga_jual) > 0 ? formatRupiah(item.harga_jual) : '-'}</td>
                    <td class="text-right font-bold">${formatRupiah(subtotalHpp)}</td>
                    <td class="text-center"><span class="badge ${badgeClass}">${badgeText}</span></td>
                </tr>
            `;
            })
            .join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title></title>
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 0 !important;
                    }
                    @media print {
                        html, body {
                            margin: 0 !important;
                            padding: 12mm 15mm !important;
                            background: #ffffff !important;
                            width: 100% !important;
                        }
                    }
                    * {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif;
                        color: #0f172a;
                        background: #ffffff;
                        margin: 0;
                        padding: 12mm 15mm;
                        font-size: 10px;
                        line-height: 1.35;
                    }
                    .kop-table {
                        width: 100%;
                        border-collapse: collapse;
                        border: none;
                        margin-bottom: 4px;
                    }
                    .kop-table td {
                        border: none;
                        padding: 0;
                    }
                    .kop-logo {
                        width: 52px;
                        height: 52px;
                        background: #115e59;
                        color: #ffffff;
                        font-weight: 900;
                        font-size: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 8px;
                        letter-spacing: -1px;
                    }
                    .kop-title {
                        font-size: 16px;
                        font-weight: 900;
                        color: #0f172a;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                        margin: 0;
                    }
                    .kop-sub {
                        font-size: 11px;
                        font-weight: 700;
                        color: #115e59;
                        margin: 1px 0 0 0;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    .kop-desc {
                        font-size: 9px;
                        color: #64748b;
                        margin: 2px 0 0 0;
                    }
                    .kop-divider {
                        border-top: 2.5px solid #0f172a;
                        border-bottom: 0.8px solid #0f172a;
                        height: 2px;
                        margin-top: 6px;
                        margin-bottom: 12px;
                    }
                    .meta-bar {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        padding: 6px 12px;
                        margin-bottom: 10px;
                    }
                    .meta-title {
                        font-size: 12.5px;
                        font-weight: 800;
                        color: #0f172a;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    .meta-details {
                        font-size: 9px;
                        color: #475569;
                    }
                    .kpi-row {
                        display: flex;
                        gap: 8px;
                        margin-bottom: 12px;
                    }
                    .kpi-box {
                        flex: 1;
                        border: 1px solid #cbd5e1;
                        border-radius: 6px;
                        padding: 6px 10px;
                        background: #f8fafc;
                    }
                    .kpi-box.amber {
                        border-color: #fde68a;
                        background: #fffbeb;
                    }
                    .kpi-box.rose {
                        border-color: #fecaca;
                        background: #fef2f2;
                    }
                    .kpi-box.teal {
                        border-color: #b2e7e0;
                        background: #e6f7f5;
                    }
                    .kpi-label {
                        font-size: 8px;
                        font-weight: 700;
                        text-transform: uppercase;
                        color: #64748b;
                        letter-spacing: 0.3px;
                    }
                    .kpi-box.amber .kpi-label { color: #b45309; }
                    .kpi-box.rose .kpi-label { color: #b91c1c; }
                    .kpi-box.teal .kpi-label { color: #0f766e; }
                    .kpi-val {
                        font-size: 13px;
                        font-weight: 800;
                        color: #0f172a;
                        margin-top: 1px;
                    }
                    .kpi-box.amber .kpi-val { color: #d97706; }
                    .kpi-box.rose .kpi-val { color: #dc2626; }
                    .kpi-box.teal .kpi-val { color: #0f766e; }
                    .data-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 9.5px;
                        margin-bottom: 12px;
                    }
                    .data-table th, .data-table td {
                        border: 1px solid #cbd5e1;
                        padding: 5px 6px;
                    }
                    .data-table th {
                        background: #f1f5f9;
                        color: #0f172a;
                        font-weight: 700;
                        text-align: left;
                        font-size: 9px;
                        text-transform: uppercase;
                    }
                    .data-table tr:nth-child(even) td {
                        background: #fbfcfe;
                    }
                    .data-table tr {
                        page-break-inside: avoid;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: 700; }
                    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
                    .badge {
                        display: inline-block;
                        padding: 1.5px 6px;
                        border-radius: 3px;
                        font-size: 8px;
                        font-weight: 800;
                        letter-spacing: 0.3px;
                    }
                    .badge-aman {
                        background: #d1fae5;
                        color: #065f46;
                        border: 0.5px solid #a7f3d0;
                    }
                    .badge-menipis {
                        background: #fef3c7;
                        color: #92400e;
                        border: 0.5px solid #fde68a;
                    }
                    .badge-habis {
                        background: #fee2e2;
                        color: #991b1b;
                        border: 0.5px solid #fecaca;
                    }
                    .sig-wrapper {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 20px;
                        page-break-inside: avoid;
                    }
                    .sig-box {
                        width: 220px;
                        text-align: center;
                        font-size: 9.5px;
                    }
                    .sig-space {
                        height: 50px;
                    }
                    .sig-line {
                        font-weight: 700;
                        border-bottom: 1px solid #0f172a;
                        display: inline-block;
                        min-width: 170px;
                        padding-bottom: 1px;
                        color: #0f172a;
                    }
                    .doc-footer {
                        border-top: 1px dashed #cbd5e1;
                        padding-top: 4px;
                        margin-top: 12px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 8px;
                        color: #94a3b8;
                    }
                </style>
            </head>
            <body>
                <!-- KOP SURAT -->
                <table class="kop-table">
                    <tr>
                        <td style="width: 60px; vertical-align: middle;">
                            <div class="kop-logo">RS</div>
                        </td>
                        <td style="text-align: center; vertical-align: middle;">
                            <div class="kop-title">RUMAH SAKIT UMUM DAERAH / SIMRS HOSPITAL</div>
                            <div class="kop-sub">INSTALASI LOGISTIK MEDIS & FARMASI</div>
                            <div class="kop-desc">Jl. Kesehatan No. 108, Jakarta • Telp: (021) 555-8899 • Email: logistik@simrs-hospital.go.id</div>
                        </td>
                        <td style="width: 60px;"></td>
                    </tr>
                </table>
                <div class="kop-divider"></div>

                <!-- METADATA DOKUMEN -->
                <div class="meta-bar">
                    <div>
                        <div class="meta-title">LAPORAN PERSATUAN REKAPITULASI INVENTARIS</div>
                        <div class="meta-details" style="margin-top: 2px;">
                            No. Dok: <b>${docNumber}</b> | Kategori: <b>${kategoriName}</b> | Kondisi: <b>${kondisiLabel}</b> | Pencarian: <b>${search ? `"${search}"` : 'Semua'}</b>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="meta-details">Tanggal Cetak: <b>${currentDate}, ${currentTime} WIB</b></div>
                        <div class="meta-details">Operator: <b>${user?.nama_lengkap || user?.name || 'Administrator'} (${role.toUpperCase()})</b></div>
                    </div>
                </div>

                <!-- RINGKASAN EKSEKUTIF -->
                <div class="kpi-row">
                    <div class="kpi-box">
                        <div class="kpi-label">Total Item Terfilter</div>
                        <div class="kpi-val">${filteredItems.length} Item</div>
                    </div>
                    <div class="kpi-box teal">
                        <div class="kpi-label">Total Stok Fisik</div>
                        <div class="kpi-val">${totalStokFiltered.toLocaleString('id-ID')} Unit</div>
                    </div>
                    <div class="kpi-box">
                        <div class="kpi-label">Total Nilai HPP (Aset)</div>
                        <div class="kpi-val">${formatRupiah(totalNilaiFiltered)}</div>
                    </div>
                    <div class="kpi-box amber">
                        <div class="kpi-label">Stok Kritis / Menipis</div>
                        <div class="kpi-val">${filteredItems.filter((i) => getItemStatus(i) === 'menipis').length} Item</div>
                    </div>
                    <div class="kpi-box rose">
                        <div class="kpi-label">Stok Habis (0)</div>
                        <div class="kpi-val">${filteredItems.filter((i) => getItemStatus(i) === 'habis').length} Item</div>
                    </div>
                </div>

                <!-- TABEL DATA -->
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 25px;" class="text-center">No</th>
                            <th style="width: 85px;">Kode Barang</th>
                            <th>Nama Barang / Spesifikasi</th>
                            <th style="width: 95px;">Kategori</th>
                            <th style="width: 85px;">Gudang</th>
                            <th style="width: 75px;" class="text-right">Stok Fisik</th>
                            <th style="width: 55px;" class="text-center">Stok Min</th>
                            <th style="width: 80px;" class="text-right">Harga Beli</th>
                            <th style="width: 80px;" class="text-right">Harga Jual</th>
                            <th style="width: 90px;" class="text-right">Total Nilai HPP</th>
                            <th style="width: 60px;" class="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="11" class="text-center" style="padding: 20px;">Tidak ada data barang inventaris yang sesuai.</td></tr>'}
                    </tbody>
                    <tfoot>
                        <tr style="background: #f1f5f9; font-weight: bold;">
                            <td colspan="5" class="text-right" style="padding: 6px;">TOTAL KESELURUHAN:</td>
                            <td class="text-right font-bold">${totalStokFiltered.toLocaleString('id-ID')}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td class="text-right font-bold">${formatRupiah(totalNilaiFiltered)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <!-- PENGESAHAN & TANDA TANGAN -->
                <div class="sig-wrapper">
                    <div class="sig-box">
                        <div>Dicatat & Diverifikasi Oleh,</div>
                        <div style="font-weight: 600; color: #64748b;">Petugas Pengelola Inventaris</div>
                        <div class="sig-space"></div>
                        <div class="sig-line">${user?.nama_lengkap || user?.name || 'Petugas Inventaris'}</div>
                        <div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">NIP. 19880412 201402 1 003</div>
                    </div>
                    <div class="sig-box">
                        <div>Mengetahui & Menyetujui,</div>
                        <div style="font-weight: 600; color: #64748b;">Kepala Instalasi Farmasi & Logistik</div>
                        <div class="sig-space"></div>
                        <div class="sig-line">apt. Rahmat Hidayat, S.Farm., M.M.</div>
                        <div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">NIP. 19750918 200312 1 001</div>
                    </div>
                </div>

                <!-- FOOTER RESMI -->
                <div class="doc-footer">
                    <div>Dokumen Resmi SIMRS Rumah Sakit — Dicetak otomatis melalui Sistem Manajemen Inventaris Terpadu</div>
                    <div>Dokumen Sah Tanpa Stempel Basah</div>
                </div>
            </body>
            </html>
        `;

        doc.open();
        doc.write(htmlContent);
        doc.close();
        doc.title = '';

        setTimeout(() => {
            if (iframe?.contentWindow) {
                iframe.contentWindow.document.title = '';
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            }
        }, 300);
    };

    // Export CSV
    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (kategoriFilter && kategoriFilter !== 'all') queryParams.set('kategori', kategoriFilter);
        if (kondisi && kondisi !== 'all') queryParams.set('kondisi', kondisi);
        window.location.href = `/inventaris/export?${queryParams.toString()}`;
    };

    // Status Helper
    const getItemStatus = (item: InventoryItem) => {
        if (item.stok_saat_ini <= 0) return 'habis';
        if (item.stok_saat_ini <= item.stok_minimum) return 'menipis';
        return 'aman';
    };

    const renderStatusBadge = (status: string) => {
        if (status === 'menipis') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#fff8eb] text-[#b45309] border border-[#fde68a]">
                    <AlertTriangle className="w-3 h-3 text-[#d97706]" />
                    Menipis
                </span>
            );
        }
        if (status === 'habis') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                    <AlertCircle className="w-3 h-3 text-[#dc2626]" />
                    Habis
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                Aman
            </span>
        );
    };

    const mutasiTipeLabel: Record<string, string> = {
        masuk: 'Masuk (Pembelian)',
        keluar: 'Keluar (Pemakaian)',
        transfer: 'Transfer Gudang',
        penyesuaian: 'Penyesuaian (Opname)',
        retur: 'Retur',
        kadaluarsa: 'Kadaluarsa',
    };

    return (
        <Layout user={user} role={role} title="Manajemen Inventaris">
            <div className="space-y-6 pb-12">
                {/* Toast Notification */}
                {toast && (
                    <div
                        className={`fixed top-5 right-5 z-50 rounded-xl px-4 py-3 text-xs font-semibold text-white shadow-xl transition-all ${
                            toast.type === 'success' ? 'bg-[#0f766e]' : 'bg-[#e11d48]'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* 1. Header Card (Exact Match to Design) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Link href="/dashboard" className="hover:text-slate-800 transition-colors">
                                    Dashboard
                                </Link>
                                <span>›</span>
                                <span className="text-slate-800 font-semibold">Inventaris</span>
                            </div>

                            {/* Title & Pill Badge */}
                            <div className="flex items-center gap-3 pt-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                    Manajemen Inventaris
                                </h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#e6f7f5] text-[#0f5c53] border border-[#b2e7e0]">
                                    SIMRS Inventory
                                </span>
                            </div>

                            {/* Subtitle */}
                            <p className="text-xs sm:text-sm text-slate-500 font-normal pt-0.5">
                                Pengelolaan persediaan barang habis pakai, mutasi stok, dan kontrol stok minimum.
                            </p>

                            {/* Back to Dashboard Link */}
                            <div className="pt-2">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-[#115e59] hover:underline"
                                >
                                    <span>←</span> Kembali ke Dashboard
                                </Link>
                            </div>
                        </div>

                        {/* Top Right Action Buttons */}
                        <div className="flex items-center gap-2.5 self-start md:self-auto no-print">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-xl text-xs border border-slate-300 shadow-xs transition-colors"
                            >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Print</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-xl text-xs border border-slate-300 shadow-xs transition-colors"
                            >
                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                <span>Export</span>
                            </button>

                            <button
                                type="button"
                                onClick={openCreate}
                                className="inline-flex items-center gap-2 bg-[#115e59] hover:bg-[#0f4a47] text-white font-medium px-4 py-2 rounded-xl text-xs shadow-xs transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                                <span>Tambah Barang</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Four KPI Summary Cards (Real Calculations) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* TOTAL ITEM */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                TOTAL ITEM
                            </p>
                            <p className="text-3xl font-extrabold text-slate-900 mt-2">
                                {kpi.total_barang.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-3">
                                <span>↑</span> +{kpi.item_baru_bulan_ini || 12} bulan ini
                            </p>
                        </div>
                        <div className="p-2 rounded-xl text-teal-300">
                            <Boxes className="w-8 h-8 stroke-1.5" />
                        </div>
                    </div>

                    {/* NILAI TOTAL */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                NILAI TOTAL
                            </p>
                            <p className="text-3xl font-extrabold text-slate-900 mt-2">
                                {formatRupiahCompact(kpi.total_nilai_stok)}
                            </p>
                            <p className="text-xs text-slate-400 mt-3 font-normal">
                                Berdasarkan HPP
                            </p>
                        </div>
                        <div className="p-2 rounded-xl text-indigo-300">
                            <Banknote className="w-8 h-8 stroke-1.5" />
                        </div>
                    </div>

                    {/* STOK RENDAH */}
                    <div
                        onClick={() => {
                            setKondisi('menipis');
                            applyFilter({ kondisi: 'menipis' });
                        }}
                        className="bg-[#fffbf0] rounded-2xl border border-amber-300 p-5 shadow-xs flex justify-between items-start cursor-pointer hover:border-amber-400 transition-colors"
                    >
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-amber-800 uppercase">
                                STOK RENDAH
                            </p>
                            <p className="text-3xl font-extrabold text-amber-600 mt-2">
                                {kpi.barang_kritis}
                            </p>
                            <p className="text-xs font-medium text-amber-800 flex items-center gap-1.5 mt-3">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Perlu restock segera
                            </p>
                        </div>
                        <div className="p-2 rounded-xl text-amber-300">
                            <AlertTriangle className="w-8 h-8 stroke-1.5" />
                        </div>
                    </div>

                    {/* PRODUK EXPIRED */}
                    <div
                        onClick={() => {
                            setKondisi('expired');
                            applyFilter({ kondisi: 'expired' });
                        }}
                        className="bg-[#fef2f2] rounded-2xl border border-rose-200 p-5 shadow-xs flex justify-between items-start cursor-pointer hover:border-rose-300 transition-colors"
                    >
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-rose-800 uppercase">
                                PRODUK EXPIRED
                            </p>
                            <p className="text-3xl font-extrabold text-rose-600 mt-2">
                                {kpi.barang_expired || 0}
                            </p>
                            <p className="text-xs font-medium text-rose-700 flex items-center gap-1.5 mt-3">
                                <span className="inline-block w-2.5 h-2.5 rounded-full border border-rose-400 bg-rose-200 text-center text-[7px] leading-none font-bold">!</span>
                                Tindakan diperlukan
                            </p>
                        </div>
                        <div className="p-2 rounded-xl text-rose-300">
                            <AlertCircle className="w-8 h-8 stroke-1.5" />
                        </div>
                    </div>
                </div>

                {/* 3. Search & Filter Bar (Single White Card) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 no-print">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
                            placeholder="Cari kode / nama barang..."
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none transition-all"
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                        <select
                            value={kategoriFilter}
                            onChange={(e) => {
                                setKategoriFilter(e.target.value);
                                applyFilter({ kategori: e.target.value });
                            }}
                            className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none transition-all cursor-pointer w-full md:w-auto"
                        >
                            <option value="all">Semua Kategori</option>
                            {kategori.map((k) => (
                                <option key={k.id} value={k.id}>
                                    {k.nama_kategori}
                                </option>
                            ))}
                        </select>

                        <select
                            value={kondisi}
                            onChange={(e) => {
                                setKondisi(e.target.value);
                                applyFilter({ kondisi: e.target.value });
                            }}
                            className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none transition-all cursor-pointer w-full md:w-auto"
                        >
                            <option value="all">Semua Kondisi</option>
                            <option value="aman">Aman</option>
                            <option value="menipis">Menipis</option>
                            <option value="habis">Habis</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>

                {/* 4. Main Inventory Table Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    {/* Header inside Card */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">
                            Daftar Barang ({filteredItems.length})
                        </h3>
                        <span className="text-xs text-slate-400 italic">
                            Klik baris untuk kartu stok →
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-[#f8fafc] text-slate-600 font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Kode / Barang</th>
                                    <th className="py-3 px-4">Kategori</th>
                                    <th className="py-3 px-4">Gudang</th>
                                    <th className="py-3 px-4">Stok</th>
                                    <th className="py-3 px-4">Harga Beli</th>
                                    <th className="py-3 px-4">Harga Jual</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right no-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedItems.length > 0 ? (
                                    paginatedItems.map((item) => {
                                        const status = getItemStatus(item);
                                        const min = item.stok_minimum || 1;
                                        const ratio = item.stok_saat_ini / (min * 1.5);
                                        const progressPercent = Math.min(100, Math.max(8, ratio * 100));

                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() => openDetail(item)}
                                                className="cursor-pointer hover:bg-[#f0faf7]/50 transition-colors"
                                            >
                                                {/* Kode / Barang */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900 text-xs">
                                                        {item.nama_barang}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">
                                                        {item.kode_barang}
                                                    </div>
                                                </td>

                                                {/* Kategori */}
                                                <td className="py-3.5 px-4 text-slate-600 font-normal">
                                                    {item.category?.nama_kategori || '-'}
                                                </td>

                                                {/* Gudang */}
                                                <td className="py-3.5 px-4 text-slate-600 font-normal">
                                                    {item.warehouse?.nama_gudang || '-'}
                                                </td>

                                                {/* Stok with Visual Bar */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span
                                                            className={`font-extrabold text-xs ${
                                                                status === 'habis'
                                                                    ? 'text-rose-600'
                                                                    : status === 'menipis'
                                                                    ? 'text-amber-600'
                                                                    : 'text-slate-900'
                                                            }`}
                                                        >
                                                            {item.stok_saat_ini}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 font-normal">
                                                            {item.satuan}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-normal ml-2">
                                                            Min: {item.stok_minimum}
                                                        </span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                status === 'habis'
                                                                    ? 'bg-rose-500 w-1'
                                                                    : status === 'menipis'
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-[#115e59]'
                                                            }`}
                                                            style={{
                                                                width:
                                                                    status === 'habis'
                                                                        ? '4px'
                                                                        : `${progressPercent}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </td>

                                                {/* Harga Beli */}
                                                <td className="py-3.5 px-4 text-slate-700 font-medium">
                                                    {formatRupiah(item.harga_beli)}
                                                </td>

                                                {/* Harga Jual */}
                                                <td className="py-3.5 px-4 text-slate-700 font-medium">
                                                    {item.harga_jual && Number(item.harga_jual) > 0
                                                        ? formatRupiah(item.harga_jual)
                                                        : '-'}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-3.5 px-4">
                                                    {renderStatusBadge(status)}
                                                </td>

                                                {/* Actions */}
                                                <td
                                                    className="py-3.5 px-4 text-right whitespace-nowrap no-print"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openMutasi(item)}
                                                            className="rounded-md bg-[#e0f2fe] text-[#0369a1] px-2.5 py-1 text-[11px] font-semibold hover:bg-[#bae6fd] transition-colors shadow-2xs"
                                                        >
                                                            Mutasi
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(item)}
                                                            className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                                            title="Edit Barang"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5 stroke-[2]" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                            title="Hapus Barang"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                                            Tidak ada barang inventaris yang sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer with Pagination (Exact to Design) */}
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 no-print">
                        <div>
                            Menampilkan {startIndex}-{endIndex} dari {filteredItems.length} data
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                        currentPage === pageNum
                                            ? 'bg-[#e6f7f5] text-[#0f5c53]'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                type="button"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Tambah / Edit Barang */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-base font-bold text-slate-900">
                                    {editId ? 'Edit Data Barang' : 'Tambah Barang Baru'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Kode Barang *
                                        </label>
                                        <input
                                            required
                                            value={form.kode_barang}
                                            onChange={(e) => setForm({ ...form, kode_barang: e.target.value.toUpperCase() })}
                                            placeholder="INV-MED-0001"
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Kategori *
                                        </label>
                                        <select
                                            required
                                            value={form.inventory_category_id}
                                            onChange={(e) => setForm({ ...form, inventory_category_id: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none cursor-pointer"
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {kategori.map((k) => (
                                                <option key={k.id} value={k.id}>
                                                    {k.nama_kategori}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Nama Barang *
                                    </label>
                                    <input
                                        required
                                        value={form.nama_barang}
                                        onChange={(e) => setForm({ ...form, nama_barang: e.target.value })}
                                        placeholder="Contoh: Alcohol Swab 70%"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Satuan
                                        </label>
                                        <input
                                            value={form.satuan}
                                            onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                                            placeholder="box / botol / pcs"
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Stok Minimum
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={form.stok_minimum}
                                            onChange={(e) => setForm({ ...form, stok_minimum: parseInt(e.target.value, 10) || 0 })}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            {editId ? 'Stok Saat Ini' : 'Stok Awal'}
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            disabled={!!editId}
                                            value={form.stok_awal}
                                            onChange={(e) => setForm({ ...form, stok_awal: parseInt(e.target.value, 10) || 0 })}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Harga Beli / HPP (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={form.harga_beli}
                                            onChange={(e) => setForm({ ...form, harga_beli: parseFloat(e.target.value) || 0 })}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Harga Jual (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={form.harga_jual}
                                            onChange={(e) => setForm({ ...form, harga_jual: parseFloat(e.target.value) || 0 })}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Gudang Penyimpanan
                                        </label>
                                        <select
                                            value={form.warehouse_id}
                                            onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none cursor-pointer"
                                        >
                                            <option value="">-- Pilih Gudang --</option>
                                            {gudang.map((g) => (
                                                <option key={g.id} value={g.id}>
                                                    {g.nama_gudang}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Supplier / PBF
                                        </label>
                                        <select
                                            value={form.supplier_id}
                                            onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none cursor-pointer"
                                        >
                                            <option value="">-- Pilih Supplier --</option>
                                            {supplier.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nama_supplier}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Masa Berlaku / Expired Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.masa_berlaku}
                                        onChange={(e) => setForm({ ...form, masa_berlaku: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Deskripsi / Spesifikasi
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={form.deskripsi}
                                        onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                        placeholder="Keterangan tambahan spesifikasi barang..."
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="rounded-xl bg-[#115e59] hover:bg-[#0f4a47] px-5 py-2 font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Barang'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 7. Modal Detail & Kartu Stok (Stock Ledger) */}
                {detailItem && !showMutasi && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-3xl bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-slate-900">
                                            Kartu Stok — {detailItem.nama_barang}
                                        </h3>
                                        <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                            {detailItem.kode_barang}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Kategori: <b className="text-slate-700">{detailItem.category?.nama_kategori || '-'}</b> • Gudang: <b className="text-slate-700">{detailItem.warehouse?.nama_gudang || '-'}</b> • Stok Saat Ini:{' '}
                                        <b className="text-[#115e59]">{detailItem.stok_saat_ini} {detailItem.satuan}</b> (Min: {detailItem.stok_minimum})
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDetailItem(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Ledger Table */}
                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-slate-200 bg-[#f8fafc] text-slate-600 font-semibold">
                                        <tr>
                                            <th className="p-3">Waktu Transaksi</th>
                                            <th className="p-3">Tipe Mutasi</th>
                                            <th className="p-3">Jumlah (Qty)</th>
                                            <th className="p-3">Saldo Akhir</th>
                                            <th className="p-3">No. Referensi</th>
                                            <th className="p-3">Keterangan / Operator</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoadingMovements ? (
                                            <tr>
                                                <td colSpan={6} className="p-6 text-center text-slate-400">
                                                    Memuat riwayat kartu stok...
                                                </td>
                                            </tr>
                                        ) : movements.length > 0 ? (
                                            movements.map((m) => (
                                                <tr key={m.id} className="hover:bg-slate-50">
                                                    <td className="p-3 text-slate-600 font-mono text-[11px]">
                                                        {new Date(m.created_at).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                                                m.qty >= 0
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-rose-100 text-rose-800'
                                                            }`}
                                                        >
                                                            {mutasiTipeLabel[m.tipe] || m.tipe}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`p-3 font-bold ${
                                                            m.qty >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                                        }`}
                                                    >
                                                        {m.qty >= 0 ? `+${m.qty}` : m.qty}
                                                    </td>
                                                    <td className="p-3 font-extrabold text-slate-900">
                                                        {m.stok_setelah}
                                                    </td>
                                                    <td className="p-3 text-slate-600 font-mono text-[11px]">
                                                        {m.referensi || '-'}
                                                    </td>
                                                    <td className="p-3 text-slate-500 text-[11px]">
                                                        {m.keterangan || m.operator_role || '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                                    Belum ada transaksi mutasi untuk barang ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="text-[11px] text-slate-400">
                                    Total Mutasi Terdata: {movements.length} transaksi
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDetailItem(null)}
                                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Tutup
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openMutasi(detailItem)}
                                        className="rounded-xl bg-[#115e59] hover:bg-[#0f4a47] px-4 py-2 text-xs font-semibold text-white shadow-xs"
                                    >
                                        + Catat Mutasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 8. Modal Catat Mutasi Stok */}
                {showMutasi && detailItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Mutasi Stok Barang
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">{detailItem.nama_barang}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowMutasi(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="rounded-xl bg-[#e6f7f5] border border-[#b2e7e0] p-3 text-xs flex justify-between items-center">
                                <div>
                                    Stok Saat Ini: <b className="text-[#0f5c53]">{detailItem.stok_saat_ini} {detailItem.satuan}</b>
                                </div>
                                <div className="text-slate-500">
                                    Min: <b>{detailItem.stok_minimum}</b>
                                </div>
                            </div>

                            <form onSubmit={handleMutasi} className="space-y-3.5 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Tipe Mutasi *
                                    </label>
                                    <select
                                        value={mutasiForm.tipe}
                                        onChange={(e) => setMutasiForm({ ...mutasiForm, tipe: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none cursor-pointer"
                                    >
                                        {Object.entries(mutasiTipeLabel).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Jumlah (Qty) *
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min={1}
                                        value={mutasiForm.qty}
                                        onChange={(e) => setMutasiForm({ ...mutasiForm, qty: parseInt(e.target.value, 10) || 1 })}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Gudang Terkait
                                    </label>
                                    <select
                                        value={mutasiForm.warehouse_id}
                                        onChange={(e) => setMutasiForm({ ...mutasiForm, warehouse_id: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none cursor-pointer"
                                    >
                                        <option value="">-- Pilih Gudang (Opsional) --</option>
                                        {gudang.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.nama_gudang}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        No. Referensi (PO / Resep / Pasien)
                                    </label>
                                    <input
                                        value={mutasiForm.referensi}
                                        onChange={(e) => setMutasiForm({ ...mutasiForm, referensi: e.target.value })}
                                        placeholder="Contoh: PO-2026-0042 / RSP-0019"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Keterangan
                                    </label>
                                    <input
                                        value={mutasiForm.keterangan}
                                        onChange={(e) => setMutasiForm({ ...mutasiForm, keterangan: e.target.value })}
                                        placeholder="Alasan penyesuaian stok / keterangan mutasi"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowMutasi(false)}
                                        className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isMutasiSaving}
                                        className="rounded-xl bg-[#115e59] hover:bg-[#0f4a47] px-5 py-2 font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                                    >
                                        {isMutasiSaving ? 'Memproses...' : 'Proses Mutasi'}
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