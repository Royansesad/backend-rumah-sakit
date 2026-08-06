import { Layout } from '@/components/layout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Patient {
    id: string;
    nama_lengkap: string;
    nomor_rekam_medis: string;
    alergi?: string;
    kondisi_terakhir?: string;
}

interface Dokter {
    id: string;
    nama_lengkap: string;
    spesialisasi?: string;
}

interface Perawat {
    id: string;
    nama_lengkap: string;
}

interface Poli {
    id: string;
    nama_poli: string;
}

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    bentuk_sediaan: string;
    stok: number;
    harga: number;
}

interface Icd10Code {
    id: number;
    code: string;
    description: string;
    category?: string;
}

interface ResepDetail {
    id: number;
    obat: Obat;
    aturan_pakai: string;
    jumlah_dosis: number;
    catatan?: string;
}

interface Resep {
    id: string;
    no_resep: string;
    status: 'menunggu_ditebus' | 'sudah_ditebus';
    created_at: string;
    pasien: Patient;
    dokter?: Dokter;
    details: ResepDetail[];
}

interface RekamMedis {
    id: string;
    sistol?: number;
    diastol?: number;
    suhu_tubuh?: number;
    denyut_nadi?: number;
    spo2?: number;
    kondisi_pasien?: 'stabil' | 'perlu_perhatian' | 'kritis';
    catatan_keperawatan?: string;
    keluhan_utama: string;
    icd10_code?: string;
    diagnosis_deskripsi?: string;
    catatan_dokter?: string;
    status: 'draft' | 'final';
    finalized_at?: string;
    created_at: string;
    pasien: Patient;
    dokter?: Dokter;
    perawat?: Perawat;
    poli?: Poli;
    resep?: Resep;
}

interface RmePageProps {
    user: any;
    role: any;
    pasiens: Patient[];
    dokters: Dokter[];
    perawats: Perawat[];
    polis: Poli[];
    obats: Obat[];
    icd10Codes: Icd10Code[];
    rekamMedisList: RekamMedis[];
    resepsList: Resep[];
}

export default function RmeIndex({
    user,
    role = 'admin',
    pasiens = [],
    dokters = [],
    perawats = [],
    polis = [],
    obats = [],
    icd10Codes = [],
    rekamMedisList = [],
    resepsList = [],
}: RmePageProps) {
    const [activeTab, setActiveTab] = useState<'monitoring' | 'input' | 'resep' | 'master'>('monitoring');

    // Role Permission Checks
    const canInputRme = ['admin', 'dokter', 'perawat'].includes(role);
    const canCreateResep = ['admin', 'dokter'].includes(role);
    const canTebusResep = ['admin', 'apoteker'].includes(role);
    const canFinalizeRme = ['admin', 'dokter'].includes(role);
    const [selectedPasienId, setSelectedPasienId] = useState<string>(pasiens[0]?.id || '');
    const [loading, setLoading] = useState(false);
    const [apiSuccess, setApiSuccess] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    // Form states for Input RME
    const [formData, setFormData] = useState({
        pasien_id: pasiens[0]?.id || '',
        dokter_id: dokters[0]?.id || '',
        perawat_id: perawats[0]?.id || '',
        poli_id: polis[0]?.id || '',
        sistol: 120,
        diastol: 80,
        suhu_tubuh: 36.5,
        denyut_nadi: 80,
        spo2: 98,
        kondisi_pasien: 'stabil' as 'stabil' | 'perlu_perhatian' | 'kritis',
        catatan_keperawatan: '',
        keluhan_utama: '',
        icd10_code: icd10Codes[0]?.code || 'J06.9',
        diagnosis_deskripsi: '',
        catatan_dokter: '',
    });

    // Form states for Resep
    const [resepFormData, setResepFormData] = useState({
        pasien_id: pasiens[0]?.id || '',
        dokter_id: dokters[0]?.id || '',
        rekam_medis_id: rekamMedisList[0]?.id || '',
        details: [
            {
                obat_id: obats[0]?.id || 1,
                aturan_pakai: '3x1 sesudah makan',
                jumlah_dosis: 10,
                catatan: '',
            },
        ],
    });

    // Filter states
    const [searchIcd, setSearchIcd] = useState('');
    const [searchObat, setSearchObat] = useState('');

    const selectedPasien = pasiens.find((p) => p.id === selectedPasienId) || pasiens[0];
    const pasienRmeHistory = rekamMedisList.filter((r) => r.pasien?.id === selectedPasienId);
    const latestMonitoring = pasienRmeHistory[0];

    const showNotification = (msg: string, isError = false) => {
        if (isError) {
            setApiError(msg);
            setApiSuccess(null);
        } else {
            setApiSuccess(msg);
            setApiError(null);
        }
        setTimeout(() => {
            setApiSuccess(null);
            setApiError(null);
        }, 5000);
    };

    // Handle Submit RME Baru
    const handleSubmitRme = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/v1/rekam-medis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                showNotification('✅ Rekam Medis Elektronik (RME) berhasil dibuat!');
                router.reload();
            } else {
                showNotification(`❌ Error: ${result.message || 'Gagal menyimpan RME'}`, true);
            }
        } catch (err: any) {
            showNotification(`❌ Connection Error: ${err.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    // Handle Finalize RME
    const handleFinalizeRme = async (id: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/rekam-medis/${id}/finalize`, {
                method: 'PATCH',
                headers: { Accept: 'application/json' },
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                showNotification('🔒 Rekam Medis berhasil difinalisasi!');
                router.reload();
            } else {
                showNotification(`❌ Error: ${result.message}`, true);
            }
        } catch (err: any) {
            showNotification(`❌ Error: ${err.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    // Handle Submit Resep Baru
    const handleSubmitResep = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/v1/resep', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(resepFormData),
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                showNotification('✅ Resep Digital berhasil diterbitkan!');
                router.reload();
            } else {
                showNotification(`❌ Error: ${result.message}`, true);
            }
        } catch (err: any) {
            showNotification(`❌ Connection Error: ${err.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    // Handle Tebus Resep (Kurangi Stok)
    const handleTebusResep = async (id: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/resep/${id}/tebus`, {
                method: 'PATCH',
                headers: { Accept: 'application/json' },
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                showNotification('💊 Resep berhasil ditebus! Stok obat otomatis berkurang.');
                router.reload();
            } else {
                showNotification(`❌ Gagal Tebus Resep: ${result.message}`, true);
            }
        } catch (err: any) {
            showNotification(`❌ Error: ${err.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    const addResepItem = () => {
        setResepFormData({
            ...resepFormData,
            details: [
                ...resepFormData.details,
                { obat_id: obats[0]?.id || 1, aturan_pakai: '3x1 sesudah makan', jumlah_dosis: 10, catatan: '' },
            ],
        });
    };

    const removeResepItem = (index: number) => {
        if (resepFormData.details.length <= 1) return;
        const newDetails = resepFormData.details.filter((_, i) => i !== index);
        setResepFormData({ ...resepFormData, details: newDetails });
    };

    const filteredIcd = icd10Codes.filter(
        (i) => i.code.toLowerCase().includes(searchIcd.toLowerCase()) || i.description.toLowerCase().includes(searchIcd.toLowerCase())
    );

    const filteredObat = obats.filter(
        (o) => o.nama_obat.toLowerCase().includes(searchObat.toLowerCase()) || o.kode_obat.toLowerCase().includes(searchObat.toLowerCase())
    );

    return (
        <Layout user={user} role={role}>
            <Head title="Rekam Medis Elektronik (RME) Lokal" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-emerald-500 p-6 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300 backdrop-blur-md">
                                    100% Modul RME Lokal
                                </span>
                                <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                                    Standar ICD-10
                                </span>
                            </div>
                            <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
                                Rekam Medis Elektronik (RME) & Resep Digital
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-teal-100/80">
                                Monitoring vital signs pasien, pencatatan RME oleh Dokter & Perawat, serta penerbitan dan penebusan resep digital secara real-time.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium backdrop-blur-md">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                System API Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Toast Notification */}
                {apiSuccess && (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 shadow-sm animate-fade-in">
                        <div className="flex items-center gap-2 text-sm font-semibold">{apiSuccess}</div>
                    </div>
                )}
                {apiError && (
                    <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-800 shadow-sm animate-fade-in">
                        <div className="flex items-center gap-2 text-sm font-semibold">{apiError}</div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-gray-200 bg-white p-2 rounded-xl shadow-sm">
                    <button
                        onClick={() => setActiveTab('monitoring')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                            activeTab === 'monitoring'
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        📊 <span>Monitoring Vitals</span>
                    </button>

                    {canInputRme && (
                        <button
                            onClick={() => setActiveTab('input')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                                activeTab === 'input'
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            🩺 <span>Input RME Baru</span>
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('resep')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                            activeTab === 'resep'
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        💊 <span>Resep Digital & Tebus</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('master')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                            activeTab === 'master'
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        📖 <span>Katalog Obat & ICD-10</span>
                    </button>
                </div>

                {/* TAB 1: MONITORING VITALS */}
                {activeTab === 'monitoring' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Selector Pasien */}
                        <div className="space-y-4 lg:col-span-1">
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase">Pilih Pasien</h3>
                                <div className="mt-3 space-y-2">
                                    {pasiens.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPasienId(p.id)}
                                            className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                                                selectedPasienId === p.id
                                                    ? 'border-2 border-teal-500 bg-teal-50 shadow-sm'
                                                    : 'border border-gray-100 bg-gray-50 hover:bg-gray-100'
                                            }`}
                                        >
                                            <div>
                                                <div className="font-semibold text-gray-900">{p.nama_lengkap}</div>
                                                <div className="text-xs text-gray-500">{p.nomor_rekam_medis}</div>
                                            </div>
                                            {p.kondisi_terakhir && (
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                        p.kondisi_terakhir === 'kritis'
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : p.kondisi_terakhir === 'perlu_perhatian'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-emerald-100 text-emerald-700'
                                                    }`}
                                                >
                                                    {p.kondisi_terakhir}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Patient Info Card */}
                            {selectedPasien && (
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900">Profil Medis Pasien</h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-gray-500">Nama:</span>
                                            <span className="font-medium text-gray-900">{selectedPasien.nama_lengkap}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-gray-500">No RM:</span>
                                            <span className="font-medium text-gray-900">{selectedPasien.nomor_rekam_medis}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-gray-500">Riwayat Alergi:</span>
                                            <span className="font-medium text-rose-600">{selectedPasien.alergi || 'Tidak ada'}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-gray-500">Kondisi Terakhir:</span>
                                            <span className="font-bold text-teal-700 uppercase">{selectedPasien.kondisi_terakhir || 'stabil'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Monitoring Vitals Cards */}
                        <div className="space-y-6 lg:col-span-2">
                            {latestMonitoring ? (
                                <>
                                    {/* Alert Banner if needed */}
                                    {latestMonitoring.kondisi_pasien === 'kritis' && (
                                        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-800 shadow-sm animate-bounce">
                                            <div className="font-bold">⚠️ PERINGATAN KRITIS: Pasien memerlukan penanganan medis darurat!</div>
                                        </div>
                                    )}

                                    {/* Vital Signs Grid */}
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">Pemeriksaan Vital Signs Terkini</h2>
                                                <p className="text-xs text-gray-500">Waktu: {new Date(latestMonitoring.created_at).toLocaleString('id-ID')}</p>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                                                    latestMonitoring.kondisi_pasien === 'kritis'
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : latestMonitoring.kondisi_pasien === 'perlu_perhatian'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                }`}
                                            >
                                                Status: {latestMonitoring.kondisi_pasien || 'stabil'}
                                            </span>
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-center">
                                                <div className="text-xs font-semibold text-teal-600 uppercase">Tekanan Darah</div>
                                                <div className="mt-1 text-xl font-black text-gray-900">
                                                    {latestMonitoring.sistol || '-'}/{latestMonitoring.diastol || '-'}
                                                </div>
                                                <div className="text-[10px] text-gray-500">mmHg</div>
                                            </div>
                                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
                                                <div className="text-xs font-semibold text-emerald-600 uppercase">Suhu Tubuh</div>
                                                <div className="mt-1 text-xl font-black text-gray-900">{latestMonitoring.suhu_tubuh || '-'} °C</div>
                                                <div className="text-[10px] text-gray-500">Celcius</div>
                                            </div>
                                            <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 text-center">
                                                <div className="text-xs font-semibold text-cyan-600 uppercase">Denyut Nadi</div>
                                                <div className="mt-1 text-xl font-black text-gray-900">{latestMonitoring.denyut_nadi || '-'}</div>
                                                <div className="text-[10px] text-gray-500">bpm</div>
                                            </div>
                                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-center">
                                                <div className="text-xs font-semibold text-indigo-600 uppercase">Satuan SpO2</div>
                                                <div className="mt-1 text-xl font-black text-gray-900">{latestMonitoring.spo2 || '-'}%</div>
                                                <div className="text-[10px] text-gray-500">Oksigen</div>
                                            </div>
                                        </div>

                                        {latestMonitoring.catatan_keperawatan && (
                                            <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
                                                <span className="font-semibold">Catatan Perawat:</span> {latestMonitoring.catatan_keperawatan}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline Pemeriksaan Pasien */}
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                                        <h3 className="text-base font-bold text-gray-900">Riwayat Timeline Rekam Medis Pasien</h3>
                                        <div className="space-y-4">
                                            {pasienRmeHistory.map((rme) => (
                                                <div key={rme.id} className="relative border-l-2 border-teal-500 pl-4 space-y-1 pb-4">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-bold text-gray-900">{rme.keluhan_utama}</span>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                rme.status === 'final' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                            }`}
                                                        >
                                                            {rme.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-teal-700">
                                                        Diagnosis: <span className="font-semibold">{rme.icd10_code || '-'}</span> - {rme.diagnosis_deskripsi || '-'}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500">
                                                        Dokter: {rme.dokter?.nama_lengkap || '-'} | Poli: {rme.poli?.nama_poli || '-'}
                                                    </div>
                                                    {rme.status === 'draft' && canFinalizeRme && (
                                                        <button
                                                            onClick={() => handleFinalizeRme(rme.id)}
                                                            disabled={loading}
                                                            className="mt-2 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                                                        >
                                                            Finalisasi RME
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                                    Belum ada data Rekam Medis untuk pasien ini. Silakan buat di tab "Input RME Baru".
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: INPUT RME BARU */}
                {activeTab === 'input' && (
                    <form onSubmit={handleSubmitRme} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="border-b pb-4">
                            <h2 className="text-lg font-bold text-gray-900">Form Input Rekam Medis Elektronik (RME)</h2>
                            <p className="text-xs text-gray-500">Pengisian data vital signs perawat & hasil pemeriksaan medis dokter.</p>
                        </div>

                        {/* Dropdown Aktor */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">Pasien</label>
                                <select
                                    value={formData.pasien_id}
                                    onChange={(e) => setFormData({ ...formData, pasien_id: e.target.value })}
                                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-teal-500 focus:outline-none"
                                >
                                    {pasiens.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama_lengkap} ({p.nomor_rekam_medis})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">Dokter</label>
                                <select
                                    value={formData.dokter_id}
                                    onChange={(e) => setFormData({ ...formData, dokter_id: e.target.value })}
                                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-teal-500 focus:outline-none"
                                >
                                    {dokters.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama_lengkap} ({d.spesialisasi || 'Umum'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">Perawat (Pemeriksa Vitals)</label>
                                <select
                                    value={formData.perawat_id}
                                    onChange={(e) => setFormData({ ...formData, perawat_id: e.target.value })}
                                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-teal-500 focus:outline-none"
                                >
                                    {perawats.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama_lengkap}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">Poli / Unit</label>
                                <select
                                    value={formData.poli_id}
                                    onChange={(e) => setFormData({ ...formData, poli_id: e.target.value })}
                                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-teal-500 focus:outline-none"
                                >
                                    {polis.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama_poli}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Vital Signs Section */}
                        <div className="rounded-xl bg-teal-50/60 p-4 border border-teal-100 space-y-3">
                            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wide">Pemeriksaan Vital Signs (Perawat)</h3>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-600">Sistol (mmHg)</label>
                                    <input
                                        type="number"
                                        value={formData.sistol}
                                        onChange={(e) => setFormData({ ...formData, sistol: Number(e.target.value) })}
                                        className="mt-1 w-full rounded-lg border bg-white p-2 text-xs font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-600">Diastol (mmHg)</label>
                                    <input
                                        type="number"
                                        value={formData.diastol}
                                        onChange={(e) => setFormData({ ...formData, diastol: Number(e.target.value) })}
                                        className="mt-1 w-full rounded-lg border bg-white p-2 text-xs font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-600">Suhu (°C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.suhu_tubuh}
                                        onChange={(e) => setFormData({ ...formData, suhu_tubuh: Number(e.target.value) })}
                                        className="mt-1 w-full rounded-lg border bg-white p-2 text-xs font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-600">Denyut Nadi (bpm)</label>
                                    <input
                                        type="number"
                                        value={formData.denyut_nadi}
                                        onChange={(e) => setFormData({ ...formData, denyut_nadi: Number(e.target.value) })}
                                        className="mt-1 w-full rounded-lg border bg-white p-2 text-xs font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-600">SpO2 (%)</label>
                                    <input
                                        type="number"
                                        value={formData.spo2}
                                        onChange={(e) => setFormData({ ...formData, spo2: Number(e.target.value) })}
                                        className="mt-1 w-full rounded-lg border bg-white p-2 text-xs font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-600">Kondisi Pasien</label>
                                    <select
                                        value={formData.kondisi_pasien}
                                        onChange={(e) => setFormData({ ...formData, kondisi_pasien: e.target.value as any })}
                                        className="mt-1 w-full rounded-lg border bg-white p-2 text-xs font-bold text-gray-900"
                                    >
                                        <option value="stabil">Stabil</option>
                                        <option value="perlu_perhatian">Perlu Perhatian</option>
                                        <option value="kritis">Kritis</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-gray-600">Catatan Keperawatan</label>
                                <textarea
                                    rows={2}
                                    value={formData.catatan_keperawatan}
                                    onChange={(e) => setFormData({ ...formData, catatan_keperawatan: e.target.value })}
                                    placeholder="Catatan observasi perawat..."
                                    className="mt-1 w-full rounded-lg border bg-white p-2 text-xs text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Pemeriksaan Dokter Section */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Pemeriksaan & Diagnosa Dokter</h3>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700">Keluhan Utama *</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.keluhan_utama}
                                    onChange={(e) => setFormData({ ...formData, keluhan_utama: e.target.value })}
                                    placeholder="Deskripsi keluhan pasien saat datang..."
                                    className="mt-1 w-full rounded-lg border p-2 text-xs text-gray-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">Kode ICD-10 Diagnosa</label>
                                    <select
                                        value={formData.icd10_code}
                                        onChange={(e) => {
                                            const code = e.target.value;
                                            const icd = icd10Codes.find((i) => i.code === code);
                                            setFormData({
                                                ...formData,
                                                icd10_code: code,
                                                diagnosis_deskripsi: icd ? icd.description : formData.diagnosis_deskripsi,
                                            });
                                        }}
                                        className="mt-1 w-full rounded-lg border p-2 text-xs text-gray-900 font-semibold"
                                    >
                                        {icd10Codes.map((i) => (
                                            <option key={i.id} value={i.code}>
                                                {i.code} - {i.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">Deskripsi Diagnosa Detail</label>
                                    <input
                                        type="text"
                                        value={formData.diagnosis_deskripsi}
                                        onChange={(e) => setFormData({ ...formData, diagnosis_deskripsi: e.target.value })}
                                        placeholder="Keterangan diagnosa medis..."
                                        className="mt-1 w-full rounded-lg border p-2 text-xs text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700">Catatan / Tindakan Dokter</label>
                                <textarea
                                    rows={2}
                                    value={formData.catatan_dokter}
                                    onChange={(e) => setFormData({ ...formData, catatan_dokter: e.target.value })}
                                    placeholder="Tindakan medis yang dilakukan..."
                                    className="mt-1 w-full rounded-lg border p-2 text-xs text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-all"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan RME (Draft)'}
                            </button>
                        </div>
                    </form>
                )}

                {/* TAB 3: RESEP DIGITAL & TEBUS */}
                {activeTab === 'resep' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Form Terbitkan Resep */}
                        <form onSubmit={handleSubmitResep} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                            <div className="border-b pb-3">
                                <h2 className="text-lg font-bold text-gray-900">Terbitkan Resep Digital Baru</h2>
                                <p className="text-xs text-gray-500">Resep langsung terhubung dengan data Rekam Medis pasien.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">Pasien</label>
                                    <select
                                        value={resepFormData.pasien_id}
                                        onChange={(e) => setResepFormData({ ...resepFormData, pasien_id: e.target.value })}
                                        className="mt-1 w-full rounded-lg border p-2 text-xs text-gray-900"
                                    >
                                        {pasiens.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_lengkap}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">Dokter Penulis Resep</label>
                                    <select
                                        value={resepFormData.dokter_id}
                                        onChange={(e) => setResepFormData({ ...resepFormData, dokter_id: e.target.value })}
                                        className="mt-1 w-full rounded-lg border p-2 text-xs text-gray-900"
                                    >
                                        {dokters.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.nama_lengkap}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Detail Obat List */}
                            <div className="space-y-3 border-t pt-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-gray-800 uppercase">Daftar Obat Resep</h4>
                                    <button
                                        type="button"
                                        onClick={addResepItem}
                                        className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                                    >
                                        + Tambah Obat
                                    </button>
                                </div>

                                {resepFormData.details.map((item, idx) => (
                                    <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                                            <span>Obat #{idx + 1}</span>
                                            {resepFormData.details.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeResepItem(idx)}
                                                    className="text-rose-600 hover:underline text-[10px]"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            <div className="sm:col-span-2">
                                                <label className="block text-[10px] text-gray-500">Pilih Obat</label>
                                                <select
                                                    value={item.obat_id}
                                                    onChange={(e) => {
                                                        const newDetails = [...resepFormData.details];
                                                        newDetails[idx].obat_id = Number(e.target.value);
                                                        setResepFormData({ ...resepFormData, details: newDetails });
                                                    }}
                                                    className="mt-0.5 w-full rounded-lg border bg-white p-1.5 text-xs text-gray-900"
                                                >
                                                    {obats.map((o) => (
                                                        <option key={o.id} value={o.id}>
                                                            {o.nama_obat} (Stok: {o.stok} | Rp {o.harga.toLocaleString()})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500">Jumlah Dosis</label>
                                                <input
                                                    type="number"
                                                    value={item.jumlah_dosis}
                                                    onChange={(e) => {
                                                        const newDetails = [...resepFormData.details];
                                                        newDetails[idx].jumlah_dosis = Number(e.target.value);
                                                        setResepFormData({ ...resepFormData, details: newDetails });
                                                    }}
                                                    className="mt-0.5 w-full rounded-lg border bg-white p-1.5 text-xs text-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-[10px] text-gray-500">Aturan Pakai</label>
                                                <input
                                                    type="text"
                                                    value={item.aturan_pakai}
                                                    onChange={(e) => {
                                                        const newDetails = [...resepFormData.details];
                                                        newDetails[idx].aturan_pakai = e.target.value;
                                                        setResepFormData({ ...resepFormData, details: newDetails });
                                                    }}
                                                    placeholder="Contoh: 3x1 sesudah makan"
                                                    className="mt-0.5 w-full rounded-lg border bg-white p-1.5 text-xs text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500">Catatan Tambahan</label>
                                                <input
                                                    type="text"
                                                    value={item.catatan}
                                                    onChange={(e) => {
                                                        const newDetails = [...resepFormData.details];
                                                        newDetails[idx].catatan = e.target.value;
                                                        setResepFormData({ ...resepFormData, details: newDetails });
                                                    }}
                                                    placeholder="Opsional..."
                                                    className="mt-0.5 w-full rounded-lg border bg-white p-1.5 text-xs text-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700"
                            >
                                {loading ? 'Memproses...' : 'Terbitkan Resep Digital'}
                            </button>
                        </form>

                        {/* List Resep & Action Tebus */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                            <div className="border-b pb-3">
                                <h2 className="text-lg font-bold text-gray-900">Daftar Riwayat Resep</h2>
                                <p className="text-xs text-gray-500">Apoteker dapat melakukan penebusan obat real-time.</p>
                            </div>

                            <div className="space-y-4">
                                {resepsList.map((r) => (
                                    <div key={r.id} className="rounded-xl border border-gray-200 p-4 space-y-2">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <span className="font-bold text-sm text-gray-900">{r.no_resep}</span>
                                                <div className="text-[11px] text-gray-500">Pasien: {r.pasien?.nama_lengkap}</div>
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                                    r.status === 'sudah_ditebus' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {r.status === 'sudah_ditebus' ? 'Sudah Ditebus' : 'Menunggu Ditebus'}
                                            </span>
                                        </div>

                                        {/* Detail obat */}
                                        <div className="space-y-1 text-xs">
                                            {r.details?.map((d) => (
                                                <div key={d.id} className="flex justify-between text-gray-700">
                                                    <span>
                                                        • <span className="font-semibold">{d.obat?.nama_obat}</span> ({d.jumlah_dosis} {d.obat?.bentuk_sediaan})
                                                    </span>
                                                    <span className="text-gray-500 italic">{d.aturan_pakai}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {r.status === 'menunggu_ditebus' && canTebusResep && (
                                            <button
                                                onClick={() => handleTebusResep(r.id)}
                                                disabled={loading}
                                                className="mt-2 w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                                            >
                                                💊 Tebus Resep Sekarang (Kurangi Stok Obat)
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: KATALOG OBAT & ICD-10 */}
                {activeTab === 'master' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Master Obat */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Katalog Obat Farmasi</h2>
                                    <p className="text-xs text-gray-500">Stok obat terhubung langsung dengan sistem resep digital.</p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari obat..."
                                    value={searchObat}
                                    onChange={(e) => setSearchObat(e.target.value)}
                                    className="rounded-lg border px-3 py-1 text-xs"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-gray-700">
                                    <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                                        <tr>
                                            <th className="p-2">Kode</th>
                                            <th className="p-2">Nama Obat</th>
                                            <th className="p-2">Sediaan</th>
                                            <th className="p-2">Stok</th>
                                            <th className="p-2">Harga</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredObat.map((o) => (
                                            <tr key={o.id} className="hover:bg-gray-50">
                                                <td className="p-2 font-mono font-bold text-teal-700">{o.kode_obat}</td>
                                                <td className="p-2 font-semibold text-gray-900">{o.nama_obat}</td>
                                                <td className="p-2 text-gray-500">{o.bentuk_sediaan}</td>
                                                <td className="p-2">
                                                    <span className={`font-bold ${o.stok < 50 ? 'text-rose-600' : 'text-emerald-600'}`}>{o.stok}</span>
                                                </td>
                                                <td className="p-2">Rp {Number(o.harga).toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Kode ICD-10 */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Referensi Kode ICD-10</h2>
                                    <p className="text-xs text-gray-500">Standar pengkodean penyakit internasional.</p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari kode/deskripsi..."
                                    value={searchIcd}
                                    onChange={(e) => setSearchIcd(e.target.value)}
                                    className="rounded-lg border px-3 py-1 text-xs"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-gray-700">
                                    <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                                        <tr>
                                            <th className="p-2">Kode ICD-10</th>
                                            <th className="p-2">Deskripsi Diagnosa</th>
                                            <th className="p-2">Kategori</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredIcd.map((i) => (
                                            <tr key={i.id} className="hover:bg-gray-50">
                                                <td className="p-2 font-mono font-bold text-indigo-700">{i.code}</td>
                                                <td className="p-2 font-medium text-gray-900">{i.description}</td>
                                                <td className="p-2 text-gray-500">{i.category || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
