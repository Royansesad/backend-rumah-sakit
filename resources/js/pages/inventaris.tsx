import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';

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
    status_stok: 'aman' | 'menipis' | 'habis';
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

interface InventarisProps {
    user: any;
    role: Role;
    items: InventoryItem[];
    kategori: RefOption[];
    gudang: RefOption[];
    supplier: RefOption[];
    kpi: { total_barang: number; barang_habis: number; barang_kritis: number; total_nilai_stok: number };
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

const formatRupiah = (val: number) => 'Rp ' + (val || 0).toLocaleString('id-ID');

const emptyForm = () => ({
    kode_barang: '',
    nama_barang: '',
    inventory_category_id: '',
    satuan: 'pcs',
    stok_minimum: 0,
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
    items,
    kategori,
    gudang,
    supplier,
    kpi,
    filters,
}: InventarisProps) {
    const [search, setSearch] = useState(filters.search);
    const [kondisi, setKondisi] = useState(filters.kondisi);
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
    const [movements, setMovements] = useState<Movement[]>([]);
    const [showMutasi, setShowMutasi] = useState(false);
    const [mutasiForm, setMutasiForm] = useState({ tipe: 'masuk', qty: 1, referensi: '', keterangan: '' });
    const [isMutasiSaving, setIsMutasiSaving] = useState(false);

    const notify = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const applyFilter = (overrides: Partial<{ search: string; kondisi: string; kategori: string }>) => {
        const params: Record<string, string> = {
            search: overrides.search ?? search,
            kondisi: overrides.kondisi ?? kondisi,
            kategori: overrides.kategori ?? kategoriFilter,
        };
        const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
        router.get('/inventaris', clean, { preserveState: true, preserveScroll: true });
    };

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
            harga_beli: item.harga_beli,
            harga_jual: item.harga_jual,
            warehouse_id: item.warehouse_id || '',
            supplier_id: item.supplier_id || '',
            masa_berlaku: item.masa_berlaku || '',
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
                router.reload({ preserveState: true, preserveScroll: true });
            } else {
                notify(res.message || 'Gagal menyimpan barang.', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const openDetail = async (item: InventoryItem) => {
        setDetailItem(item);
        const res = await apiCall(`/api/v1/inventaris/${item.id}`, 'GET');
        if (res.status === 'success') {
            setMovements(res.data.mutasi || []);
        } else {
            setMovements([]);
        }
    };

    const openMutasi = (item: InventoryItem) => {
        setDetailItem(item);
        setMutasiForm({ tipe: 'masuk', qty: 1, referensi: '', keterangan: '' });
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
                router.reload({ preserveState: true, preserveScroll: true });
            } else {
                notify(res.message || 'Gagal memproses mutasi.', 'error');
            }
        } finally {
            setIsMutasiSaving(false);
        }
    };

    const handleDelete = async (item: InventoryItem) => {
        if (!window.confirm(`Hapus barang '${item.nama_barang}' (${item.kode_barang})?`)) return;
        const res = await apiCall(`/api/v1/inventaris/${item.id}`, 'DELETE');
        notify(res.message, res.status === 'success' ? 'success' : 'error');
        if (res.status === 'success') router.reload({ preserveState: true, preserveScroll: true });
    };

    const statusBadge = (status: string) => {
        if (status === 'habis') return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">● Habis</span>;
        if (status === 'menipis') return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">● Menipis</span>;
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">● Aman</span>;
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
            <div className="space-y-6 bg-slate-50 min-h-screen p-2 sm:p-4">
                {toast && (
                    <div className={`fixed top-5 right-5 z-50 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl ${toast.type === 'success' ? 'bg-emerald-700' : 'bg-rose-700'}`}>
                        {toast.message}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0d4f42] tracking-tight">Manajemen Inventaris</h1>
                            <span className="bg-[#e4f6f2] text-[#0d4f42] text-xs font-bold px-3 py-1 rounded-full border border-[#145e5b]/20">SIMRS Inventory</span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">Pengelolaan persediaan barang habis pakai, mutasi stok, dan kontrol stok minimum.</p>
                        <button onClick={() => router.get('/dashboard')} className="mt-3 text-xs font-bold text-[#145e5b] hover:underline">← Kembali ke Dashboard</button>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 bg-[#0d4f42] hover:bg-[#145e5b] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-[#0d4f42]/20">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Tambah Barang
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500">Total Barang</p>
                        <p className="mt-2 text-3xl font-extrabold text-gray-900">{kpi.total_barang}</p>
                        <p className="mt-1 text-[11px] text-teal-600 font-semibold">Item terdaftar aktif</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500">Nilai Total Stok</p>
                        <p className="mt-2 text-3xl font-extrabold text-[#0d4f42]">{formatRupiah(kpi.total_nilai_stok)}</p>
                        <p className="mt-1 text-[11px] text-slate-500">Berdasarkan harga beli</p>
                    </div>
                    <button onClick={() => applyFilter({ kondisi: 'kritis' })} className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm text-left hover:shadow-md transition-all">
                        <p className="text-xs font-semibold text-amber-600">Stok Menipis</p>
                        <p className="mt-2 text-3xl font-extrabold text-amber-700">{kpi.barang_kritis}</p>
                        <p className="mt-1 text-[11px] text-amber-500">≤ stok minimum</p>
                    </button>
                    <button onClick={() => applyFilter({ kondisi: 'habis' })} className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm text-left hover:shadow-md transition-all">
                        <p className="text-xs font-semibold text-rose-600">Stok Habis</p>
                        <p className="mt-2 text-3xl font-extrabold text-rose-700">{kpi.barang_habis}</p>
                        <p className="mt-1 text-[11px] text-rose-500">Perlu restock</p>
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
                            placeholder="Cari kode / nama barang..."
                            className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-xs font-medium focus:border-teal-700 focus:outline-none"
                        />
                    </div>
                    <select value={kategoriFilter} onChange={(e) => { setKategoriFilter(e.target.value); applyFilter({ kategori: e.target.value }); }} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:border-teal-700 focus:outline-none">
                        <option value="all">Semua Kategori</option>
                        {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
                    </select>
                    <select value={kondisi} onChange={(e) => { setKondisi(e.target.value); applyFilter({ kondisi: e.target.value }); }} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:border-teal-700 focus:outline-none">
                        <option value="all">Semua Kondisi</option>
                        <option value="aman">Aman</option>
                        <option value="kritis">Menipis</option>
                        <option value="habis">Habis</option>
                    </select>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-bold text-gray-800">Daftar Barang ({items.length})</h3>
                        <span className="text-xs text-slate-400">Klik baris untuk kartu stok</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 font-semibold">
                                <tr>
                                    <th className="p-3.5">Kode / Barang</th>
                                    <th className="p-3.5">Kategori</th>
                                    <th className="p-3.5">Gudang</th>
                                    <th className="p-3.5">Stok</th>
                                    <th className="p-3.5">Harga Beli</th>
                                    <th className="p-3.5">Harga Jual</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.length > 0 ? items.map((item) => (
                                    <tr key={item.id} onClick={() => openDetail(item)} className="cursor-pointer hover:bg-teal-50/40 transition-colors">
                                        <td className="p-3.5">
                                            <div className="font-bold text-gray-900">{item.nama_barang}</div>
                                            <div className="text-[11px] text-gray-400">{item.kode_barang}</div>
                                        </td>
                                        <td className="p-3.5 text-gray-600">{item.category?.nama_kategori || '-'}</td>
                                        <td className="p-3.5 text-gray-600">{item.warehouse?.nama_gudang || '-'}</td>
                                        <td className="p-3.5">
                                            <span className="font-extrabold text-gray-900">{item.stok_saat_ini} <span className="font-medium text-gray-400">{item.satuan}</span></span>
                                            <div className="text-[11px] text-gray-400">Min: {item.stok_minimum}</div>
                                        </td>
                                        <td className="p-3.5 font-semibold text-gray-800">{formatRupiah(item.harga_beli)}</td>
                                        <td className="p-3.5 font-semibold text-gray-800">{formatRupiah(item.harga_jual)}</td>
                                        <td className="p-3.5">{statusBadge(item.status_stok)}</td>
                                        <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => openMutasi(item)} className="rounded-lg bg-teal-100 text-teal-800 px-2.5 py-1.5 text-[11px] font-bold hover:bg-teal-200">Mutasi</button>
                                            <button onClick={() => openEdit(item)} className="rounded-lg bg-slate-100 text-gray-700 px-2.5 py-1.5 text-[11px] font-bold hover:bg-slate-200 ml-1.5">Edit</button>
                                            <button onClick={() => handleDelete(item)} className="rounded-lg bg-rose-50 text-rose-700 px-2.5 py-1.5 text-[11px] font-bold hover:bg-rose-100 ml-1.5">Hapus</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={8} className="p-8 text-center text-gray-400 font-medium">Tidak ada barang ditemukan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Form Tambah/Edit */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="font-serif text-lg font-bold text-[#0d4f42]">{editId ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">✕</button>
                            </div>
                            <form onSubmit={handleSave} className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Kode Barang *</label>
                                        <input required value={form.kode_barang} onChange={(e) => setForm({ ...form, kode_barang: e.target.value.toUpperCase() })} placeholder="BRG-001" className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Kategori *</label>
                                        <select required value={form.inventory_category_id} onChange={(e) => setForm({ ...form, inventory_category_id: e.target.value })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none">
                                            <option value="">-- Pilih Kategori --</option>
                                            {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Nama Barang *</label>
                                    <input required value={form.nama_barang} onChange={(e) => setForm({ ...form, nama_barang: e.target.value })} placeholder="Contoh: Masker Medis 3 Ply" className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Satuan</label>
                                        <input value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Stok Min.</label>
                                        <input type="number" min={0} value={form.stok_minimum} onChange={(e) => setForm({ ...form, stok_minimum: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Stok Awal</label>
                                        <input type="number" min={0} value={form.stok_awal} onChange={(e) => setForm({ ...form, stok_awal: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Harga Beli (Rp)</label>
                                        <input type="number" min={0} value={form.harga_beli} onChange={(e) => setForm({ ...form, harga_beli: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Harga Jual (Rp)</label>
                                        <input type="number" min={0} value={form.harga_jual} onChange={(e) => setForm({ ...form, harga_jual: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Gudang</label>
                                        <select value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none">
                                            <option value="">-- Tidak ada --</option>
                                            {gudang.map((g) => <option key={g.id} value={g.id}>{g.nama_gudang}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Supplier</label>
                                        <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none">
                                            <option value="">-- Tidak ada --</option>
                                            {supplier.map((s) => <option key={s.id} value={s.id}>{s.nama_supplier}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Masa Berlaku</label>
                                    <input type="date" value={form.masa_berlaku} onChange={(e) => setForm({ ...form, masa_berlaku: e.target.value })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Deskripsi</label>
                                    <textarea rows={2} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-teal-700 focus:outline-none" />
                                </div>
                                <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                    <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
                                    <button type="submit" disabled={isSaving} className="rounded-xl bg-[#0d4f42] px-5 py-2 font-bold text-white shadow-sm hover:bg-[#08382f] disabled:opacity-50">
                                        {isSaving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Barang'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Detail / Kartu Stok */}
                {detailItem && !showMutasi && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-3xl bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#0d4f42]">Kartu Stok — {detailItem.nama_barang}</h3>
                                    <p className="text-[11px] text-gray-400">{detailItem.kode_barang} • {detailItem.category?.nama_kategori || '-'} • Stok: <b className="text-[#0d4f42]">{detailItem.stok_saat_ini} {detailItem.satuan}</b></p>
                                </div>
                                <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-700">✕</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 font-semibold">
                                        <tr>
                                            <th className="p-3">Waktu</th>
                                            <th className="p-3">Tipe</th>
                                            <th className="p-3">Qty</th>
                                            <th className="p-3">Stok Setelah</th>
                                            <th className="p-3">Referensi</th>
                                            <th className="p-3">Operator</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {movements.length > 0 ? movements.map((m) => (
                                            <tr key={m.id}>
                                                <td className="p-3 text-gray-600">{new Date(m.created_at).toLocaleString('id-ID')}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${m.qty >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                                                        {mutasiTipeLabel[m.tipe] || m.tipe}
                                                    </span>
                                                </td>
                                                <td className={`p-3 font-bold ${m.qty >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{m.qty >= 0 ? `+${m.qty}` : m.qty}</td>
                                                <td className="p-3 font-extrabold text-gray-900">{m.stok_setelah}</td>
                                                <td className="p-3 text-gray-600">{m.referensi || '-'}</td>
                                                <td className="p-3 text-gray-500">{m.operator_role || '-'}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={6} className="p-6 text-center text-gray-400">Belum ada mutasi stok.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                <button onClick={() => setDetailItem(null)} className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Tutup</button>
                                <button onClick={() => openMutasi(detailItem)} className="rounded-xl bg-teal-800 px-4 py-2 text-xs font-bold text-white hover:bg-teal-900">+ Catat Mutasi</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Mutasi Stok */}
                {showMutasi && detailItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="font-serif text-lg font-bold text-[#0d4f42]">Mutasi Stok — {detailItem.nama_barang}</h3>
                                <button onClick={() => setShowMutasi(false)} className="text-gray-400 hover:text-gray-700">✕</button>
                            </div>
                            <div className="rounded-xl bg-[#f0faf7] border border-teal-100 p-3 text-xs">
                                Stok saat ini: <b className="text-[#0d4f42]">{detailItem.stok_saat_ini} {detailItem.satuan}</b> • Minimum: {detailItem.stok_minimum}
                            </div>
                            <form onSubmit={handleMutasi} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Tipe Mutasi *</label>
                                    <select value={mutasiForm.tipe} onChange={(e) => setMutasiForm({ ...mutasiForm, tipe: e.target.value })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none">
                                        {Object.entries(mutasiTipeLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Jumlah *</label>
                                    <input required type="number" min={1} value={mutasiForm.qty} onChange={(e) => setMutasiForm({ ...mutasiForm, qty: parseInt(e.target.value, 10) || 1 })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Referensi (No. PO / Resep / Pasien)</label>
                                    <input value={mutasiForm.referensi} onChange={(e) => setMutasiForm({ ...mutasiForm, referensi: e.target.value })} placeholder="PO-008 / RSP-001" className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Keterangan</label>
                                    <input value={mutasiForm.keterangan} onChange={(e) => setMutasiForm({ ...mutasiForm, keterangan: e.target.value })} className="w-full rounded-xl border border-gray-300 p-2.5 font-semibold focus:border-teal-700 focus:outline-none" />
                                </div>
                                <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                    <button type="button" onClick={() => setShowMutasi(false)} className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
                                    <button type="submit" disabled={isMutasiSaving} className="rounded-xl bg-teal-800 px-5 py-2 font-bold text-white shadow-sm hover:bg-teal-900 disabled:opacity-50">
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