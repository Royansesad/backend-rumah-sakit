import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';
import { ROLE_LABELS } from '../types/simrs';

interface DashboardProps {
    user: any;
    role: Role;
    stats: any[];
    recentAuditLogs: any[];
}

export default function Dashboard({
    user,
    role = 'admin',
    stats = [],
    recentAuditLogs = [],
}: DashboardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    return (
        <Layout user={user} role={role}>
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="min-w-0">
                    <h1 className="flex flex-wrap items-center gap-3 text-xl font-bold text-gray-900 sm:text-2xl">
                        <span className="truncate">
                            Selamat Datang, {user?.nama_lengkap || 'Pengguna'}
                        </span>
                    </h1>
                    <p className="mt-1 text-xs text-gray-500">
                        Sistem Informasi Manajemen Rumah Sakit - Mode Portal{' '}
                        {ROLE_LABELS[role]}
                    </p>
                </div>
                <div className="flex items-center gap-3">
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
                    <span className="w-fit rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-teal-950 uppercase shadow-md">
                        {ROLE_LABELS[role]}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(stats.length > 0
                    ? stats
                    : [
                          {
                              label: 'Total User Staff',
                              value: '9 Account',
                              icon: 'US',
                          },
                          {
                              label: 'Total Pasien',
                              value: '3 Terdaftar',
                              icon: 'TP',
                          },
                          {
                              label: 'Sesi Aktif',
                              value: '1 Online',
                              icon: 'SA',
                          },
                          {
                              label: 'Audit Logs',
                              value: '3 Entries',
                              icon: 'AL',
                          },
                      ]
                ).map((st, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/30 font-bold text-teal-900">
                            {st.icon || 'ST'}
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">
                                {st.label}
                            </div>
                            <div className="mt-0.5 text-xl font-bold text-gray-900">
                                {st.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <span>Aktivitas Sistem Terbaru (Audit Log)</span>
                </h2>

                <div className="space-y-3">
                    {(recentAuditLogs.length > 0
                        ? recentAuditLogs
                        : [
                              {
                                  id: 1,
                                  modul: 'system',
                                  aksi: 'INITIALIZE',
                                  pembuat_type: 'admin',
                                  created_at: 'Baru Saja',
                              },
                              {
                                  id: 2,
                                  modul: 'pasien',
                                  aksi: 'CREATE_PATIENT',
                                  pembuat_type: 'admin',
                                  created_at: '5 menit lalu',
                              },
                          ]
                    ).map((log: any, idx: number) => (
                        <div
                            key={idx}
                            className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="shrink-0 rounded bg-primary/25 px-2 py-0.5 font-mono font-bold text-teal-800 uppercase">
                                    {log.aksi}
                                </span>
                                <span className="truncate font-medium text-gray-900">
                                    {log.modul}
                                </span>
                            </div>
                            <div className="shrink-0 text-gray-500">
                                {log.pembuat_type} • {log.created_at}
                            </div>
                        </div>
                    ))}
                </div>
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
