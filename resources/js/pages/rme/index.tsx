import { Layout } from '@/components/layout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

interface Patient {
    id: string;
    nama_lengkap: string;
    nomor_rekam_medis: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    golongan_darah?: string;
    alergi?: string;
    kondisi_terakhir?: string;
}

interface Dokter {
    id: string;
    nama_lengkap: string;
    spesialisasi?: string;
    nomor_str?: string;
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
    nie?: string;
    nama_obat: string;
    bentuk_sediaan: string;
    kemasan?: string;
    komposisi?: string;
    pendaftar?: string;
    stok: number;
    harga: number;
    unit_farmasi?: {
        id: number;
        nama_unit: string;
    };
}

interface Icd10Code {
    id: number;
    code: string;
    description: string;
    name_en?: string;
    category?: string;
}

interface ResepDetail {
    id?: number;
    obat_id?: number;
    obat?: Obat;
    aturan_pakai: string;
    jumlah_dosis: number;
    catatan?: string;
}

interface Resep {
    id: string;
    no_resep: string;
    status: 'menunggu_ditebus' | 'sudah_ditebus';
    created_at: string;
    updated_at?: string;
    pasien: Patient;
    dokter?: Dokter;
    rekam_medis_id?: string;
    rekam_medis?: {
        id: string;
        keluhan_utama?: string;
        icd10_code?: string;
        diagnosis_deskripsi?: string;
    };
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

interface DrugSelectorComboboxProps {
    value?: number;
    onChange: (obat: Obat) => void;
    initialObats: Obat[];
    cachedDrugs: Map<number, Obat>;
    onCacheDrug: (drug: Obat) => void;
}

function DrugSelectorCombobox({
    value,
    onChange,
    initialObats,
    cachedDrugs,
    onCacheDrug,
}: DrugSelectorComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Obat[]>(initialObats);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedDrug = (value ? cachedDrugs.get(value) : undefined) || initialObats.find((o) => o.id === value);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Live search query debounce
    useEffect(() => {
        if (!isOpen) return;

        if (!query.trim()) {
            setResults(initialObats);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/v1/obat?search=${encodeURIComponent(query.trim())}&per_page=15`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.status === 'success' && json.data?.data) {
                        setResults(json.data.data);
                        json.data.data.forEach((d: Obat) => onCacheDrug(d));
                    }
                }
            } catch (err) {
                console.error('Error searching drugs:', err);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [query, isOpen, initialObats]);

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full rounded-lg border border-gray-200 bg-white p-2 text-left text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none flex items-center justify-between shadow-2xs hover:border-teal-600 transition-colors"
            >
                <span className="truncate font-medium">
                    {selectedDrug ? (
                        <>
                            <span className="font-semibold text-gray-900">{selectedDrug.nama_obat}</span>
                            {selectedDrug.bentuk_sediaan && (
                                <span className="text-gray-500 text-[11px] ml-1">({selectedDrug.bentuk_sediaan})</span>
                            )}
                            <span className="text-teal-700 text-[11px] font-mono ml-1.5">
                                • Rp {Number(selectedDrug.harga).toLocaleString('id-ID')}
                            </span>
                        </>
                    ) : (
                        <span className="text-gray-400">Pilih / Cari Obat...</span>
                    )}
                </span>
                <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 min-w-[280px]">
                    <div className="relative mb-2">
                        <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-[10px] text-gray-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Cari nama, zat aktif, atau kode obat..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 pl-7 pr-3 py-1.5 text-xs focus:border-[#145e5b] focus:outline-none"
                        />
                        {loading && (
                            <i className="fa-solid fa-spinner fa-spin absolute right-2.5 top-2 text-[10px] text-teal-600" />
                        )}
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1">
                        {results.map((o) => (
                            <button
                                key={o.id}
                                type="button"
                                onClick={() => {
                                    onCacheDrug(o);
                                    onChange(o);
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                                className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                    o.id === value ? 'bg-teal-50 text-[#145e5b] font-semibold' : 'hover:bg-gray-50 text-gray-800'
                                }`}
                            >
                                <div className="truncate pr-2">
                                    <div className="font-semibold text-gray-900 truncate">
                                        {o.nama_obat}
                                        {o.kode_obat && (
                                            <span className="font-mono text-[10px] text-teal-700 ml-1.5">
                                                [{o.kode_obat}]
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-gray-500 truncate">
                                        {o.bentuk_sediaan || '-'}
                                        {o.komposisi ? ` • ${o.komposisi}` : ''}
                                    </div>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                    <div className={`text-[10px] font-bold ${o.stok < 10 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                        Stok: {o.stok}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        Rp {Number(o.harga).toLocaleString('id-ID')}
                                    </div>
                                </div>
                            </button>
                        ))}
                        {results.length === 0 && !loading && (
                            <div className="p-4 text-center text-xs text-gray-400">
                                Tidak ada obat yang cocok.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
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

    // Reactive State Copies for Immediate Feedback & Live Updates
    const [localResepsList, setLocalResepsList] = useState<Resep[]>(resepsList);
    const [localObats, setLocalObats] = useState<Obat[]>(obats);
    const [localRekamMedisList, setLocalRekamMedisList] = useState<RekamMedis[]>(rekamMedisList);

    // Drug metadata cache map for instant lookups
    const [cachedDrugsMap, setCachedDrugsMap] = useState<Map<number, Obat>>(() => {
        const map = new Map<number, Obat>();
        obats.forEach((o) => map.set(o.id, o));
        return map;
    });

    const handleCacheDrug = (drug: Obat) => {
        setCachedDrugsMap((prev) => {
            if (prev.has(drug.id)) return prev;
            const updated = new Map(prev);
            updated.set(drug.id, drug);
            return updated;
        });
    };

    useEffect(() => {
        setLocalResepsList(resepsList);
    }, [resepsList]);

    useEffect(() => {
        setLocalObats(obats);
    }, [obats]);

    useEffect(() => {
        setLocalRekamMedisList(rekamMedisList);
    }, [rekamMedisList]);

    const [selectedPasienId, setSelectedPasienId] = useState<string>(pasiens[0]?.id || '');
    const [selectedHistoricalRmeId, setSelectedHistoricalRmeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [apiSuccess, setApiSuccess] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    // Modal States
    const [detailResepModal, setDetailResepModal] = useState<Resep | null>(null);
    const [tebusConfirmModal, setTebusConfirmModal] = useState<Resep | null>(null);

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
        diagnosis_deskripsi: icd10Codes[0]?.description || '',
        catatan_dokter: '',
    });

    // Form states for Resep
    const [resepFormData, setResepFormData] = useState({
        pasien_id: pasiens[0]?.id || '',
        dokter_id: dokters[0]?.id || '',
        rekam_medis_id: '',
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
    const [obatSediaanFilter, setObatSediaanFilter] = useState('all');
    const [obatStockFilter, setObatStockFilter] = useState<'all' | 'low' | 'safe'>('all');
    const [searchPasien, setSearchPasien] = useState('');
    const [searchPasienTab1, setSearchPasienTab1] = useState('');
    const [resepSearch, setResepSearch] = useState('');
    const [resepStatusFilter, setResepStatusFilter] = useState<string>('all');
    const [resepPage, setResepPage] = useState(1);
    const [resepTanggal, setResepTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [resepCatatan, setResepCatatan] = useState('');
    const [masterSubTab, setMasterSubTab] = useState<'obat' | 'icd'>('obat');

    // States for ICD-10 Search Combobox in Input RME Form
    const comboboxRef = useRef<HTMLDivElement>(null);
    const [icdSearchInput, setIcdSearchInput] = useState('');
    const [icdSearchResults, setIcdSearchResults] = useState<Icd10Code[]>(icd10Codes);
    const [icdSearching, setIcdSearching] = useState(false);
    const [icdDropdownOpen, setIcdDropdownOpen] = useState(false);
    const [dropdownDirection, setDropdownDirection] = useState<'up' | 'down'>('down');

    // States for Master ICD-10 Catalogue Tab
    const [masterIcdPage, setMasterIcdPage] = useState(1);
    const [masterIcdData, setMasterIcdData] = useState<{
        data: Icd10Code[];
        current_page: number;
        last_page: number;
        total: number;
    }>({ data: icd10Codes, current_page: 1, last_page: 1, total: icd10Codes.length });
    const [masterIcdLoading, setMasterIcdLoading] = useState(false);

    // States for Master Obat Catalogue Tab
    const [masterObatPage, setMasterObatPage] = useState(1);
    const [masterObatData, setMasterObatData] = useState<{
        data: Obat[];
        current_page: number;
        last_page: number;
        total: number;
    }>({ data: obats, current_page: 1, last_page: 1, total: obats.length });
    const [masterObatLoading, setMasterObatLoading] = useState(false);

    // Live API search for ICD-10 Combobox in Input RME Form
    useEffect(() => {
        if (!icdSearchInput.trim()) {
            setIcdSearchResults(icd10Codes);
            return;
        }

        const timer = setTimeout(async () => {
            setIcdSearching(true);
            try {
                const res = await fetch(`/api/v1/icd10?search=${encodeURIComponent(icdSearchInput.trim())}&per_page=30`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.status === 'success' && json.data?.data) {
                        setIcdSearchResults(json.data.data);
                    }
                }
            } catch (err) {
                console.error('Error fetching ICD-10 codes:', err);
            } finally {
                setIcdSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [icdSearchInput, icd10Codes]);

    // Live API search & pagination for Katalog ICD-10 Tab
    useEffect(() => {
        if (activeTab !== 'master') return;

        const timer = setTimeout(async () => {
            setMasterIcdLoading(true);
            try {
                const res = await fetch(`/api/v1/icd10?search=${encodeURIComponent(searchIcd.trim())}&page=${masterIcdPage}&per_page=15`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.status === 'success' && json.data) {
                        setMasterIcdData({
                            data: json.data.data,
                            current_page: json.data.current_page,
                            last_page: json.data.last_page,
                            total: json.data.total,
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching master ICD-10:', err);
            } finally {
                setMasterIcdLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchIcd, masterIcdPage, activeTab]);

    // Live API search & pagination for Katalog Obat Tab
    useEffect(() => {
        if (activeTab !== 'master') return;

        const timer = setTimeout(async () => {
            setMasterObatLoading(true);
            try {
                let url = `/api/v1/obat?page=${masterObatPage}&per_page=12`;
                if (searchObat.trim()) {
                    url += `&search=${encodeURIComponent(searchObat.trim())}`;
                }
                if (obatSediaanFilter !== 'all') {
                    url += `&bentuk_sediaan=${encodeURIComponent(obatSediaanFilter)}`;
                }
                if (obatStockFilter !== 'all') {
                    url += `&stock_filter=${encodeURIComponent(obatStockFilter)}`;
                }

                const res = await fetch(url);
                if (res.ok) {
                    const json = await res.json();
                    if (json.status === 'success' && json.data) {
                        setMasterObatData({
                            data: json.data.data || [],
                            current_page: json.data.current_page || 1,
                            last_page: json.data.last_page || 1,
                            total: json.data.total || 0,
                        });
                        if (json.data.data) {
                            json.data.data.forEach((d: Obat) => handleCacheDrug(d));
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching master Obat:', err);
            } finally {
                setMasterObatLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchObat, obatSediaanFilter, obatStockFilter, masterObatPage, activeTab]);

    // Detect available space for ICD combobox
    const updateDropdownDirection = () => {
        if (comboboxRef.current) {
            const rect = comboboxRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow < 280 && spaceAbove > spaceBelow) {
                setDropdownDirection('up');
            } else {
                setDropdownDirection('down');
            }
        }
    };

    useEffect(() => {
        if (!icdDropdownOpen) return;

        updateDropdownDirection();

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
                setIcdDropdownOpen(false);
            }
        };

        const handleScrollOrResize = () => {
            updateDropdownDirection();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        window.addEventListener('resize', handleScrollOrResize);
        window.addEventListener('scroll', handleScrollOrResize, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('resize', handleScrollOrResize);
            window.removeEventListener('scroll', handleScrollOrResize, true);
        };
    }, [icdDropdownOpen]);

    // Sync selected patient with forms and auto-link Rekam Medis
    useEffect(() => {
        if (selectedPasienId) {
            setFormData((prev) => ({ ...prev, pasien_id: selectedPasienId }));

            // Find latest RME of this patient to link resep
            const patientRmes = localRekamMedisList.filter((r) => r.pasien?.id === selectedPasienId);
            const latestRme = patientRmes[0];

            setResepFormData((prev) => ({
                ...prev,
                pasien_id: selectedPasienId,
                rekam_medis_id: latestRme?.id || '',
                dokter_id: latestRme?.dokter?.id || prev.dokter_id || dokters[0]?.id || '',
            }));
            setSelectedHistoricalRmeId(null);
        }
    }, [selectedPasienId, localRekamMedisList]);

    const selectedPasien = pasiens.find((p) => p.id === selectedPasienId) || pasiens[0];
    const pasienRmeHistory = localRekamMedisList.filter((r) => r.pasien?.id === selectedPasienId);
    
    // Pick either historical selected visit or the latest one for Monitoring view
    const activeMonitoringRme = selectedHistoricalRmeId 
        ? pasienRmeHistory.find((r) => r.id === selectedHistoricalRmeId) || pasienRmeHistory[0]
        : pasienRmeHistory[0];

    // Filter patients for Tab 1 & Tab 2
    const filteredPasiensTab1 = pasiens.filter(
        (p) =>
            !searchPasienTab1 ||
            p.nama_lengkap.toLowerCase().includes(searchPasienTab1.toLowerCase()) ||
            p.nomor_rekam_medis.toLowerCase().includes(searchPasienTab1.toLowerCase()),
    );

    const filteredPasiensTab2 = pasiens.filter(
        (p) =>
            !searchPasien ||
            p.nama_lengkap.toLowerCase().includes(searchPasien.toLowerCase()) ||
            p.nomor_rekam_medis.toLowerCase().includes(searchPasien.toLowerCase()),
    );

    // Resep Filter & Counts
    const filteredReseps = localResepsList.filter((r) => {
        const query = resepSearch.toLowerCase();
        const matchSearch =
            !query ||
            r.no_resep.toLowerCase().includes(query) ||
            r.pasien?.nama_lengkap?.toLowerCase().includes(query) ||
            r.pasien?.nomor_rekam_medis?.toLowerCase().includes(query) ||
            r.dokter?.nama_lengkap?.toLowerCase().includes(query) ||
            r.details?.some((d) => d.obat?.nama_obat?.toLowerCase().includes(query));
        const matchStatus = resepStatusFilter === 'all' || r.status === resepStatusFilter;
        return matchSearch && matchStatus;
    });

    const countMenunggu = localResepsList.filter((r) => r.status === 'menunggu_ditebus').length;
    const countSudahDitebus = localResepsList.filter((r) => r.status === 'sudah_ditebus').length;

    const resepsPerPage = 6;
    const totalResepPages = Math.ceil(filteredReseps.length / resepsPerPage);
    const paginatedReseps = filteredReseps.slice((resepPage - 1) * resepsPerPage, resepPage * resepsPerPage);

    // Helper: sediaan badge styling
    const getSediaanStyle = (sediaan: string = '') => {
        const s = sediaan.toLowerCase();
        if (s.includes('sirup') || s.includes('suspensi') || s.includes('larutan') || s.includes('cairan') || s.includes('emulsi') || s.includes('elixir')) {
            return 'bg-cyan-50 text-cyan-800 border-cyan-200';
        }
        if (s.includes('kapsul')) {
            return 'bg-purple-50 text-purple-800 border-purple-200';
        }
        if (s.includes('injeksi') || s.includes('infus') || s.includes('serbuk injeksi')) {
            return 'bg-amber-50 text-amber-900 border-amber-300';
        }
        if (s.includes('tetes') || s.includes('drop') || s.includes('guttae')) {
            return 'bg-emerald-50 text-emerald-800 border-emerald-200';
        }
        if (s.includes('salep') || s.includes('krim') || s.includes('gel') || s.includes('lotion') || s.includes('pasta')) {
            return 'bg-rose-50 text-rose-800 border-rose-200';
        }
        if (s.includes('tablet') || s.includes('kaplet') || s.includes('pil')) {
            return 'bg-blue-50 text-blue-800 border-blue-200';
        }
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    // Calculate Estimated Resep Total in Form
    const totalEstimasiResep = resepFormData.details.reduce((acc, curr) => {
        const drug = localObats.find((o) => o.id === curr.obat_id);
        const harga = drug?.harga || 0;
        return acc + harga * (Number(curr.jumlah_dosis) || 0);
    }, 0);

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
                showNotification('Rekam Medis Elektronik (RME) berhasil dibuat!');
                if (result.data) {
                    setLocalRekamMedisList((prev) => [result.data, ...prev]);
                    setSelectedPasienId(result.data.pasien?.id || formData.pasien_id);
                    setSelectedHistoricalRmeId(result.data.id);
                    setActiveTab('monitoring');
                }
            } else {
                showNotification(`Error: ${result.message || 'Gagal menyimpan RME'}`, true);
            }
        } catch (err: any) {
            showNotification(`Connection Error: ${err.message}`, true);
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
                showNotification('Rekam Medis berhasil difinalisasi!');
                setLocalRekamMedisList((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: 'final' } : r)),
                );
                router.reload();
            } else {
                showNotification(`Error: ${result.message}`, true);
            }
        } catch (err: any) {
            showNotification(`Error: ${err.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    // Handle Submit Resep Baru
    const handleSubmitResep = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate stock beforehand
        for (let i = 0; i < resepFormData.details.length; i++) {
            const d = resepFormData.details[i];
            const drug = localObats.find((o) => o.id === d.obat_id);
            if (!drug) continue;
            if (d.jumlah_dosis > drug.stok) {
                showNotification(
                    `Stok untuk ${drug.nama_obat} tidak mencukupi (Tersedia: ${drug.stok}, Diminta: ${d.jumlah_dosis}).`,
                    true,
                );
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                ...resepFormData,
                details: resepFormData.details.map((d) => ({
                    ...d,
                    catatan: d.catatan ? (resepCatatan ? `${d.catatan} - ${resepCatatan}` : d.catatan) : resepCatatan,
                })),
            };

            const response = await fetch('/api/v1/resep', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                showNotification('Resep Digital berhasil diterbitkan!');
                if (result.data) {
                    setLocalResepsList((prev) => [result.data, ...prev]);
                }
                // Reset details to 1 clean line
                setResepFormData((prev) => ({
                    ...prev,
                    details: [
                        {
                            obat_id: localObats[0]?.id || 1,
                            aturan_pakai: '3x1 sesudah makan',
                            jumlah_dosis: 10,
                            catatan: '',
                        },
                    ],
                }));
                setResepCatatan('');
                router.reload();
            } else {
                showNotification(`Error: ${result.message}`, true);
            }
        } catch (err: any) {
            showNotification(`Connection Error: ${err.message}`, true);
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
                showNotification('Resep berhasil ditebus! Stok obat otomatis berkurang.');
                
                // Update local resep state to sudah_ditebus
                setLocalResepsList((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: 'sudah_ditebus' } : r)),
                );

                // Update local drugs stock
                const targetResep = localResepsList.find((r) => r.id === id);
                if (targetResep?.details) {
                    setLocalObats((prevObats) =>
                        prevObats.map((obat) => {
                            const matchedDetail = targetResep.details.find((d) => d.obat_id === obat.id || d.obat?.id === obat.id);
                            if (matchedDetail) {
                                return {
                                    ...obat,
                                    stok: Math.max(0, obat.stok - matchedDetail.jumlah_dosis),
                                };
                            }
                            return obat;
                        }),
                    );
                }

                setTebusConfirmModal(null);
                router.reload();
            } else {
                showNotification(`Gagal Tebus Resep: ${result.message}`, true);
            }
        } catch (err: any) {
            showNotification(`Error: ${err.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    const addResepItem = () => {
        setResepFormData({
            ...resepFormData,
            details: [
                ...resepFormData.details,
                { obat_id: localObats[0]?.id || 1, aturan_pakai: '3x1 sesudah makan', jumlah_dosis: 10, catatan: '' },
            ],
        });
    };

    const removeResepItem = (index: number) => {
        if (resepFormData.details.length <= 1) return;
        const newDetails = resepFormData.details.filter((_, i) => i !== index);
        setResepFormData({ ...resepFormData, details: newDetails });
    };

    // Print helper using isolated iframe for perfect, pixel-perfect output
    const handlePrintResep = (resepToPrint?: Resep | null) => {
        const r = resepToPrint || detailResepModal;
        if (!r) return;

        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);

        const doc = printFrame.contentWindow?.document;
        if (!doc) return;

        const formattedDate = new Date(r.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        const statusLabel = r.status === 'sudah_ditebus' ? 'SUDAH DITEBUS' : 'MENUNGGU DITEBUS';
        const statusColor = r.status === 'sudah_ditebus' ? '#047857' : '#b45309';
        const statusBg = r.status === 'sudah_ditebus' ? '#d1fae5' : '#fef3c7';

        const itemsHtml = r.details?.map((d, idx) => `
            <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: bold; width: 35px;">${idx + 1}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">
                    <div style="font-weight: bold; font-size: 13px; color: #111827;">${d.obat?.nama_obat || 'Obat'}</div>
                    <div style="font-size: 11px; color: #6b7280;">Bentuk Sediaan: ${d.obat?.bentuk_sediaan || '-'} ${d.obat?.kode_obat ? `(${d.obat.kode_obat})` : ''}</div>
                </td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: bold; font-size: 13px; width: 60px;">${d.jumlah_dosis}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #0f766e; font-size: 12px;">${d.aturan_pakai}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; color: #4b5563;">${d.catatan || '-'}</td>
            </tr>
        `).join('') || `<tr><td colspan="5" style="text-align: center; padding: 16px; color: #9ca3af;">Tidak ada obat.</td></tr>`;

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title></title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 0mm;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    html, body {
                        background: #fff;
                        color: #1f2937;
                        margin: 0;
                        padding: 0;
                        width: 100%;
                    }
                    .print-sheet {
                        padding: 16mm 18mm;
                        width: 100%;
                        min-height: 100%;
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        border-bottom: 3px double #145e5b;
                        padding-bottom: 12px;
                        margin-bottom: 14px;
                    }
                    .logo-area {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .cross-icon {
                        width: 44px;
                        height: 44px;
                        background: #145e5b !important;
                        color: #ffffff !important;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 26px;
                        font-weight: 900;
                    }
                    .hospital-title {
                        font-family: Georgia, serif;
                        font-size: 18px;
                        font-weight: bold;
                        color: #145e5b;
                        letter-spacing: 0.5px;
                    }
                    .hospital-desc {
                        font-size: 11px;
                        color: #4b5563;
                        margin-top: 2px;
                    }
                    .resep-badge-area {
                        text-align: right;
                    }
                    .resep-no {
                        font-family: monospace;
                        font-size: 14px;
                        font-weight: bold;
                        color: #145e5b;
                    }
                    .resep-status {
                        display: inline-block;
                        margin-top: 4px;
                        padding: 2px 8px;
                        border-radius: 6px;
                        font-size: 10px;
                        font-weight: 800;
                        letter-spacing: 0.5px;
                        background: ${statusBg} !important;
                        color: ${statusColor} !important;
                        border: 1px solid ${statusColor}40;
                    }
                    .doc-title {
                        text-align: center;
                        font-size: 13px;
                        font-weight: 800;
                        letter-spacing: 1px;
                        color: #111827;
                        margin-bottom: 12px;
                        text-transform: uppercase;
                    }
                    .meta-box {
                        display: flex;
                        gap: 16px;
                        background: #f9fafb !important;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 10px 14px;
                        margin-bottom: 14px;
                    }
                    .meta-col {
                        flex: 1;
                    }
                    .meta-row {
                        display: flex;
                        margin-bottom: 4px;
                    }
                    .meta-row:last-child {
                        margin-bottom: 0;
                    }
                    .meta-label {
                        width: 105px;
                        color: #6b7280;
                        font-size: 11px;
                    }
                    .meta-val {
                        flex: 1;
                        font-weight: 600;
                        color: #111827;
                        font-size: 11px;
                    }
                    .table-resep {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 16px;
                    }
                    .table-resep th {
                        background: #f3f4f6 !important;
                        color: #374151;
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                        padding: 7px 10px;
                        border-bottom: 2px solid #d1d5db;
                    }
                    .signatures {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 25px;
                        padding-top: 10px;
                    }
                    .sig-box {
                        width: 200px;
                        text-align: center;
                    }
                    .sig-line {
                        border-top: 1px solid #9ca3af;
                        margin-top: 50px;
                        padding-top: 4px;
                        font-weight: bold;
                        font-size: 11px;
                    }
                    .footer-note {
                        margin-top: 24px;
                        border-top: 1px dashed #d1d5db;
                        padding-top: 8px;
                        font-size: 10px;
                        color: #9ca3af;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="print-sheet">
                    <div class="header">
                        <div class="logo-area">
                            <div class="cross-icon">+</div>
                            <div>
                                <div class="hospital-title">RS SENTOSA MEDIKA</div>
                                <div class="hospital-desc">Jl. Sehat Sejahtera No. 45, Jakarta Pusat 10110 | Telp: (021) 555-0199</div>
                                <div class="hospital-desc">Instalasi Farmasi & Pelayanan Resep Elektronik</div>
                            </div>
                        </div>
                        <div class="resep-badge-area">
                            <div class="resep-no">${r.no_resep}</div>
                            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Tgl: ${formattedDate}</div>
                            <div><span class="resep-status">${statusLabel}</span></div>
                        </div>
                    </div>

                    <div class="doc-title">Salinan Resep Digital (RME)</div>

                    <div class="meta-box">
                        <div class="meta-col">
                            <div class="meta-row">
                                <span class="meta-label">Nama Pasien</span>
                                <span class="meta-val">: <strong>${r.pasien?.nama_lengkap || '-'}</strong></span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">No. Rekam Medis</span>
                                <span class="meta-val">: <strong>${r.pasien?.nomor_rekam_medis || '-'}</strong></span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Riwayat Alergi</span>
                                <span class="meta-val" style="color: ${r.pasien?.alergi ? '#dc2626' : '#111827'}; font-weight: bold;">: ${r.pasien?.alergi || 'Tidak ada'}</span>
                            </div>
                        </div>
                        <div class="meta-col">
                            <div class="meta-row">
                                <span class="meta-label">Dokter Pemeriksa</span>
                                <span class="meta-val">: <strong>${r.dokter?.nama_lengkap || 'Dr. Umum'}</strong></span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Spesialisasi</span>
                                <span class="meta-val">: ${r.dokter?.spesialisasi || 'Dokter Umum'}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">No. SIP / STR</span>
                                <span class="meta-val">: ${r.dokter?.nomor_str || '19840212/SIP/2020'}</span>
                            </div>
                        </div>
                    </div>

                    <table class="table-resep">
                        <thead>
                            <tr>
                                <th style="text-align: center; width: 35px;">No</th>
                                <th style="text-align: left;">Nama Obat & Sediaan (R/)</th>
                                <th style="text-align: center; width: 60px;">Jumlah</th>
                                <th style="text-align: left;">Signa / Aturan Pakai</th>
                                <th style="text-align: left;">Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div class="signatures">
                        <div class="sig-box">
                            <div style="font-size: 11px; color: #6b7280;">Petugas Farmasi / Apoteker</div>
                            <div style="height: 15px;"></div>
                            <div class="sig-line">( Cap & Paraf Apotek )</div>
                        </div>
                        <div class="sig-box">
                            <div style="font-size: 11px; color: #6b7280;">Dokter Penanggung Jawab</div>
                            <div style="height: 15px; font-family: Georgia, serif; font-style: italic; color: #145e5b; font-size: 13px;">
                                ${r.dokter?.nama_lengkap || 'Dr. Budi Santoso'}
                            </div>
                            <div class="sig-line">${r.dokter?.nama_lengkap || 'Dr. Budi Santoso'}</div>
                        </div>
                    </div>

                    <div class="footer-note">
                        Lembar resep ini diterbitkan dan dicetak secara sah melalui Sistem Informasi Manajemen Rumah Sakit (SIMRS) RS Sentosa Medika.
                    </div>
                </div>
            </body>
            </html>
        `);
        doc.close();

        // Trigger print dialog smoothly
        setTimeout(() => {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(printFrame);
            }, 1000);
        }, 250);
    };

    // Check if any draft RME exists for finalization button
    const hasDraftRme = pasienRmeHistory.some((r) => r.status === 'draft');

    // Tab titles mapping
    const tabTitles: Record<string, string> = {
        monitoring: 'Rekam Medis Elektronik',
        input: 'Input RME baru',
        resep: 'Resep Digital',
        master: 'Katalog Obat & ICD‑10',
    };

    return (
        <Layout user={user} role={role} title="Rekam Medis Elektronik (RME)">
            <Head title="Rekam Medis Elektronik (RME)" />

            <div className="space-y-5">
                {/* ─── Page Title (Serif heading per tab) ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
                        {tabTitles[activeTab]}
                    </h1>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-medium text-gray-700">SIMRS Sentosa Medika</span>
                        <span>•</span>
                        <span>User: <strong className="text-teal-800">{user?.nama_lengkap || user?.name || 'Staff Medis'}</strong> ({role})</span>
                    </div>
                </div>

                {/* ─── Tab Navigation ─── */}
                <nav className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 pb-px">
                    <button
                        onClick={() => setActiveTab('monitoring')}
                        className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                            activeTab === 'monitoring'
                                ? 'bg-[#145e5b] text-white shadow-md rounded-lg'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                    >
                        <i className="fa-solid fa-heart-pulse text-xs" /> Monitoring Vitals
                    </button>

                    {canInputRme && (
                        <button
                            onClick={() => setActiveTab('input')}
                            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                                activeTab === 'input'
                                    ? 'bg-[#145e5b] text-white shadow-md rounded-lg'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                        >
                            <i className="fa-solid fa-stethoscope text-xs" /> Input RME Baru
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('resep')}
                        className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                            activeTab === 'resep'
                                ? 'bg-[#145e5b] text-white shadow-md rounded-lg'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                    >
                        <i className="fa-solid fa-pills text-xs" /> Resep Digital & Tebus
                        {countMenunggu > 0 && (
                            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                                activeTab === 'resep' ? 'bg-amber-400 text-gray-900' : 'bg-amber-100 text-amber-800'
                            }`}>
                                {countMenunggu}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('master')}
                        className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                            activeTab === 'master'
                                ? 'bg-[#145e5b] text-white shadow-md rounded-lg'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                    >
                        <i className="fa-solid fa-book-medical text-xs" /> Katalog Obat & ICD-10
                    </button>
                </nav>

                {/* ─── Toast Notifications ─── */}
                {apiSuccess && (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 shadow-sm animate-fade-in flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-circle-check text-emerald-600 text-lg" />
                            <div className="text-sm font-semibold">{apiSuccess}</div>
                        </div>
                        <button onClick={() => setApiSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                            <i className="fa-solid fa-xmark text-sm" />
                        </button>
                    </div>
                )}
                {apiError && (
                    <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-800 shadow-sm animate-fade-in flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-circle-xmark text-rose-600 text-lg" />
                            <div className="text-sm font-semibold">{apiError}</div>
                        </div>
                        <button onClick={() => setApiError(null)} className="text-rose-700 hover:text-rose-900">
                            <i className="fa-solid fa-xmark text-sm" />
                        </button>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    TAB 1: MONITORING VITALS
                ═══════════════════════════════════════════════════════════ */}
                {activeTab === 'monitoring' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* ── Left: Patient Selector + Profile ── */}
                        <div className="space-y-5 lg:col-span-4">
                            {/* Patient List */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                                        Pilih Pasien ({filteredPasiensTab1.length})
                                    </h3>
                                </div>
                                <div className="relative mb-3">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari pasien / No. RM..."
                                        value={searchPasienTab1}
                                        onChange={(e) => setSearchPasienTab1(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                                    {filteredPasiensTab1.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPasienId(p.id)}
                                            className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                                                selectedPasienId === p.id
                                                    ? 'border-l-4 border-l-[#145e5b] bg-teal-50/70 border border-teal-200 shadow-xs'
                                                    : 'border border-transparent hover:bg-gray-50'
                                            }`}
                                        >
                                            <div>
                                                <div className="font-semibold text-sm text-gray-900">
                                                    {p.nama_lengkap}
                                                </div>
                                                <div className="text-xs text-gray-500">{p.nomor_rekam_medis}</div>
                                            </div>
                                            {p.kondisi_terakhir && (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap ${
                                                        p.kondisi_terakhir === 'kritis'
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : p.kondisi_terakhir === 'perlu_perhatian'
                                                              ? 'bg-amber-100 text-amber-700'
                                                              : 'bg-emerald-100 text-emerald-700'
                                                    }`}
                                                >
                                                    {p.kondisi_terakhir.replace(/_/g, ' ')}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    {filteredPasiensTab1.length === 0 && (
                                        <div className="text-center py-4 text-xs text-gray-400">
                                            Pasien tidak ditemukan.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Profil Medis Pasien */}
                            {selectedPasien && (
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <i className="fa-solid fa-address-card text-[#145e5b]" /> Profil Medis Pasien
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span className="text-gray-500 text-xs">Nama:</span>
                                            <span className="font-semibold text-gray-900">
                                                {selectedPasien.nama_lengkap}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span className="text-gray-500 text-xs">No RM:</span>
                                            <span className="font-bold text-gray-900">
                                                {selectedPasien.nomor_rekam_medis}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span className="text-gray-500 text-xs">Riwayat Alergi:</span>
                                            <span
                                                className={`font-semibold ${selectedPasien.alergi ? 'text-rose-600' : 'text-gray-500'}`}
                                            >
                                                {selectedPasien.alergi || 'Tidak ada'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-xs">Kondisi Terakhir:</span>
                                            <span className="font-bold text-[#145e5b] uppercase">
                                                {selectedPasien.kondisi_terakhir || 'STABIL'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Right: Vital Signs + Timeline ── */}
                        <div className="space-y-5 lg:col-span-8">
                            {activeMonitoringRme ? (
                                <>
                                    {/* Alert Banner for Critical */}
                                    {activeMonitoringRme.kondisi_pasien === 'kritis' && (
                                        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-800 shadow-sm animate-pulse">
                                            <div className="font-bold flex items-center gap-2 text-sm">
                                                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-lg" />
                                                PERINGATAN KRITIS: Pasien memerlukan penanganan medis darurat!
                                            </div>
                                        </div>
                                    )}

                                    {/* Historical Viewing Notice */}
                                    {selectedHistoricalRmeId && (
                                        <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3 text-xs text-teal-800 flex items-center justify-between shadow-xs">
                                            <span className="flex items-center gap-2">
                                                <i className="fa-solid fa-history" />
                                                Menampilkan data pemeriksaan historis: <strong>{activeMonitoringRme.keluhan_utama}</strong> ({new Date(activeMonitoringRme.created_at).toLocaleDateString('id-ID')})
                                            </span>
                                            <button
                                                onClick={() => setSelectedHistoricalRmeId(null)}
                                                className="font-bold text-[#145e5b] hover:underline"
                                            >
                                                Kembali ke Terkini &times;
                                            </button>
                                        </div>
                                    )}

                                    {/* Vital Signs Card */}
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-start justify-between mb-5">
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">
                                                    Pemeriksaan Vital Signs {selectedHistoricalRmeId ? 'Kunjungan Ini' : 'Terkini'}
                                                </h2>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Waktu:{' '}
                                                    {new Date(activeMonitoringRme.created_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${
                                                    activeMonitoringRme.kondisi_pasien === 'kritis'
                                                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                        : activeMonitoringRme.kondisi_pasien === 'perlu_perhatian'
                                                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                }`}
                                            >
                                                STATUS: {(activeMonitoringRme.kondisi_pasien || 'stabil').toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Vital Signs Grid matching reference design */}
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            {/* 1. Tekanan Darah (Red pastel) */}
                                            <div className="rounded-2xl border border-[#fecdd3] bg-[#fff1f2] p-4 sm:p-5 text-center transition-all hover:scale-[1.02] shadow-xs flex flex-col justify-center items-center">
                                                <span className="text-[11px] sm:text-xs font-bold text-[#b91c1c] uppercase tracking-wide">
                                                    TEKANAN DARAH
                                                </span>
                                                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 my-1">
                                                    {activeMonitoringRme.sistol || '-'}/{activeMonitoringRme.diastol || '-'}
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-medium">
                                                    MMhG
                                                </span>
                                            </div>

                                            {/* 2. Suhu Tubuh (Green pastel) */}
                                            <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 sm:p-5 text-center transition-all hover:scale-[1.02] shadow-xs flex flex-col justify-center items-center">
                                                <span className="text-[11px] sm:text-xs font-bold text-[#15803d] uppercase tracking-wide">
                                                    SUHU TUBUH
                                                </span>
                                                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 my-1">
                                                    {activeMonitoringRme.suhu_tubuh || '-'} °C
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-medium">
                                                    Celcius
                                                </span>
                                            </div>

                                            {/* 3. Denyut Nadi (Pink pastel) */}
                                            <div className="rounded-2xl border border-[#fbcfe8] bg-[#fdf2f8] p-4 sm:p-5 text-center transition-all hover:scale-[1.02] shadow-xs flex flex-col justify-center items-center">
                                                <span className="text-[11px] sm:text-xs font-bold text-[#db2777] uppercase tracking-wide">
                                                    DENYUT NADI
                                                </span>
                                                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 my-1">
                                                    {activeMonitoringRme.denyut_nadi || '-'}
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-medium">
                                                    bpm
                                                </span>
                                            </div>

                                            {/* 4. Satuan SpO2 (Blue pastel) */}
                                            <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4 sm:p-5 text-center transition-all hover:scale-[1.02] shadow-xs flex flex-col justify-center items-center">
                                                <span className="text-[11px] sm:text-xs font-bold text-[#2563eb] uppercase tracking-wide">
                                                    SATUAN SPO2
                                                </span>
                                                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 my-1">
                                                    {activeMonitoringRme.spo2 || '-'}%
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-medium">
                                                    Oksigen
                                                </span>
                                            </div>
                                        </div>

                                        {/* Catatan Perawat */}
                                        {activeMonitoringRme.catatan_keperawatan && (
                                            <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-700">
                                                <span className="font-semibold text-gray-900">Catatan Perawat:</span>{' '}
                                                {activeMonitoringRme.catatan_keperawatan}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline Rekam Medis */}
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="text-base font-bold text-gray-900">
                                                Riwayat Timeline Rekam Medis Pasien ({pasienRmeHistory.length})
                                            </h3>
                                            <span className="text-xs text-gray-400">Klik kunjungan untuk melihat vitals</span>
                                        </div>
                                        <div className="space-y-0">
                                            {pasienRmeHistory.map((rme, idx) => (
                                                <div
                                                    key={rme.id}
                                                    onClick={() => setSelectedHistoricalRmeId(rme.id)}
                                                    className={`relative pl-6 pb-6 last:pb-0 cursor-pointer group rounded-xl transition-colors p-2 ${
                                                        activeMonitoringRme.id === rme.id ? 'bg-teal-50/60' : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {/* Timeline line */}
                                                    {idx < pasienRmeHistory.length - 1 && (
                                                        <div className="absolute left-[15px] top-6 bottom-0 w-0.5 bg-teal-200" />
                                                    )}
                                                    {/* Timeline dot */}
                                                    <div className={`absolute left-2 top-3 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                                                        activeMonitoringRme.id === rme.id ? 'border-[#145e5b]' : 'border-teal-400'
                                                    }`}>
                                                        <div className={`h-2 w-2 rounded-full ${activeMonitoringRme.id === rme.id ? 'bg-[#145e5b]' : 'bg-teal-400'}`} />
                                                    </div>
                                                    {/* Content */}
                                                    <div className="space-y-1 pl-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <span className="font-bold text-sm text-gray-900 leading-snug group-hover:text-[#145e5b] transition-colors">
                                                                    {rme.keluhan_utama}
                                                                </span>
                                                                <div className="text-[11px] text-gray-400">
                                                                    {new Date(rme.created_at).toLocaleString('id-ID')}
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                                                    rme.status === 'final'
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}
                                                            >
                                                                {rme.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-teal-700">
                                                            Diagnosis:{' '}
                                                            <span className="font-semibold">
                                                                {rme.icd10_code || '-'}
                                                            </span>{' '}
                                                            – {rme.diagnosis_deskripsi || '-'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Dokter: {rme.dokter?.nama_lengkap || '-'} | Poli:{' '}
                                                            {rme.poli?.nama_poli || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Finalisasi Button for drafts */}
                                        {hasDraftRme && canFinalizeRme && (
                                            <div className="mt-5 border-t pt-4 flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Terdapat rekam medis draft yang dapat difinalisasi.</span>
                                                {pasienRmeHistory
                                                    .filter((r) => r.status === 'draft')
                                                    .map((rme) => (
                                                        <button
                                                            key={rme.id}
                                                            onClick={() => handleFinalizeRme(rme.id)}
                                                            disabled={loading}
                                                            className="rounded-lg bg-[#145e5b] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f4d4a] shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                                        >
                                                            <i className="fa-solid fa-stamp" /> Finalisasi RME ({rme.keluhan_utama})
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                                    <i className="fa-solid fa-file-medical text-4xl text-gray-300 mb-3" />
                                    <p className="text-gray-500 text-sm">
                                        Belum ada data Rekam Medis untuk pasien ini.
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Silakan buat di tab "Input RME Baru".
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    TAB 2: INPUT RME BARU
                ═══════════════════════════════════════════════════════════ */}
                {activeTab === 'input' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* ── Left: Patient Selector + Profile ── */}
                        <div className="space-y-5 lg:col-span-4 xl:col-span-3">
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Pilih Pasien</h3>
                                {/* Search */}
                                <div className="relative mb-3">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau No. RM..."
                                        value={searchPasien}
                                        onChange={(e) => setSearchPasien(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none focus:bg-white transition-colors"
                                    />
                                </div>
                                {/* Patient List */}
                                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                    {filteredPasiensTab2.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPasienId(p.id)}
                                            className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                                                selectedPasienId === p.id
                                                    ? 'bg-[#145e5b] text-white shadow-md'
                                                    : 'border border-gray-100 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div>
                                                <div
                                                    className={`font-semibold text-sm ${selectedPasienId === p.id ? 'text-white' : 'text-gray-900'}`}
                                                >
                                                    {p.nama_lengkap}
                                                </div>
                                                <div
                                                    className={`text-xs ${selectedPasienId === p.id ? 'text-teal-100' : 'text-gray-500'}`}
                                                >
                                                    {p.nomor_rekam_medis}
                                                </div>
                                            </div>
                                            {selectedPasienId === p.id && (
                                                <i className="fa-solid fa-circle-check text-white text-sm" />
                                            )}
                                        </button>
                                    ))}
                                    {filteredPasiensTab2.length === 0 && (
                                        <p className="text-xs text-gray-400 text-center py-3">Tidak ditemukan.</p>
                                    )}
                                </div>
                            </div>

                            {/* Profil Medis Pasien */}
                            {selectedPasien && (
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">Profil Medis Pasien</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        {/* Avatar */}
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-[#145e5b] font-bold text-base shrink-0">
                                            {selectedPasien.nama_lengkap.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-base text-gray-900">
                                                {selectedPasien.nama_lengkap}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {selectedPasien.nomor_rekam_medis}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 text-sm">
                                        <div className="flex items-center justify-between border-b pb-1.5">
                                            <span className="text-gray-500 text-xs">Gol. Darah</span>
                                            <span className="font-semibold text-gray-800 text-xs">
                                                {selectedPasien.golongan_darah || 'O+'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b pb-1.5">
                                            <span className="text-gray-500 text-xs">Alergi</span>
                                            <span
                                                className={`font-semibold text-xs ${selectedPasien.alergi ? 'text-rose-600' : 'text-gray-400'}`}
                                            >
                                                {selectedPasien.alergi || 'Tidak ada'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs">Riwayat Utama</span>
                                            <div className="font-medium text-gray-800 text-xs mt-0.5">
                                                {selectedPasien.kondisi_terakhir
                                                    ? selectedPasien.kondisi_terakhir.replace(/_/g, ' ')
                                                    : 'Stabil'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Right: Input Form ── */}
                        <div className="lg:col-span-8 xl:col-span-9">
                            <form
                                onSubmit={handleSubmitRme}
                                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6"
                            >
                                {/* Form Header */}
                                <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Form Input Rekam Medis Elektronik (RME)
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Pengisian data vital signs perawat & hasil pemeriksaan medis dokter.
                                        </p>
                                    </div>
                                    <span className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-[#145e5b]">
                                        Status: Draft Baru
                                    </span>
                                </div>

                                {/* Aktor Dropdowns */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Pasien</label>
                                        <select
                                            value={formData.pasien_id}
                                            onChange={(e) => {
                                                setFormData({ ...formData, pasien_id: e.target.value });
                                                setSelectedPasienId(e.target.value);
                                            }}
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none focus:ring-1 focus:ring-[#145e5b]"
                                        >
                                            {pasiens.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nama_lengkap} ({p.nomor_rekam_medis})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Dokter</label>
                                        <select
                                            value={formData.dokter_id}
                                            onChange={(e) =>
                                                setFormData({ ...formData, dokter_id: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none focus:ring-1 focus:ring-[#145e5b]"
                                        >
                                            {dokters.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.nama_lengkap} ({d.spesialisasi || 'Umum'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Perawat</label>
                                        <select
                                            value={formData.perawat_id}
                                            onChange={(e) =>
                                                setFormData({ ...formData, perawat_id: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none focus:ring-1 focus:ring-[#145e5b]"
                                        >
                                            {perawats.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nama_lengkap}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Poli / Unit
                                        </label>
                                        <select
                                            value={formData.poli_id}
                                            onChange={(e) =>
                                                setFormData({ ...formData, poli_id: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none focus:ring-1 focus:ring-[#145e5b]"
                                        >
                                            {polis.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nama_poli}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ── Vital Signs Section ── */}
                                <div className="rounded-xl bg-teal-50/50 p-5 border border-teal-100 space-y-4">
                                    <h3 className="text-xs font-bold text-[#145e5b] uppercase tracking-widest flex items-center gap-2">
                                        <i className="fa-solid fa-heart-pulse" />
                                        Pemeriksaan Vital Signs (Perawat)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                        <div>
                                            <label className="block text-[11px] font-medium text-gray-600">
                                                Sistol (mmHg)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.sistol}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        sistol: Number(e.target.value),
                                                    })
                                                }
                                                className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-bold text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-gray-600">
                                                Diastol (mmHg)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.diastol}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        diastol: Number(e.target.value),
                                                    })
                                                }
                                                className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-bold text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-gray-600">
                                                Suhu (°C)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={formData.suhu_tubuh}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        suhu_tubuh: Number(e.target.value),
                                                    })
                                                }
                                                className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-bold text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-gray-600">
                                                Denyut Nadi (bpm)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.denyut_nadi}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        denyut_nadi: Number(e.target.value),
                                                    })
                                                }
                                                className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-bold text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-gray-600">
                                                SpO2 (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.spo2}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        spo2: Number(e.target.value),
                                                    })
                                                }
                                                className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-bold text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-gray-600">
                                                Kondisi Pasien
                                            </label>
                                            <select
                                                value={formData.kondisi_pasien}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        kondisi_pasien: e.target.value as any,
                                                    })
                                                }
                                                className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-bold text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                            >
                                                <option value="stabil">stabil</option>
                                                <option value="perlu_perhatian">perlu_perhatian</option>
                                                <option value="kritis">kritis</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Catatan Keperawatan */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Catatan Keperawatan
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.catatan_keperawatan}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    catatan_keperawatan: e.target.value,
                                                })
                                            }
                                            placeholder="Catatan observasi perawat..."
                                            className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* ── Dokter Section ── */}
                                <div className="space-y-4 border-t border-gray-100 pt-5">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fa-solid fa-user-doctor" />
                                        Pemeriksaan & Diagnosa Dokter
                                    </h3>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Keluhan Utama *
                                        </label>
                                        <textarea
                                            required
                                            rows={2}
                                            value={formData.keluhan_utama}
                                            onChange={(e) =>
                                                setFormData({ ...formData, keluhan_utama: e.target.value })
                                            }
                                            placeholder="Deskripsi keluhan pasien saat datang.."
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Pencarian & Kode ICD-10 Diagnosa Pasien *
                                            </label>
                                            <div ref={comboboxRef} className="relative">
                                                <div className="relative">
                                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-xs text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Cari kode (mis: A01.0, J06.9) atau nama penyakit..."
                                                        value={icdSearchInput}
                                                        onChange={(e) => {
                                                            setIcdSearchInput(e.target.value);
                                                            setIcdDropdownOpen(true);
                                                        }}
                                                        onFocus={() => {
                                                            updateDropdownDirection();
                                                            setIcdDropdownOpen(true);
                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-16 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none focus:ring-1 focus:ring-[#145e5b] font-medium shadow-sm"
                                                    />
                                                    {icdSearching ? (
                                                        <div className="absolute right-3 top-2.5 text-[11px] font-semibold text-teal-600 animate-pulse">
                                                            Mencari...
                                                        </div>
                                                    ) : (
                                                        <div className="absolute right-3 top-2.5 text-xs text-gray-400">
                                                            <i className="fa-solid fa-chevron-down" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Dropdown Results */}
                                                {icdDropdownOpen && (
                                                    <div
                                                        className={`absolute z-50 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl transition-all ${
                                                            dropdownDirection === 'up'
                                                                ? 'bottom-full mb-2'
                                                                : 'top-full mt-2'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between border-b bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-500 sticky top-0 backdrop-blur">
                                                            <span>
                                                                Hasil ICD-10 ({icdSearchResults.length} data)
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIcdDropdownOpen(false)}
                                                                className="text-teal-700 hover:underline font-bold flex items-center gap-1"
                                                            >
                                                                <i className="fa-solid fa-xmark" /> Tutup
                                                            </button>
                                                        </div>
                                                        {icdSearchResults.length > 0 ? (
                                                            <div className="divide-y divide-gray-100">
                                                                {icdSearchResults.map((i) => (
                                                                    <button
                                                                        key={i.id || i.code}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({
                                                                                ...formData,
                                                                                icd10_code: i.code,
                                                                                diagnosis_deskripsi: i.description,
                                                                            });
                                                                            setIcdSearchInput(
                                                                                `${i.code} - ${i.description}`,
                                                                            );
                                                                            setIcdDropdownOpen(false);
                                                                        }}
                                                                        className={`w-full p-2.5 text-left transition-colors hover:bg-teal-50/80 ${
                                                                            formData.icd10_code === i.code
                                                                                ? 'bg-teal-50 font-bold'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="font-mono text-xs font-bold text-teal-700">
                                                                                {i.code}
                                                                            </span>
                                                                            {i.name_en && (
                                                                                <span className="text-[10px] text-gray-400 italic">
                                                                                    {i.name_en}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-gray-800 font-medium mt-0.5">
                                                                            {i.description}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 text-center text-xs text-gray-500">
                                                                Tidak ada kode ICD-10 yang cocok.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Deskripsi Diagnosa Detail
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.diagnosis_deskripsi}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        diagnosis_deskripsi: e.target.value,
                                                    })
                                                }
                                                placeholder="Keterangan diagnosa medis..."
                                                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Catatan / Tindakan Dokter
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.catatan_dokter}
                                            onChange={(e) =>
                                                setFormData({ ...formData, catatan_dokter: e.target.value })
                                            }
                                            placeholder="Tindakan medis yang dilakukan.."
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-xl bg-[#145e5b] px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#0f4d4a] transition-all disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <i className="fa-solid fa-spinner animate-spin" /> Menyimpan...
                                            </span>
                                        ) : (
                                            'Simpan RME (Draft)'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    TAB 3: RESEP DIGITAL & TEBUS (WORKING RIWAYAT RESEP)
                ═══════════════════════════════════════════════════════════ */}
                {activeTab === 'resep' && (
                    <div>
                        {/* Subtitle & Quick Stats */}
                        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Resep Digital & Tebus</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Kelola penerbitan resep digital dan pantau status penebusan obat apotek.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800 flex items-center gap-1.5 shadow-xs">
                                    <i className="fa-solid fa-clock text-amber-600" /> Menunggu: {countMenunggu}
                                </span>
                                <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-xs">
                                    <i className="fa-solid fa-check-circle text-emerald-600" /> Selesai: {countSudahDitebus}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* ── Left: Form Terbitkan Resep ── */}
                            <form
                                onSubmit={handleSubmitResep}
                                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5 lg:col-span-7"
                            >
                                <div className="flex items-center justify-between border-b pb-3">
                                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <i className="fa-solid fa-prescription-bottle-medical text-[#145e5b]" />
                                        Form Terbitkan Resep Baru
                                    </h2>
                                    {resepFormData.rekam_medis_id && (
                                        <span className="text-[11px] bg-teal-50 text-teal-800 font-semibold px-2.5 py-1 rounded-lg border border-teal-100 flex items-center gap-1">
                                            <i className="fa-solid fa-link text-[10px]" /> Terhubung ke RME Pasien
                                        </span>
                                    )}
                                </div>

                                {/* Row 1: Pasien + Dokter */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Pasien</label>
                                        <select
                                            value={resepFormData.pasien_id}
                                            onChange={(e) => {
                                                const pId = e.target.value;
                                                setSelectedPasienId(pId);
                                                const patientRmes = localRekamMedisList.filter((r) => r.pasien?.id === pId);
                                                setResepFormData({
                                                    ...resepFormData,
                                                    pasien_id: pId,
                                                    rekam_medis_id: patientRmes[0]?.id || '',
                                                    dokter_id: patientRmes[0]?.dokter?.id || resepFormData.dokter_id,
                                                });
                                            }}
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                        >
                                            {pasiens.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nama_lengkap} ({p.nomor_rekam_medis})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Dokter Pemeriksa
                                        </label>
                                        <select
                                            value={resepFormData.dokter_id}
                                            onChange={(e) =>
                                                setResepFormData({ ...resepFormData, dokter_id: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                        >
                                            {dokters.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.nama_lengkap}
                                                    {d.spesialisasi ? `, ${d.spesialisasi}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 2: Tanggal + Catatan */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Tanggal Resep
                                        </label>
                                        <input
                                            type="date"
                                            value={resepTanggal}
                                            onChange={(e) => setResepTanggal(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Catatan Umum (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            value={resepCatatan}
                                            onChange={(e) => setResepCatatan(e.target.value)}
                                            placeholder="Catatan tambahan untuk apoteker..."
                                            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Daftar Obat Resep */}
                                <div className="space-y-3 border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                                            <i className="fa-solid fa-capsules text-[#145e5b]" />
                                            Daftar Obat Resep ({resepFormData.details.length} item)
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={addResepItem}
                                            className="text-xs font-semibold text-[#145e5b] hover:text-[#0f4d4a] hover:underline transition-colors flex items-center gap-1"
                                        >
                                            <i className="fa-solid fa-plus-circle" /> Tambah Obat
                                        </button>
                                    </div>

                                    {resepFormData.details.map((item, idx) => {
                                        const selectedDrug = (item.obat_id ? cachedDrugsMap.get(item.obat_id) : undefined) || localObats.find((o) => o.id === item.obat_id);
                                        const isLowStock = selectedDrug && item.jumlah_dosis > selectedDrug.stok;

                                        return (
                                            <div
                                                key={idx}
                                                className={`rounded-xl border p-4 space-y-3 transition-colors ${
                                                    isLowStock
                                                        ? 'border-rose-300 bg-rose-50/40'
                                                        : 'border-gray-200 bg-gray-50/50'
                                                }`}
                                            >
                                                {/* Main row: Obat + Jumlah + Aturan Pakai */}
                                                <div className="grid grid-cols-12 gap-3 items-end">
                                                    <div className="col-span-12 sm:col-span-5">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <label className="block text-[11px] font-medium text-gray-500">
                                                                Pilih / Cari Obat
                                                            </label>
                                                            {selectedDrug && (
                                                                <span className={`text-[10px] font-semibold ${
                                                                    selectedDrug.stok < 10 ? 'text-rose-600' : 'text-emerald-700'
                                                                }`}>
                                                                    Stok: {selectedDrug.stok}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <DrugSelectorCombobox
                                                            value={item.obat_id}
                                                            onChange={(o) => {
                                                                const newDetails = [...resepFormData.details];
                                                                newDetails[idx].obat_id = o.id;
                                                                setResepFormData({
                                                                    ...resepFormData,
                                                                    details: newDetails,
                                                                });
                                                            }}
                                                            initialObats={localObats}
                                                            cachedDrugs={cachedDrugsMap}
                                                            onCacheDrug={handleCacheDrug}
                                                        />
                                                    </div>
                                                    <div className="col-span-4 sm:col-span-2">
                                                        <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                                                            Jumlah
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={item.jumlah_dosis}
                                                            onChange={(e) => {
                                                                const newDetails = [...resepFormData.details];
                                                                newDetails[idx].jumlah_dosis = Math.max(1, Number(e.target.value));
                                                                setResepFormData({
                                                                    ...resepFormData,
                                                                    details: newDetails,
                                                                });
                                                            }}
                                                            className={`w-full rounded-lg border bg-white p-2 text-xs font-bold text-center focus:outline-none ${
                                                                isLowStock ? 'border-rose-500 text-rose-700' : 'border-gray-200 text-gray-900 focus:border-[#145e5b]'
                                                            }`}
                                                        />
                                                    </div>
                                                    <div className="col-span-7 sm:col-span-4">
                                                        <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                                                            Aturan Pakai
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.aturan_pakai}
                                                            onChange={(e) => {
                                                                const newDetails = [...resepFormData.details];
                                                                newDetails[idx].aturan_pakai = e.target.value;
                                                                setResepFormData({
                                                                    ...resepFormData,
                                                                    details: newDetails,
                                                                });
                                                            }}
                                                            placeholder="3 x Sehari 1 Kapsul sesudah makan"
                                                            className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-1 flex justify-center">
                                                        {resepFormData.details.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeResepItem(idx)}
                                                                className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                                                                title="Hapus obat"
                                                            >
                                                                <i className="fa-solid fa-trash-can text-xs" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stock Warning Message */}
                                                {isLowStock && (
                                                    <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                                                        <i className="fa-solid fa-triangle-exclamation" />
                                                        Jumlah ({item.jumlah_dosis}) melebihi stok yang tersedia ({selectedDrug?.stok || 0})!
                                                    </div>
                                                )}

                                                {/* Catatan khusus per obat & Subtotal calculation */}
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                                    <input
                                                        type="text"
                                                        value={item.catatan}
                                                        onChange={(e) => {
                                                            const newDetails = [...resepFormData.details];
                                                            newDetails[idx].catatan = e.target.value;
                                                            setResepFormData({ ...resepFormData, details: newDetails });
                                                        }}
                                                        placeholder="Catatan instruksi khusus obat ini..."
                                                        className="w-full sm:flex-1 rounded-lg border border-teal-100 bg-teal-50/30 p-2 text-xs text-gray-600 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none"
                                                    />
                                                    {selectedDrug && (
                                                        <span className="text-[11px] text-gray-500 whitespace-nowrap">
                                                            Subtotal: <strong>Rp {((selectedDrug.harga || 0) * (item.jumlah_dosis || 0)).toLocaleString('id-ID')}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Total Price summary */}
                                <div className="rounded-xl bg-gray-50 p-3 border border-gray-100 flex items-center justify-between text-xs">
                                    <span className="text-gray-600 font-medium">Estimasi Total Biaya Obat:</span>
                                    <span className="text-sm font-black text-[#145e5b]">
                                        Rp {totalEstimasiResep.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading || !canCreateResep}
                                    className="w-full rounded-xl bg-[#145e5b] py-3 text-sm font-bold text-white shadow-md hover:bg-[#0f4d4a] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <i className="fa-solid fa-spinner animate-spin" /> Memproses...
                                        </span>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-paper-plane text-xs" /> Terbitkan Resep Digital
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* ── Right: Riwayat Resep (FULLY FUNCTIONAL) ── */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <i className="fa-solid fa-clock-rotate-left text-[#145e5b]" />
                                        Riwayat Resep ({filteredReseps.length})
                                    </h2>
                                </div>

                                {/* Search + Filter */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative flex-1">
                                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari No. Resep, Pasien, Obat..."
                                            value={resepSearch}
                                            onChange={(e) => {
                                                setResepSearch(e.target.value);
                                                setResepPage(1);
                                            }}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-[#145e5b] focus:outline-none focus:bg-white"
                                        />
                                    </div>
                                    <select
                                        value={resepStatusFilter}
                                        onChange={(e) => {
                                            setResepStatusFilter(e.target.value);
                                            setResepPage(1);
                                        }}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:border-[#145e5b] focus:outline-none"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="menunggu_ditebus">Menunggu ({countMenunggu})</option>
                                        <option value="sudah_ditebus">Sudah Ditebus ({countSudahDitebus})</option>
                                    </select>
                                </div>

                                {/* Resep Cards List */}
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                    {paginatedReseps.length > 0 ? (
                                        paginatedReseps.map((r) => (
                                            <div
                                                key={r.id}
                                                className={`rounded-xl border p-4 space-y-2.5 transition-all shadow-xs ${
                                                    r.status === 'menunggu_ditebus'
                                                        ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                                                        : 'border-gray-200 bg-gray-50/30 hover:border-gray-300'
                                                }`}
                                            >
                                                {/* Header: No Resep + Status */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <span className="font-bold text-sm text-[#145e5b] tracking-wide">
                                                            {r.no_resep}
                                                        </span>
                                                        <div className="text-xs font-semibold text-gray-800 mt-0.5">
                                                            {r.pasien?.nama_lengkap}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500">
                                                            Dokter: {r.dokter?.nama_lengkap || 'Dr. Umum'}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase flex items-center gap-1.5 ${
                                                            r.status === 'sudah_ditebus'
                                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        }`}
                                                    >
                                                        {r.status === 'sudah_ditebus' ? (
                                                            <>
                                                                <i className="fa-solid fa-circle-check text-[9px]" />{' '}
                                                                Sudah Ditebus
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fa-solid fa-clock text-[9px]" />{' '}
                                                                Menunggu
                                                            </>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Drug List */}
                                                <div className="space-y-1 text-xs text-gray-700 bg-white/70 rounded-lg p-2.5 border border-gray-100">
                                                    {r.details?.map((d, dIdx) => (
                                                        <div key={d.id || dIdx} className="flex justify-between items-center">
                                                            <span>
                                                                • <span className="font-medium text-gray-900">{d.obat?.nama_obat || 'Obat'}</span> ({d.jumlah_dosis} {d.obat?.bentuk_sediaan})
                                                            </span>
                                                            <span className="text-[11px] text-gray-500 italic">{d.aturan_pakai}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Action / Detail Buttons */}
                                                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDetailResepModal(r)}
                                                            className="text-xs font-semibold text-gray-600 hover:text-[#145e5b] flex items-center gap-1 transition-colors"
                                                        >
                                                            <i className="fa-solid fa-eye text-[11px]" /> Detail
                                                        </button>
                                                        <span className="text-gray-300 text-xs">|</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrintResep(r)}
                                                            className="text-xs font-semibold text-[#145e5b] hover:text-[#0f4d4a] flex items-center gap-1 transition-colors font-medium"
                                                        >
                                                            <i className="fa-solid fa-print text-[11px]" /> Cetak
                                                        </button>
                                                    </div>

                                                    {r.status === 'menunggu_ditebus' && canTebusResep ? (
                                                        <button
                                                            onClick={() => setTebusConfirmModal(r)}
                                                            disabled={loading}
                                                            className="text-xs font-bold text-[#145e5b] hover:text-[#0f4d4a] hover:underline transition-colors flex items-center gap-1"
                                                        >
                                                            <i className="fa-solid fa-prescription-bottle-medical" /> Tebus Resep Sekarang
                                                        </button>
                                                    ) : r.status === 'sudah_ditebus' ? (
                                                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                                            <i className="fa-solid fa-check text-emerald-600" />
                                                            {new Date(r.updated_at || r.created_at).toLocaleString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-xs text-gray-400 py-10">
                                            <i className="fa-solid fa-prescription text-3xl text-gray-300 mb-2 block" />
                                            Tidak ada resep yang sesuai kriteria pencarian.
                                        </div>
                                    )}
                                </div>

                                {/* Resep Pagination */}
                                {totalResepPages > 1 && (
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
                                        <div>
                                            Hal <span className="font-bold">{resepPage}</span> dari <span className="font-bold">{totalResepPages}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                disabled={resepPage <= 1}
                                                onClick={() => setResepPage((p) => Math.max(1, p - 1))}
                                                className="rounded-lg border bg-white px-2.5 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-40"
                                            >
                                                <i className="fa-solid fa-chevron-left" />
                                            </button>
                                            <button
                                                disabled={resepPage >= totalResepPages}
                                                onClick={() => setResepPage((p) => Math.min(totalResepPages, p + 1))}
                                                className="rounded-lg border bg-white px-2.5 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-40"
                                            >
                                                <i className="fa-solid fa-chevron-right" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    TAB 4: KATALOG OBAT & ICD-10 (OPTIMIZED)
                ═══════════════════════════════════════════════════════════ */}
                {/* ═══════════════════════════════════════════════════════════
                    TAB 4: KATALOG OBAT & ICD-10 (OPTIMIZED FULL WIDTH)
                ═══════════════════════════════════════════════════════════ */}
                {activeTab === 'master' && (
                    <div className="space-y-6">
                        {/* Sub-tab Navigation */}
                        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
                            <button
                                type="button"
                                onClick={() => setMasterSubTab('obat')}
                                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ${
                                    masterSubTab === 'obat'
                                        ? 'bg-[#145e5b] text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <i className="fa-solid fa-pills text-sm" />
                                <span>Katalog Obat Farmasi</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    masterSubTab === 'obat' ? 'bg-teal-800 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {masterObatData.total.toLocaleString('id-ID')} BPOM
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMasterSubTab('icd')}
                                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ${
                                    masterSubTab === 'icd'
                                        ? 'bg-[#145e5b] text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <i className="fa-solid fa-book-medical text-sm" />
                                <span>Referensi Master ICD-10</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    masterSubTab === 'icd' ? 'bg-teal-800 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {masterIcdData.total.toLocaleString('id-ID')} Kode
                                </span>
                            </button>
                        </div>

                        {/* ── Sub-tab 1: Katalog Obat Farmasi (Full Width) ── */}
                        {masterSubTab === 'obat' && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            Katalog Obat Farmasi BPOM
                                            <span className="text-xs font-normal text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-0.5">
                                                {masterObatData.total.toLocaleString('id-ID')} Data Resmi
                                            </span>
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Data komoditi obat BPOM terintegrasi langsung dengan peresepan digital.
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari nama, zat aktif, kode, NIE..."
                                            value={searchObat}
                                            onChange={(e) => {
                                                setSearchObat(e.target.value);
                                                setMasterObatPage(1);
                                            }}
                                            className="rounded-lg border border-gray-200 pl-8 pr-8 py-2 text-xs focus:border-[#145e5b] focus:outline-none w-64 shadow-2xs"
                                        />
                                        {masterObatLoading && (
                                            <i className="fa-solid fa-spinner fa-spin absolute right-2.5 top-2.5 text-xs text-teal-600" />
                                        )}
                                    </div>
                                </div>

                                {/* Filters for Obat */}
                                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                    <span className="text-gray-500 text-[11px] font-medium">Filter Sediaan:</span>
                                    {[
                                        { key: 'all', label: 'Semua' },
                                        { key: 'tablet', label: 'Tablet / Kaplet' },
                                        { key: 'sirup', label: 'Sirup / Suspensi' },
                                        { key: 'kapsul', label: 'Kapsul' },
                                        { key: 'injeksi', label: 'Injeksi / Infus' },
                                        { key: 'salep', label: 'Salep / Krim' },
                                        { key: 'tetes', label: 'Tetes / Drop' },
                                    ].map((s) => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => {
                                                setObatSediaanFilter(s.key);
                                                setMasterObatPage(1);
                                            }}
                                            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                                                obatSediaanFilter === s.key
                                                    ? 'bg-[#145e5b] text-white shadow-xs'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                    <div className="ml-auto flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setObatStockFilter(obatStockFilter === 'low' ? 'all' : 'low');
                                                setMasterObatPage(1);
                                            }}
                                            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold border transition-colors ${
                                                obatStockFilter === 'low'
                                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            ⚠ Stok Rendah (&lt; 50)
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="w-full text-left text-xs text-gray-700">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50/70">
                                                <th className="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-36">
                                                    Kode / NIE
                                                </th>
                                                <th className="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                                    Nama Produk & Komposisi
                                                </th>
                                                <th className="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-56">
                                                    Bentuk Sediaan
                                                </th>
                                                <th className="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-28">
                                                    Stok
                                                </th>
                                                <th className="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-36">
                                                    Harga HET
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {masterObatData.data.map((o) => {
                                                const rawSediaan = o.bentuk_sediaan || '';
                                                const parts = rawSediaan.split(';');
                                                const primarySediaan = parts[0]?.trim() || '-';
                                                const sediaanDetail = parts.slice(1).join(';').trim();

                                                return (
                                                    <tr key={o.id} className="hover:bg-teal-50/30 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-[#145e5b] whitespace-nowrap">
                                                            <div>{o.kode_obat}</div>
                                                            {o.nie && o.nie !== o.kode_obat && (
                                                                <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                                                                    NIE: {o.nie}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="font-semibold text-gray-900">{o.nama_obat}</div>
                                                            {o.komposisi && (
                                                                <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1" title={o.komposisi}>
                                                                    {o.komposisi}
                                                                </div>
                                                            )}
                                                            {o.pendaftar && (
                                                                <div className="text-[10px] text-teal-700 font-mono mt-0.5">
                                                                    Produsen: {o.pendaftar}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex flex-col items-start gap-0.5">
                                                                <span
                                                                    className={`inline-block rounded-md border px-2.5 py-1 text-[11px] font-semibold ${getSediaanStyle(primarySediaan)}`}
                                                                >
                                                                    {primarySediaan}
                                                                </span>
                                                                {sediaanDetail && (
                                                                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[220px]" title={sediaanDetail}>
                                                                        {sediaanDetail}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <span
                                                                    className={`font-bold text-sm ${o.stok < 50 ? 'text-rose-600' : 'text-gray-900'}`}
                                                                >
                                                                    {o.stok}
                                                                </span>
                                                                {o.stok < 50 && (
                                                                    <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xs" title="Stok menipis" />
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-gray-900 font-bold whitespace-nowrap">
                                                            Rp {Number(o.harga).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {masterObatData.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                                        <i className="fa-solid fa-box-open text-2xl mb-2 block text-gray-300" />
                                                        Tidak ada data obat ditemukan dengan kriteria tersebut.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Obat Pagination */}
                                {masterObatData.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
                                        <div>
                                            Halaman <span className="font-bold">{masterObatData.current_page}</span> dari{' '}
                                            <span className="font-bold">{masterObatData.last_page}</span> ({masterObatData.total.toLocaleString('id-ID')} Total Data)
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                disabled={masterObatData.current_page <= 1 || masterObatLoading}
                                                onClick={() => setMasterObatPage((p) => Math.max(1, p - 1))}
                                                className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                                            >
                                                <i className="fa-solid fa-chevron-left text-[10px]" /> Prev
                                            </button>
                                            <button
                                                disabled={masterObatData.current_page >= masterObatData.last_page || masterObatLoading}
                                                onClick={() => setMasterObatPage((p) => Math.min(masterObatData.last_page, p + 1))}
                                                className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                                            >
                                                Next <i className="fa-solid fa-chevron-right text-[10px]" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Sub-tab 2: Referensi Master ICD-10 (Full Width) ── */}
                        {masterSubTab === 'icd' && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            Referensi Master ICD-10
                                            <span className="text-xs font-normal text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-0.5">
                                                {masterIcdData.total.toLocaleString('id-ID')} Kode Standard
                                            </span>
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Katalog standar internasional pengkodean penyakit pasien WHO ICD-10.
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari kode/penyakit..."
                                            value={searchIcd}
                                            onChange={(e) => {
                                                setSearchIcd(e.target.value);
                                                setMasterIcdPage(1);
                                            }}
                                            className="rounded-lg border border-gray-200 pl-8 pr-8 py-2 text-xs focus:border-[#145e5b] focus:outline-none w-64 shadow-2xs"
                                        />
                                        {masterIcdLoading && (
                                            <i className="fa-solid fa-spinner fa-spin absolute right-2.5 top-2.5 text-xs text-teal-600" />
                                        )}
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="w-full text-left text-xs text-gray-700">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50/70">
                                                <th className="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-36 whitespace-nowrap">
                                                    Kode ICD-10
                                                </th>
                                                <th className="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                                    Deskripsi Diagnosa (Bahasa Indonesia)
                                                </th>
                                                <th className="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-72">
                                                    Nama Inggris
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {masterIcdData.data.map((i) => (
                                                <tr
                                                    key={i.id || i.code}
                                                    className="hover:bg-teal-50/30 transition-colors"
                                                >
                                                    <td className="p-3 font-mono font-bold text-indigo-700 text-sm whitespace-nowrap">
                                                        {i.code}
                                                    </td>
                                                    <td className="p-3 font-medium text-gray-900">{i.description}</td>
                                                    <td className="p-3 text-gray-500 italic text-xs">
                                                        {i.name_en || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {masterIcdData.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="p-8 text-center text-gray-400">
                                                        Tidak ada data ICD-10 ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ICD-10 Pagination */}
                                {masterIcdData.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
                                        <div>
                                            Halaman <span className="font-bold">{masterIcdData.current_page}</span> dari{' '}
                                            <span className="font-bold">{masterIcdData.last_page}</span> ({masterIcdData.total.toLocaleString('id-ID')} Total Data)
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                disabled={masterIcdData.current_page <= 1 || masterIcdLoading}
                                                onClick={() => setMasterIcdPage((p) => Math.max(1, p - 1))}
                                                className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1 transition-colors"
                                            >
                                                <i className="fa-solid fa-chevron-left text-[10px]" /> Prev
                                            </button>
                                            <button
                                                disabled={
                                                    masterIcdData.current_page >= masterIcdData.last_page ||
                                                    masterIcdLoading
                                                }
                                                onClick={() =>
                                                    setMasterIcdPage((p) =>
                                                        Math.min(masterIcdData.last_page, p + 1),
                                                    )
                                                }
                                                className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1 transition-colors"
                                            >
                                                Next <i className="fa-solid fa-chevron-right text-[10px]" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════
                MODAL: DETAIL & CETAK RESEP DIGITAL
            ═══════════════════════════════════════════════════════════ */}
            {detailResepModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4 bg-teal-50/50">
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-receipt text-[#145e5b] text-lg" />
                                <h3 className="text-base font-bold text-gray-900">
                                    Lembar Resep Digital ({detailResepModal.no_resep})
                                </h3>
                            </div>
                            <button
                                onClick={() => setDetailResepModal(null)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <i className="fa-solid fa-xmark text-base" />
                            </button>
                        </div>

                        {/* Printable Area */}
                        <div id="resep-print-area" className="p-6 overflow-y-auto space-y-5 text-gray-800">
                            {/* Hospital Letterhead */}
                            <div className="flex items-center justify-between border-b-2 border-teal-700 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#145e5b] text-white font-black text-xl">
                                        +
                                    </div>
                                    <div>
                                        <h4 className="font-serif font-bold text-lg text-teal-900">
                                            RS Sentosa Medika
                                        </h4>
                                        <p className="text-[11px] text-gray-500">
                                            Jl. Sehat Sejahtera No. 45, Jakarta | Telp: (021) 555-0199
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-sm text-[#145e5b]">
                                        {detailResepModal.no_resep}
                                    </div>
                                    <div className="text-[11px] text-gray-500">
                                        {new Date(detailResepModal.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </div>
                                    <span
                                        className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                            detailResepModal.status === 'sudah_ditebus'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {detailResepModal.status === 'sudah_ditebus' ? 'Sudah Ditebus' : 'Menunggu Ditebus'}
                                    </span>
                                </div>
                            </div>

                            {/* Patient & Doctor metadata */}
                            <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-xs">
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Dokter Pemeriksa</span>
                                    <div className="font-bold text-gray-900 mt-0.5">
                                        {detailResepModal.dokter?.nama_lengkap || 'Dr. Budi Santoso'}
                                    </div>
                                    <div className="text-gray-500">{detailResepModal.dokter?.spesialisasi || 'Dokter Umum'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Pasien</span>
                                    <div className="font-bold text-gray-900 mt-0.5">
                                        {detailResepModal.pasien?.nama_lengkap}
                                    </div>
                                    <div className="text-gray-500">
                                        No. RM: {detailResepModal.pasien?.nomor_rekam_medis}
                                        {detailResepModal.pasien?.alergi && (
                                            <span className="text-rose-600 font-semibold ml-2">
                                                (Alergi: {detailResepModal.pasien.alergi})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Drug Table */}
                            <div>
                                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Resep Obat (R/)
                                </h5>
                                <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100 text-gray-600 text-[11px] uppercase font-bold">
                                        <tr>
                                            <th className="p-2.5">No</th>
                                            <th className="p-2.5">Nama Obat & Sediaan</th>
                                            <th className="p-2.5 text-center">Jumlah</th>
                                            <th className="p-2.5">Aturan Pakai</th>
                                            <th className="p-2.5">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {detailResepModal.details?.map((d, index) => (
                                            <tr key={d.id || index} className="hover:bg-gray-50">
                                                <td className="p-2.5 font-bold text-gray-500">{index + 1}</td>
                                                <td className="p-2.5">
                                                    <div className="font-bold text-gray-900">{d.obat?.nama_obat}</div>
                                                    <div className="text-[10px] text-gray-400">{d.obat?.bentuk_sediaan}</div>
                                                </td>
                                                <td className="p-2.5 text-center font-bold text-gray-900">
                                                    {d.jumlah_dosis}
                                                </td>
                                                <td className="p-2.5 font-medium text-teal-800">{d.aturan_pakai}</td>
                                                <td className="p-2.5 text-gray-500 text-[11px]">{d.catatan || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer Signatures */}
                            <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs text-gray-600 border-t">
                                <div>
                                    <p className="text-[11px] text-gray-400">Tanda Tangan & Cap Farmasi</p>
                                    <div className="h-14 flex items-center justify-center text-gray-300 italic text-[11px]">
                                        (Petugas Apotek)
                                    </div>
                                    <div className="border-t border-gray-300 pt-1 font-semibold">Unit Farmasi RS</div>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-400">Dokter Penanggung Jawab</p>
                                    <div className="h-14 flex items-center justify-center text-teal-800 font-serif italic text-sm">
                                        {detailResepModal.dokter?.nama_lengkap || 'Dr. Budi Santoso'}
                                    </div>
                                    <div className="border-t border-gray-300 pt-1 font-semibold">
                                        SIP: {detailResepModal.dokter?.nomor_str || '19840212/SIP/2020'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => handlePrintResep(detailResepModal)}
                                className="rounded-xl border border-teal-700 bg-white px-4 py-2 text-xs font-bold text-teal-700 hover:bg-[#145e5b] hover:text-white hover:border-[#145e5b] flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                                <i className="fa-solid fa-print" /> Cetak Resep
                            </button>
                            {detailResepModal.status === 'menunggu_ditebus' && canTebusResep && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTebusConfirmModal(detailResepModal);
                                        setDetailResepModal(null);
                                    }}
                                    className="rounded-xl bg-[#145e5b] px-5 py-2 text-xs font-bold text-white hover:bg-[#0f4d4a] flex items-center gap-1.5 shadow-sm"
                                >
                                    <i className="fa-solid fa-prescription-bottle-medical" /> Tebus Sekarang
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setDetailResepModal(null)}
                                className="rounded-xl bg-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-300"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                MODAL: KONFIRMASI TEBUS RESEP (APOTEKER/ADMIN)
            ═══════════════════════════════════════════════════════════ */}
            {tebusConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 border-b pb-3 text-teal-800">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-[#145e5b]">
                                <i className="fa-solid fa-prescription-bottle-medical text-lg" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Konfirmasi Penebusan Resep</h3>
                                <p className="text-xs text-gray-500">{tebusConfirmModal.no_resep}</p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-600 space-y-2">
                            <p>
                                Penebusan resep untuk pasien <strong className="text-gray-900">{tebusConfirmModal.pasien?.nama_lengkap}</strong> akan memotong stok obat di gudang farmasi:
                            </p>
                            <div className="rounded-xl bg-gray-50 p-3 border border-gray-100 space-y-1.5">
                                {tebusConfirmModal.details?.map((d, idx) => (
                                    <div key={d.id || idx} className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-gray-800">{d.obat?.nama_obat}</span>
                                        <span className="font-bold text-[#145e5b]">-{d.jumlah_dosis} {d.obat?.bentuk_sediaan}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                                type="button"
                                onClick={() => setTebusConfirmModal(null)}
                                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => handleTebusResep(tebusConfirmModal.id)}
                                className="rounded-xl bg-[#145e5b] px-5 py-2 text-xs font-bold text-white hover:bg-[#0f4d4a] shadow-md transition-all flex items-center gap-2"
                            >
                                {loading ? (
                                    <i className="fa-solid fa-spinner animate-spin" />
                                ) : (
                                    <i className="fa-solid fa-check" />
                                )}
                                Konfirmasi & Kurangi Stok
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
