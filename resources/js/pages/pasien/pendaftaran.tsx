import { Link, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { Layout } from '../../components/layout';
import { ToastContainer, type ToastMessage } from '../../components/toast';
import type { Role } from '../../types/simrs';

interface PendaftaranProps {
    user: any;
    role?: Role;
    poliList?: any[];
    ruanganList?: any[];
}

export default function PendaftaranPasienPage({
    user,
    role = 'admin',
}: PendaftaranProps) {
    const [duplicateInfo, setDuplicateInfo] = useState<{
        nama_lengkap: string;
        nomor_rekam_medis: string;
        nik: string;
    } | null>(null);

    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const hpInputRef = useRef<HTMLInputElement>(null);

    const addToast = (toast: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastMessage = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: '',
        nik: '',
        tanggal_lahir: '',
        jenis_kelamin: 'Perempuan',
        alamat: '',
        provinsi: '',
        kota_kabupaten: '',
        no_hp: '',
        email: '',
        penjamin: 'umum',
        jenis_layanan: 'rawat_jalan',
        golongan_darah: '',
        alergi: '',
        nama_kontak_darurat: '',
        no_hp_kontak_darurat: '',
    });

    // Pengecekan otomatis potensi data ganda berdasarkan NIK
    useEffect(() => {
        const trimmedNik = data.nik.trim();
        if (trimmedNik.length >= 8) {
            const timer = setTimeout(() => {
                fetch(`/api/check-nik?nik=${encodeURIComponent(trimmedNik)}`)
                    .then((res) => res.json())
                    .then((resData) => {
                        if (resData.exists && resData.patient) {
                            setDuplicateInfo({
                                nama_lengkap: resData.patient.nama_lengkap,
                                nomor_rekam_medis:
                                    resData.patient.nomor_rekam_medis,
                                nik: resData.patient.nik,
                            });
                        } else {
                            setDuplicateInfo(null);
                        }
                    })
                    .catch(() => setDuplicateInfo(null));
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setDuplicateInfo(null);
        }
    }, [data.nik]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi data belum lengkap
        if (!data.nama_lengkap.trim() || !data.nik.trim()) {
            addToast({
                type: 'warning',
                title: 'Data Belum Lengkap',
                description: 'Harap periksa kembali field yang ditandai merah.',
            });
            return;
        }

        // Validasi format nomor HP jika diisi (misal harus 08xxx)
        if (data.no_hp.trim() && !/^08\d{8,12}$/.test(data.no_hp.trim())) {
            addToast({
                type: 'error',
                title: 'Pendaftaran Gagal',
                description:
                    'Nomor HP tidak valid. Gunakan format: 08xx-xxxx-xxxx',
                actionText: 'Coba Lagi',
                onAction: () => {
                    if (hpInputRef.current) hpInputRef.current.focus();
                },
            });
            return;
        }

        post('/pasien', {
            onSuccess: () => {
                const randomRm = `RM-2026-${Math.floor(
                    10000 + Math.random() * 90000,
                )
                    .toString()
                    .substring(1)}`;
                addToast({
                    type: 'success',
                    title: 'Pasien Berhasil Terdaftar',
                    description: `Nomor Rekam Medis: ${randomRm}`,
                });
                reset();
            },
            onError: () => {
                addToast({
                    type: 'error',
                    title: 'Pendaftaran Gagal',
                    description:
                        'Terjadi kesalahan sistem saat mendaftarkan pasien.',
                    actionText: 'Coba Lagi',
                });
            },
        });
    };

    const handleReset = () => {
        reset();
        setDuplicateInfo(null);
        addToast({
            type: 'info',
            title: 'Perubahan berhasil disimpan',
        });
    };

    const daftarProvinsi = [
        'DKI Jakarta',
        'Jawa Barat',
        'Jawa Tengah',
        'Jawa Timur',
        'Banten',
        'DI Yogyakarta',
        'Bali',
        'Sumatera Utara',
        'Sumatera Selatan',
        'Kalimantan Timur',
        'Kalimantan Barat',
        'Kalimantan Selatan',
        'Sulawesi Utara',
        'Sulawesi Selatan',
        'Maluku',
        'Papua',
    ];

    const daftarKota = [
        'Kota Jakarta Selatan',
        'Kota Jakarta Pusat',
        'Kota Bandung',
        'Kab. Bogor',
        'Kota Surabaya',
        'Kota Semarang',
        'Kota Tangerang',
    ];

    return (
        <Layout user={user} role={role} title="Pendaftaran Pasien">
            {/* Container Toast Notifications */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Breadcrumbs & Header Section */}
                <div>
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Link
                            href="/dashboard"
                            className="transition hover:text-[#145e5b]"
                        >
                            Dashboard
                        </Link>
                        <span>&rsaquo;</span>
                        <span className="font-semibold text-gray-800">
                            Pendaftaran Pasien
                        </span>
                    </div>

                    <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                        Pendaftaran Pasien Baru
                    </h1>
                    <p className="mt-1 text-xs text-gray-500 md:text-sm">
                        Silakan lengkapi data pasien dengan benar untuk
                        keperluan rekam medis.
                    </p>
                </div>

                {/* Banner Warning Red Box - Potensi Data Ganda */}
                {duplicateInfo && (
                    <div className="rounded-xl border border-red-300 bg-red-50/90 p-4 shadow-2xs transition-all">
                        <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1 text-xs">
                                <h3 className="text-xs font-bold text-red-800 md:text-sm">
                                    Perhatian: Potensi Data Ganda
                                </h3>
                                <p className="mt-1 leading-relaxed text-red-700">
                                    NIK ini sudah terdaftar atas nama{' '}
                                    <span className="font-bold text-red-900">
                                        {duplicateInfo.nama_lengkap}
                                    </span>
                                    , Nomor RM:{' '}
                                    <span className="font-mono font-bold text-red-900">
                                        {duplicateInfo.nomor_rekam_medis}
                                    </span>
                                    .
                                </p>
                                <div className="mt-2">
                                    <Link
                                        href={`/pasien?search=${encodeURIComponent(duplicateInfo.nik)}`}
                                        className="inline-flex items-center gap-1 font-semibold text-red-700 underline hover:text-red-900"
                                    >
                                        Lihat Data Pasien &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Card Container */}
                <div className="rounded-2xl border border-[#d3ece7] bg-white p-6 shadow-xs md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Data Pribadi */}
                        <div className="space-y-4">
                            <h2 className="border-b border-gray-200 pb-2 font-serif text-base font-bold text-gray-900">
                                Data Pribadi
                            </h2>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                    Nama Lengkap (Sesuai KTP)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.nama_lengkap}
                                    onChange={(e) =>
                                        setData('nama_lengkap', e.target.value)
                                    }
                                    placeholder="Contoh: Siti Aminah"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                />
                                {errors.nama_lengkap && (
                                    <p className="mt-1 text-[11px] text-red-600">
                                        {errors.nama_lengkap}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Nomor Induk Kependudukan (NIK)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nik}
                                        onChange={(e) =>
                                            setData('nik', e.target.value)
                                        }
                                        placeholder="3201012304950001"
                                        className={`w-full rounded-lg border px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none ${
                                            duplicateInfo
                                                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                                                : 'border-gray-300 bg-white focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b]'
                                        }`}
                                    />
                                    {duplicateInfo && (
                                        <p className="mt-1 text-[11px] font-medium text-red-600">
                                            NIK terindikasi duplikat.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Tanggal Lahir
                                    </label>
                                    <input
                                        type="date"
                                        value={data.tanggal_lahir}
                                        onChange={(e) =>
                                            setData(
                                                'tanggal_lahir',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="mm/dd/yyyy"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-gray-700">
                                    Jenis Kelamin
                                </label>
                                <div className="flex items-center gap-6">
                                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-800">
                                        <input
                                            type="radio"
                                            name="jenis_kelamin"
                                            value="Laki-laki"
                                            checked={
                                                data.jenis_kelamin ===
                                                'Laki-laki'
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'jenis_kelamin',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-4 w-4 text-[#145e5b] accent-[#145e5b] focus:ring-[#145e5b]"
                                        />
                                        Laki-laki
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-800">
                                        <input
                                            type="radio"
                                            name="jenis_kelamin"
                                            value="Perempuan"
                                            checked={
                                                data.jenis_kelamin ===
                                                'Perempuan'
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'jenis_kelamin',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-4 w-4 text-[#145e5b] accent-[#145e5b] focus:ring-[#145e5b]"
                                        />
                                        Perempuan
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Kontak & Alamat */}
                        <div className="space-y-4">
                            <h2 className="border-b border-gray-200 pb-2 font-serif text-base font-bold text-gray-900">
                                Kontak & Alamat
                            </h2>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.alamat}
                                    onChange={(e) =>
                                        setData('alamat', e.target.value)
                                    }
                                    placeholder="Nama jalan, RT/RW, kelurahan..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Provinsi
                                    </label>
                                    <select
                                        value={data.provinsi}
                                        onChange={(e) =>
                                            setData('provinsi', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        {daftarProvinsi.map((p, idx) => (
                                            <option key={idx} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Kota/Kabupaten
                                    </label>
                                    <select
                                        value={data.kota_kabupaten}
                                        onChange={(e) =>
                                            setData(
                                                'kota_kabupaten',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                    >
                                        <option value="">
                                            Pilih Kota/Kabupaten
                                        </option>
                                        {daftarKota.map((k, idx) => (
                                            <option key={idx} value={k}>
                                                {k}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Nomor HP
                                    </label>
                                    <input
                                        ref={hpInputRef}
                                        type="text"
                                        value={data.no_hp}
                                        onChange={(e) =>
                                            setData('no_hp', e.target.value)
                                        }
                                        placeholder="08xxx..."
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Email (Opsional)
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="contoh@email.com"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Penjamin & Layanan Pendaftaran */}
                        <div className="space-y-4">
                            <h2 className="border-b border-gray-200 pb-2 font-serif text-base font-bold text-gray-900">
                                Penjamin & Layanan Pendaftaran
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Jenis Penjamin
                                    </label>
                                    <select
                                        value={data.penjamin}
                                        onChange={(e) =>
                                            setData('penjamin', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                    >
                                        <option value="umum">
                                            Umum / Mandiri
                                        </option>
                                        <option value="bpjs">
                                            BPJS Kesehatan
                                        </option>
                                        <option value="asuransi">
                                            Asuransi Swasta
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Jenis Layanan Pendaftaran
                                    </label>
                                    <select
                                        value={data.jenis_layanan}
                                        onChange={(e) =>
                                            setData(
                                                'jenis_layanan',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                    >
                                        <option value="rawat_jalan">
                                            Rawat Jalan
                                        </option>
                                        <option value="rawat_inap">
                                            Rawat Inap
                                        </option>
                                        <option value="igd">
                                            IGD (Gawat Darurat)
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Data Kesehatan & Kontak Darurat */}
                        <div className="space-y-4">
                            <h2 className="border-b border-gray-200 pb-2 font-serif text-base font-bold text-gray-900">
                                Data Kesehatan & Kontak Darurat
                            </h2>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                    Golongan Darah
                                </label>
                                <select
                                    value={data.golongan_darah}
                                    onChange={(e) =>
                                        setData(
                                            'golongan_darah',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                >
                                    <option value="">
                                        Pilih Golongan Darah
                                    </option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="O">O</option>
                                    <option value="-">-</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                    Alergi
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.alergi}
                                    onChange={(e) =>
                                        setData('alergi', e.target.value)
                                    }
                                    placeholder="Contoh: Alergi susu, antibiotik penisilin — kosongkan jika tidak ada."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Nama Kontak Darurat
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_kontak_darurat}
                                        onChange={(e) =>
                                            setData(
                                                'nama_kontak_darurat',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Nama lengkap kontak darurat"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        Nomor HP Kontak Darurat
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_hp_kontak_darurat}
                                        onChange={(e) =>
                                            setData(
                                                'no_hp_kontak_darurat',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="08xxx..."
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:ring-1 focus:ring-[#145e5b] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                            <Link
                                href="/pasien"
                                className="px-5 py-2.5 text-xs font-semibold text-gray-700 transition hover:text-gray-900"
                            >
                                Batal
                            </Link>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-lg border border-[#145e5b] px-5 py-2.5 text-xs font-semibold text-[#145e5b] transition hover:bg-[#e4f6f2]"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 rounded-lg bg-[#145e5b] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0e4845] disabled:opacity-50"
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
                                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                    />
                                </svg>
                                Simpan Pasien
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
