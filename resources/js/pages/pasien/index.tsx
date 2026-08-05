import { router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import type { Role } from '../../types/simrs';

interface PasienProps {
    user: any;
    role: Role;
    patients: any;
    filters?: { search?: string };
}

export default function PasienIndex({
    user,
    role = 'admin',
    patients = [],
    filters = {},
}: PasienProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const patientList = Array.isArray(patients)
        ? patients
        : ((patients as any)?.data ?? []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/pasien',
            { search: search.trim() || undefined },
            { preserveState: true, replace: true },
        );
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: '',
        nik: '',
        jenis_kelamin: 'Laki-laki',
        golongan_darah: 'A',
        no_hp: '',
        email: '',
        alamat: '',
        jenis_layanan: '',
        penjamin: 'umum',
        nomor_penjamin: '',
        prioritas: 'normal',
        keluhan: '',
    });

    const handleSubmitPatient = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pasien', {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    const getLayananBadge = (jenis: string | null, status: string | null) => {
        if (!jenis || status === 'belum_daftar') {
            return (
                <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-gray-600">
                    Belum Terdaftar
                </span>
            );
        }

        const colorMap: Record<string, string> = {
            rawat_jalan: 'bg-blue-100 text-blue-800 border-blue-200',
            rawat_inap: 'bg-purple-100 text-purple-800 border-purple-200',
            igd: 'bg-red-100 text-red-800 border-red-200 font-bold',
        };

        const labelMap: Record<string, string> = {
            rawat_jalan: 'Rawat Jalan',
            rawat_inap: 'Rawat Inap',
            igd: 'IGD',
        };

        return (
            <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                    colorMap[jenis] || 'bg-gray-100 text-gray-800'
                }`}
            >
                {labelMap[jenis] || jenis}
                {status && (
                    <span className="text-[10px] opacity-75">({status})</span>
                )}
            </span>
        );
    };

    return (
        <Layout user={user} role={role}>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Manajemen Data Pasien
                    </h1>
                    <p className="text-xs text-gray-500">
                        Daftar rekam medis dan pendaftaran layanan pasien (Rawat Jalan, Rawat Inap, IGD)
                    </p>
                </div>
                {(role === 'admin' || role === 'resepsionis') && (
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-800"
                    >
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
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Tambah Pasien Baru
                    </button>
                )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama, NIK, No. RM, atau No. Pendaftaran... (Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs text-gray-900 focus:border-primary focus:outline-none"
                    />
                </form>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-[760px] text-left text-xs text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">No. RM</th>
                            <th className="p-4">Nama Lengkap</th>
                            <th className="p-4">Status Layanan</th>
                            <th className="p-4">No. Pendaftaran</th>
                            <th className="p-4">NIK</th>
                            <th className="p-4">JK</th>
                            <th className="p-4">Gol. Darah</th>
                            <th className="p-4">No. HP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {patientList.map((p: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-4 font-mono font-bold text-teal-800">
                                    {p.nomor_rekam_medis}
                                </td>
                                <td className="p-4 font-semibold text-gray-900">
                                    {p.nama_lengkap}
                                </td>
                                <td className="p-4">
                                    {getLayananBadge(p.jenis_layanan, p.status_pendaftaran)}
                                </td>
                                <td className="p-4 font-mono font-semibold text-gray-700">
                                    {p.nomor_pendaftaran || '-'}
                                </td>
                                <td className="p-4 font-mono">{p.nik || '-'}</td>
                                <td className="p-4">{p.jenis_kelamin || '-'}</td>
                                <td className="p-4 font-bold text-teal-800">
                                    {p.golongan_darah || '-'}
                                </td>
                                <td className="p-4">{p.no_hp || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form Tambah Pasien (Admin & Resepsionis) */}
            {isModalOpen && (role === 'admin' || role === 'resepsionis') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Tambah Data Pasien Baru
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Daftarkan rekam medis dan opsi pendaftaran layanan pasien
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPatient} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.nama_lengkap}
                                    onChange={(e) =>
                                        setData('nama_lengkap', e.target.value)
                                    }
                                    placeholder="Contoh: Budi Santoso"
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                />
                                {errors.nama_lengkap && (
                                    <p className="mt-1 text-[11px] text-red-600">
                                        {errors.nama_lengkap}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        NIK (KTP)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nik}
                                        onChange={(e) =>
                                            setData('nik', e.target.value)
                                        }
                                        placeholder="16 digit NIK"
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        No. Handphone
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_hp}
                                        onChange={(e) =>
                                            setData('no_hp', e.target.value)
                                        }
                                        placeholder="0812xxxxxxxx"
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        value={data.jenis_kelamin}
                                        onChange={(e) =>
                                            setData('jenis_kelamin', e.target.value)
                                        }
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                    >
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Golongan Darah
                                    </label>
                                    <select
                                        value={data.golongan_darah}
                                        onChange={(e) =>
                                            setData('golongan_darah', e.target.value)
                                        }
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                        <option value="-">-</option>
                                    </select>
                                </div>
                            </div>

                            {/* Dropdown Status Pendaftaran / Jenis Layanan */}
                            <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3 space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-teal-900">
                                        Status Pendaftaran / Jenis Layanan
                                    </label>
                                    <select
                                        value={data.jenis_layanan}
                                        onChange={(e) =>
                                            setData('jenis_layanan', e.target.value)
                                        }
                                        className="mt-1 w-full rounded-xl border border-teal-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-900 focus:border-teal-700 focus:outline-none"
                                    >
                                        <option value="">- Belum Mendaftar Layanan -</option>
                                        <option value="rawat_jalan">Rawat Jalan</option>
                                        <option value="rawat_inap">Rawat Inap</option>
                                        <option value="igd">IGD (Gawat Darurat)</option>
                                    </select>
                                </div>

                                {data.jenis_layanan !== '' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700">
                                                    Penjamin
                                                </label>
                                                <select
                                                    value={data.penjamin}
                                                    onChange={(e) =>
                                                        setData('penjamin', e.target.value)
                                                    }
                                                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                                >
                                                    <option value="umum">Umum</option>
                                                    <option value="bpjs">BPJS Kesehatan</option>
                                                    <option value="asuransi">Asuransi Swasta</option>
                                                </select>
                                            </div>

                                            {data.jenis_layanan === 'igd' && (
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700">
                                                        Prioritas IGD
                                                    </label>
                                                    <select
                                                        value={data.prioritas}
                                                        onChange={(e) =>
                                                            setData('prioritas', e.target.value)
                                                        }
                                                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                                    >
                                                        <option value="normal">Normal</option>
                                                        <option value="urgent">Urgent</option>
                                                        <option value="emergency">Emergency</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {data.penjamin !== 'umum' && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700">
                                                    Nomor Kartu BPJS / Asuransi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.nomor_penjamin}
                                                    onChange={(e) =>
                                                        setData('nomor_penjamin', e.target.value)
                                                    }
                                                    placeholder="Nomor kartu..."
                                                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Keluhan Utama
                                            </label>
                                            <input
                                                type="text"
                                                value={data.keluhan}
                                                onChange={(e) =>
                                                    setData('keluhan', e.target.value)
                                                }
                                                placeholder="Keluhan singkat pasien..."
                                                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Email Pasien
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="pasien@email.com"
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Alamat Tempat Tinggal
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.alamat}
                                    onChange={(e) =>
                                        setData('alamat', e.target.value)
                                    }
                                    placeholder="Alamat lengkap..."
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Pasien'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
