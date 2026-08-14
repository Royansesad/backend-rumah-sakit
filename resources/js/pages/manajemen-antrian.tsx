import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Layout } from '../components/layout';

interface JadwalDokterItem {
    id: string;
    dokter: { id: string; nama_lengkap: string; spesialisasi: string | null };
    poli: { id: string; nama_poli: string };
    ruangan: { id: string; nama_ruangan: string } | null;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
    kuota_maksimal: number;
    antrian_aktif_count: number;
    sisa_kuota: number;
    status: string;
}

interface AntrianItem {
    id: string;
    nomor_antrian: string;
    angka_antrian: number;
    poli: { id: string; nama_poli: string };
    dokter: { id: string; nama_lengkap: string; spesialisasi: string | null };
    jadwal_dokter_id: string;
    pasien: {
        id: string;
        nama_lengkap: string;
        nomor_rekam_medis: string | null;
    };
    tipe_pasien: 'umum' | 'bpjs' | 'prioritas';
    status:
        | 'menunggu'
        | 'skrining'
        | 'dipanggil'
        | 'sedang_dilayani'
        | 'selesai'
        | 'dilewati'
        | 'dibatalkan';
    loket: { id: string; nama_loket: string } | null;
    waktu_skrining: string | null;
    waktu_dipanggil: string | null;
    waktu_dilayani: string | null;
    waktu_selesai: string | null;
    created_at: string;
}

interface LoketItem {
    id: string;
    nomor_loket: string;
    nama_loket: string;
    poli_id: string;
}

interface PasienItem {
    id: string;
    nama_lengkap: string;
    nomor_rekam_medis: string | null;
}

interface StatistikAntrian {
    total: number;
    menunggu: number;
    skrining: number;
    dipanggil: number;
    sedang_dilayani: number;
    selesai: number;
    dilewati: number;
    dibatalkan: number;
    rata_rata_tunggu_menit: number | null;
}

interface ManajemenAntrianProps {
    user: any;
    role: string;
    jadwalDokterHariIni: JadwalDokterItem[];
    antrianHariIni: AntrianItem[];
    loketList: LoketItem[];
    pasienList: PasienItem[];
    statistik: StatistikAntrian;
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

export default function ManajemenAntrian({
    user,
    role,
    jadwalDokterHariIni,
    antrianHariIni,
    loketList,
    pasienList,
    statistik,
}: ManajemenAntrianProps) {
    const [selectedJadwalId, setSelectedJadwalId] = useState<string | null>(
        null,
    );
    const [isFormOpen, setIsFormOpen] = useState(true);
    const [formData, setFormData] = useState({
        jadwal_dokter_id: '',
        pasien_id: '',
        tipe_pasien: 'umum' as 'umum' | 'bpjs' | 'prioritas',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // Auto refresh
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Filter antrian
    const filteredAntrian = selectedJadwalId
        ? antrianHariIni.filter((a) => a.jadwal_dokter_id === selectedJadwalId)
        : antrianHariIni;

    const handleAmbilAntrian = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await apiCall(
                '/api/v1/antrian/ambil',
                'POST',
                formData,
            );
            if (res.error) throw new Error(res.error);
            setToast({
                message: `Berhasil! Nomor Antrian: ${res.data?.nomor_antrian || 'Sukses'}`,
                type: 'success',
            });
            setFormData({
                jadwal_dokter_id: '',
                pasien_id: '',
                tipe_pasien: 'umum',
            });
            setIsFormOpen(false);
            router.reload();
        } catch (err: any) {
            setToast({
                message: err.message || 'Gagal mengambil nomor antrian',
                type: 'error',
            });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setToast(null), 5000);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await apiCall(`/api/v1/antrian/${id}/status`, 'PATCH', {
                status: newStatus,
            });
            if (res.error) throw new Error(res.error);
            router.reload();
        } catch (err: any) {
            setToast({
                message: err.message || 'Gagal mengubah status',
                type: 'error',
            });
            setTimeout(() => setToast(null), 5000);
        }
    };

    const handlePanggilBerikutnya = async () => {
        if (!selectedJadwalId) return;
        try {
            const res = await apiCall(
                '/api/v1/antrian/panggil-berikutnya',
                'POST',
                { jadwal_dokter_id: selectedJadwalId },
            );
            if (res.error) throw new Error(res.error);
            setToast({
                message: `Berhasil memanggil antrian berikutnya`,
                type: 'success',
            });
            router.reload();
        } catch (err: any) {
            setToast({
                message: err.message || 'Gagal memanggil antrian berikutnya',
                type: 'error',
            });
            setTimeout(() => setToast(null), 5000);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'menunggu':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'skrining':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'dipanggil':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'sedang_dilayani':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'selesai':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'dilewati':
            case 'dibatalkan':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Layout user={user} role={role as any}>
            <div className="min-h-screen bg-[#f0faf7] p-6 font-sans">
                {/* Toast Notification */}
                {toast && (
                    <div
                        className={`fixed top-4 right-4 z-50 rounded-xl border p-4 shadow-lg ${
                            toast.type === 'success'
                                ? 'border-[#d3ece7] bg-[#e1f3ef] text-[#145e5b]'
                                : 'border-red-200 bg-red-50 text-red-800'
                        } transition-all duration-300`}
                    >
                        {toast.message}
                    </div>
                )}

                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-[#145e5b]">
                            Manajemen Antrian
                        </h1>
                        <p className="mt-1 text-[#598c89]">
                            Kelola antrian pasien, skrining, dan layanan harian
                        </p>
                    </div>

                    {/* Statistics Bar */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        <div className="rounded-2xl border border-[#e1f3ef] bg-white p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Total Antrian
                            </p>
                            <p className="mt-1 text-2xl font-bold text-[#145e5b]">
                                {statistik?.total || 0}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-[#e1f3ef] bg-white p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Menunggu
                            </p>
                            <p className="mt-1 text-2xl font-bold text-amber-600">
                                {statistik?.menunggu || 0}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-[#e1f3ef] bg-white p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Sedang Dilayani
                            </p>
                            <p className="mt-1 text-2xl font-bold text-green-600">
                                {statistik?.sedang_dilayani || 0}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-[#e1f3ef] bg-white p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Selesai
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-600">
                                {statistik?.selesai || 0}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-[#e1f3ef] bg-white p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Rata-rata Tunggu
                            </p>
                            <p className="mt-1 text-2xl font-bold text-[#4f8380]">
                                {statistik?.rata_rata_tunggu_menit
                                    ? `${Math.round(statistik.rata_rata_tunggu_menit)} mnt`
                                    : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Form Ambil Nomor Antrian Panel */}
                    <div className="overflow-hidden rounded-2xl border border-[#d3ece7] bg-white shadow-sm">
                        <div
                            className="flex cursor-pointer items-center justify-between bg-[#e1f3ef] p-4 transition-colors hover:bg-[#d3ece7]"
                            onClick={() => setIsFormOpen(!isFormOpen)}
                        >
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#145e5b]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Ambil Nomor Antrian Baru
                            </h2>
                            <svg
                                className={`h-5 w-5 transform text-[#145e5b] transition-transform ${isFormOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>

                        {isFormOpen && (
                            <form
                                onSubmit={handleAmbilAntrian}
                                className="space-y-4 border-t border-[#d3ece7] p-6"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Jadwal Dokter
                                        </label>
                                        <select
                                            required
                                            value={formData.jadwal_dokter_id}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    jadwal_dokter_id:
                                                        e.target.value,
                                                })
                                            }
                                            className="focus:ring-opacity-20 w-full rounded-xl border-gray-300 shadow-sm focus:border-[#145e5b] focus:ring focus:ring-[#145e5b]"
                                        >
                                            <option value="">
                                                Pilih Jadwal...
                                            </option>
                                            {jadwalDokterHariIni.map((j) => (
                                                <option key={j.id} value={j.id}>
                                                    dr. {j.dokter.nama_lengkap}{' '}
                                                    - {j.poli.nama_poli} (
                                                    {j.jam_mulai.slice(0, 5)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Pasien
                                        </label>
                                        <select
                                            required
                                            value={formData.pasien_id}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    pasien_id: e.target.value,
                                                })
                                            }
                                            className="focus:ring-opacity-20 w-full rounded-xl border-gray-300 shadow-sm focus:border-[#145e5b] focus:ring focus:ring-[#145e5b]"
                                        >
                                            <option value="">
                                                Pilih Pasien...
                                            </option>
                                            {pasienList.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nama_lengkap}{' '}
                                                    {p.nomor_rekam_medis
                                                        ? `(${p.nomor_rekam_medis})`
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Tipe Pasien
                                        </label>
                                        <select
                                            required
                                            value={formData.tipe_pasien}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    tipe_pasien: e.target
                                                        .value as any,
                                                })
                                            }
                                            className="focus:ring-opacity-20 w-full rounded-xl border-gray-300 shadow-sm focus:border-[#145e5b] focus:ring focus:ring-[#145e5b]"
                                        >
                                            <option value="umum">Umum</option>
                                            <option value="bpjs">BPJS</option>
                                            <option value="prioritas">
                                                Prioritas
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-[#145e5b] px-6 py-2 font-medium text-white shadow-sm transition-colors hover:bg-[#0f4744] disabled:opacity-50"
                                    >
                                        {isSubmitting
                                            ? 'Memproses...'
                                            : 'Ambil Nomor Antrian'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="flex flex-col gap-6 lg:flex-row">
                        {/* Left Sidebar: Doctor Schedules */}
                        <div className="w-full flex-shrink-0 space-y-3 lg:w-[280px]">
                            <h3 className="mb-4 text-lg font-bold text-[#145e5b]">
                                Jadwal Hari Ini
                            </h3>

                            <div
                                onClick={() => setSelectedJadwalId(null)}
                                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                                    selectedJadwalId === null
                                        ? 'border-transparent bg-[#145e5b] text-white shadow-md'
                                        : 'border-[#d3ece7] bg-white text-gray-700 hover:bg-[#e1f3ef]'
                                }`}
                            >
                                <p className="font-semibold">Semua Antrian</p>
                            </div>

                            {jadwalDokterHariIni.map((jadwal) => {
                                const isSelected =
                                    selectedJadwalId === jadwal.id;
                                const quotaColor =
                                    jadwal.sisa_kuota === 0
                                        ? 'bg-red-500'
                                        : jadwal.sisa_kuota <= 5
                                          ? 'bg-yellow-500'
                                          : 'bg-green-500';

                                return (
                                    <div
                                        key={jadwal.id}
                                        onClick={() => {
                                            setSelectedJadwalId(jadwal.id);
                                            setFormData((prev) => ({
                                                ...prev,
                                                jadwal_dokter_id: jadwal.id,
                                            }));
                                        }}
                                        className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
                                            isSelected
                                                ? 'border-transparent bg-[#145e5b] text-white ring-2 ring-[#145e5b] ring-offset-2'
                                                : 'border-[#d3ece7] bg-white hover:border-[#145e5b]'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-start justify-between">
                                            <div>
                                                <p
                                                    className={`font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}
                                                >
                                                    dr.{' '}
                                                    {jadwal.dokter.nama_lengkap}
                                                </p>
                                                <p
                                                    className={`text-xs ${isSelected ? 'text-teal-100' : 'text-gray-500'}`}
                                                >
                                                    {jadwal.poli.nama_poli}{' '}
                                                    {jadwal.ruangan
                                                        ? `• ${jadwal.ruangan.nama_ruangan}`
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className={`mb-3 flex items-center gap-1.5 text-xs ${isSelected ? 'text-teal-50' : 'text-gray-600'}`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-teal-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span className="font-semibold">
                                                Praktik:
                                            </span>{' '}
                                            {jadwal.jam_mulai.slice(0, 5)} -{' '}
                                            {jadwal.jam_selesai.slice(0, 5)} WIB
                                        </div>

                                        <div className="mb-3 space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span
                                                    className={
                                                        isSelected
                                                            ? 'text-teal-100'
                                                            : 'text-gray-500'
                                                    }
                                                >
                                                    Kuota Pasien
                                                </span>
                                                <span
                                                    className={
                                                        isSelected
                                                            ? 'font-medium text-white'
                                                            : 'font-medium text-gray-700'
                                                    }
                                                >
                                                    {jadwal.antrian_aktif_count}{' '}
                                                    / {jadwal.kuota_maksimal}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                                <div
                                                    className={`h-1.5 rounded-full ${quotaColor}`}
                                                    style={{
                                                        width: `${Math.min(100, (jadwal.antrian_aktif_count / jadwal.kuota_maksimal) * 100)}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedJadwalId(jadwal.id);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    jadwal_dokter_id: jadwal.id,
                                                }));
                                                setIsFormOpen(true);
                                            }}
                                            className={`w-full rounded-xl py-1.5 text-xs font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-teal-400 text-slate-950 hover:bg-teal-300'
                                                    : 'bg-[#e1f3ef] text-[#145e5b] hover:bg-[#d3ece7]'
                                            }`}
                                        >
                                            + Ambil Antrian Dokter Ini
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Main Content: Queue Table */}
                        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#d3ece7] bg-white shadow-sm">
                            {/* Action Bar */}
                            {selectedJadwalId && (
                                <div className="flex items-center justify-between border-b border-[#e1f3ef] bg-gray-50 p-4">
                                    <h3 className="font-semibold text-gray-700">
                                        Daftar Antrian
                                    </h3>
                                    <button
                                        onClick={handlePanggilBerikutnya}
                                        className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                                            />
                                        </svg>
                                        Panggil Berikutnya
                                    </button>
                                </div>
                            )}

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="border-b border-[#d3ece7] bg-[#f0faf7] text-xs font-semibold text-[#145e5b] uppercase">
                                        <tr>
                                            <th className="px-6 py-4">
                                                No. Antrian
                                            </th>
                                            <th className="px-6 py-4">
                                                Pasien
                                            </th>
                                            <th className="px-6 py-4">Tipe</th>
                                            <th className="px-6 py-4">
                                                Status
                                            </th>
                                            <th className="px-6 py-4">
                                                Waktu Daftar
                                            </th>
                                            <th className="px-6 py-4 text-center">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredAntrian.length > 0 ? (
                                            filteredAntrian.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="transition-colors hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="text-lg font-bold text-gray-800">
                                                            {item.nomor_antrian}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-medium text-gray-800">
                                                            {
                                                                item.pasien
                                                                    .nama_lengkap
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            RM:{' '}
                                                            {item.pasien
                                                                .nomor_rekam_medis ||
                                                                '-'}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-600 capitalize">
                                                            {item.tipe_pasien}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeColor(item.status)}`}
                                                        >
                                                            {item.status
                                                                .replace(
                                                                    '_',
                                                                    ' ',
                                                                )
                                                                .toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500">
                                                        {new Date(
                                                            item.created_at,
                                                        ).toLocaleTimeString(
                                                            'id-ID',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {item.status ===
                                                                'menunggu' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            item.id,
                                                                            'skrining',
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-600"
                                                                >
                                                                    Skrining
                                                                </button>
                                                            )}
                                                            {item.status ===
                                                                'skrining' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            item.id,
                                                                            'dipanggil',
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-orange-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-600"
                                                                >
                                                                    Panggil
                                                                </button>
                                                            )}
                                                            {item.status ===
                                                                'dipanggil' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            item.id,
                                                                            'sedang_dilayani',
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-green-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-600"
                                                                >
                                                                    Layani
                                                                </button>
                                                            )}
                                                            {item.status ===
                                                                'sedang_dilayani' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            item.id,
                                                                            'selesai',
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-gray-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-700"
                                                                >
                                                                    Selesai
                                                                </button>
                                                            )}

                                                            {[
                                                                'menunggu',
                                                                'skrining',
                                                                'dipanggil',
                                                            ].includes(
                                                                item.status,
                                                            ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            item.id,
                                                                            'dilewati',
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-red-200 bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                                                                >
                                                                    Lewati
                                                                </button>
                                                            )}
                                                            {[
                                                                'menunggu',
                                                                'skrining',
                                                            ].includes(
                                                                item.status,
                                                            ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            item.id,
                                                                            'dibatalkan',
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-red-200 bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                                                                >
                                                                    Batal
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-12 text-center text-gray-500"
                                                >
                                                    Tidak ada antrian untuk
                                                    jadwal ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
