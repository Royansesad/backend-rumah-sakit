import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';
import { ROLE_LABELS } from '../types/simrs';
// Ikon menggunakan SVG inline agar tidak perlu install ulang library di project ini
// Jika project Anda sudah punya lucide-react/heroicons, bisa diganti nanti sesuai keinginan.

interface DashboardProps {
    user: any;
    role: Role;
    stats?: any[];
    recentAuditLogs?: any[];
}

export default function Dashboard({
    user,
    role = 'admin',
    stats = [],
    recentAuditLogs = [],
}: DashboardProps) {
    // [TIDAK DIUBAH] State form dan modal
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

    // =======================================================================
    // [DIUBAH] Sesuai permintaan, saya membuat 5 tampilan Dashboard yang berbeda
    // =======================================================================

    // 1. Dashboard Admin (Gambar 4)
    const AdminDashboard = () => (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="mb-1 font-serif text-3xl text-[#0d4f42]">
                        Dashboard Admin
                    </h1>
                    <p className="text-sm text-gray-500">
                        Overview of RS Sentosa Medika operations for today.
                    </p>
                </div>
            </div>

            {/* Statistik Admin */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        label: 'Total Pasien Terdaftar',
                        value: '8.240',
                        trend: '↑ +5% vs last month',
                        icon: <i className="fa-solid fa-user-group text-[#0d4f42]"></i>,
                    },
                    {
                        label: 'Appointment Hari Ini',
                        value: '156',
                        trend: '↓ -2% vs yesterday',
                        icon: <i className="fa-solid fa-calendar-check text-[#0d4f42]"></i>,
                    },
                    {
                        label: 'Pendapatan Bulan Ini',
                        value: 'Rp 1.245M',
                        trend: '↑ +12% vs last month',
                        icon: <i className="fa-solid fa-wallet text-[#0d4f42]"></i>,
                    },
                    {
                        label: 'Dokter Aktif',
                        value: '42',
                        trend: '→ Stable',
                        icon: <i className="fa-solid fa-user-doctor text-[#0d4f42]"></i>,
                    },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <span className="text-sm text-gray-500">
                                {stat.label}
                            </span>
                            <span className="text-xl">{stat.icon}</span>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl font-bold text-gray-900">
                                {stat.value}
                            </div>
                            <div
                                className={`mt-1 text-xs font-medium ${stat.trend.includes('↑') ? 'text-red-500' : stat.trend.includes('↓') ? 'text-red-500' : 'text-gray-500'}`}
                            >
                                {stat.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Kunjungan Pasien & Aktivitas Terbaru */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">
                            Kunjungan Pasien
                        </h3>
                        <span className="rounded-full bg-[#d1fae5] px-3 py-1 text-xs font-medium text-[#0d4f42]">
                            7 Hari Terakhir
                        </span>
                    </div>
                    {/* Chart Bars mock-up */}
                    <div className="flex h-40 items-end justify-between gap-4 px-2 pt-10">
                        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(
                            (day, idx) => (
                                <div
                                    key={idx}
                                    className="flex w-full flex-col items-center gap-2"
                                >
                                    <div
                                        className={`w-full h-${idx === 3 ? 24 : 12 + idx * 2} ${idx === 3 ? 'bg-[#0d4f42]' : 'bg-[#0d4f42]/20'} rounded-t-sm`}
                                    ></div>
                                    <span
                                        className={`text-xs font-medium ${idx === 3 ? 'font-bold text-[#0d4f42]' : 'text-gray-500'}`}
                                    >
                                        {day}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 font-bold text-gray-900">
                        Aktivitas Terbaru
                    </h3>
                    <div className="space-y-4">
                        {[
                            {
                                title: 'Admin Budi menambahkan dokter baru: Dr. Siti Nurhaliza.',
                                time: '2 menit lalu',
                                icon: <i className="fa-solid fa-user text-xs text-teal-700"></i>,
                            },
                            {
                                title: 'Suster Rina mengubah jadwal poli Gigi.',
                                time: '45 menit lalu',
                                icon: <i className="fa-solid fa-calendar-days text-xs text-teal-700"></i>,
                            },
                            {
                                title: 'Sistem melaporkan stok Paracetamol menipis (Sisa: 2 Box).',
                                time: '1 jam lalu',
                                icon: <i className="fa-solid fa-box text-xs text-teal-700"></i>,
                            },
                        ].map((act, idx) => (
                            <div
                                key={idx}
                                className="relative flex items-start gap-3"
                            >
                                {idx !== 2 && (
                                    <div className="absolute top-8 bottom-0 left-3 -ml-px w-px bg-gray-200"></div>
                                )}
                                <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs">
                                    {act.icon}
                                </div>
                                <div>
                                    <p className="text-sm leading-tight text-gray-800">
                                        {act.title}
                                    </p>
                                    <span className="mt-1 block text-xs text-gray-400">
                                        {act.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 2. Dashboard Billing / Kasir (Gambar 1)
    const BillingDashboard = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-1 font-serif text-3xl text-[#0d4f42]">
                        Billing & Tagihan
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola pembayaran dan invoice pasien terdaftar.
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700">
                    <i className="fa-solid fa-filter text-xs"></i> Filter
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Tabel Tagihan */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-200 text-gray-500">
                            <tr>
                                <th className="p-4 font-medium">No. Invoice</th>
                                <th className="p-4 font-medium">Nama Pasien</th>
                                <th className="p-4 font-medium">Layanan</th>
                                <th className="p-4 font-medium">
                                    Total Tagihan
                                </th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                {
                                    inv: 'INV-202310-042',
                                    name: 'Budi Santoso',
                                    service: 'Poli Penyakit Dalam',
                                    total: 'Rp 1.250.000',
                                    status: 'Belum Lunas',
                                    bg: 'bg-[#d1fae5]',
                                },
                                {
                                    inv: 'INV-202310-041',
                                    name: 'Siti Aminah',
                                    service: 'IGD',
                                    total: 'Rp 3.400.000',
                                    status: 'Lunas',
                                    bg: 'bg-white',
                                },
                                {
                                    inv: 'INV-202310-040',
                                    name: 'Ahmad Fauzi',
                                    service: 'Poli Gigi',
                                    total: 'Rp 450.000',
                                    status: 'Lunas',
                                    bg: 'bg-white',
                                },
                            ].map((row, idx) => (
                                <tr
                                    key={idx}
                                    className={`${row.bg} cursor-pointer border-b border-gray-100 transition-colors hover:bg-teal-50/50`}
                                >
                                    <td className="p-4 font-bold text-gray-900">
                                        {row.inv}
                                    </td>
                                    <td className="p-4 font-medium text-gray-700">
                                        {row.name}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {row.service}
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">
                                        {row.total}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold ${row.status === 'Belum Lunas' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Detail Invoice (Sidebar Kanan) */}
                <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-sm font-bold text-gray-400">
                            Rincian Invoice
                        </h3>
                        <button className="text-gray-400 hover:text-gray-700">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <h2 className="text-lg font-bold text-[#0d4f42]">
                        INV-202310-042
                    </h2>
                    <p className="mb-6 text-sm text-gray-600">Budi Santoso</p>

                    <div className="mb-4 space-y-4 border-b border-gray-100 pb-4">
                        {[
                            {
                                label: 'Konsultasi',
                                desc: 'Dr. Hermawan (Sp.PD)',
                                price: 'Rp 350.000',
                                icon: <i className="fa-solid fa-stethoscope"></i>,
                            },
                            {
                                label: 'Obat-obatan',
                                desc: 'Amoxicillin 500mg (10x)\nParacetamol 500mg (10x)',
                                price: 'Rp 200.000',
                                icon: <i className="fa-solid fa-pills"></i>,
                            },
                            {
                                label: 'Tindakan',
                                desc: 'Cek Darah Lengkap',
                                price: 'Rp 700.000',
                                icon: <i className="fa-solid fa-vial"></i>,
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-start justify-between"
                            >
                                <div className="flex gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs text-[#0d4f42]">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {item.label}
                                        </p>
                                        <p className="text-xs whitespace-pre-line text-gray-500">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-800">
                                    {item.price}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <span className="font-bold text-gray-800">
                            Total Tagihan
                        </span>
                        <span className="text-xl font-bold text-[#0d4f42]">
                            Rp 1.250.000
                        </span>
                    </div>

                    <div className="mb-4 space-y-2">
                        <p className="text-xs font-bold text-gray-700">
                            METODE PEMBAYARAN
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {['Tunai', 'Kartu', 'QRIS'].map((m, idx) => (
                                <button
                                    key={idx}
                                    className={`rounded-md border py-2 text-xs font-bold ${idx === 0 ? 'border-[#0d4f42] bg-[#d1fae5] text-[#0d4f42]' : 'border-gray-200 bg-white text-gray-700'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="w-full rounded-md bg-[#0d4f42] py-3 font-bold text-white transition-colors hover:bg-[#0a3d33]">
                        Proses Pembayaran
                    </button>
                </div>
            </div>
        </div>
    );

    // 3. Dashboard Perawat (Gambar 2)
    const NurseDashboard = () => (
        <div className="space-y-6">
            <div>
                <h1 className="mb-1 font-serif text-3xl text-[#0d4f42]">
                    Selamat bertugas, Suster Ani Rahmawati
                </h1>
                <p className="text-sm text-gray-500">
                    Semoga hari menyenangkan. Berikut adalah ringkasan tugas
                    Anda hari ini.
                </p>
            </div>

            {/* 3 Cards Top */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-[#d1fae5]/20 p-6">
                    <div className="mb-4 flex items-start justify-between">
                        <i className="fa-solid fa-bed text-2xl text-[#0d4f42]"></i>
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            <i className="fa-solid fa-triangle-exclamation text-xs"></i> 4 Perlu Perhatian
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Pasien Shift Ini</p>
                    <p className="mt-1 font-serif text-5xl text-[#0d4f42]">
                        12
                    </p>
                </div>

                <div className="relative rounded-xl border border-gray-200 bg-[#d1fae5]/20 p-6">
                    <span className="absolute top-4 right-4 rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">
                        Berakhir dlm 4j 30m
                    </span>
                    <i className="fa-regular fa-clock mb-4 block text-2xl text-[#0d4f42]"></i>
                    <p className="text-sm text-gray-600">Jadwal Shift Anda</p>
                    <p className="mt-1 text-2xl font-bold text-[#0d4f42]">
                        Shift Pagi
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        07:00 – 15:00 WIB
                    </p>
                </div>

                <div className="relative rounded-xl border border-red-100 bg-red-50 p-6">
                    <div className="mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-2xl text-red-600"></i>
                        <span className="text-sm font-bold text-red-800">
                            Peringatan Kritis
                        </span>
                    </div>
                    <p className="mb-4 text-xs leading-relaxed text-red-700">
                        Pasien di Kamar 204 (Ibu Kartini) butuh pemeriksaan
                        vitals segera. Tekanan darah fluktuatif pada pemeriksaan
                        terakhir.
                    </p>
                    <button className="w-full rounded-md bg-red-700 py-2 text-xs font-bold text-white">
                        Tindak Lanjuti Sekarang
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Daftar Tugas Perawatan */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-3">
                    <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="font-bold text-gray-900">
                            Daftar Tugas Perawatan
                        </h3>
                        <a
                            href="#"
                            className="text-sm font-bold text-[#0d4f42] flex items-center gap-1"
                        >
                            Lihat Semua <i className="fa-solid fa-arrow-right text-xs"></i>
                        </a>
                    </div>
                    <div className="space-y-4">
                        {[
                            {
                                task: 'Pemberian Obat Siang',
                                desc: 'Kamar 201 • Paracetamol 500mg, Amoxicillin',
                                time: '12:00 (Terlambat)',
                                status: false,
                            },
                            {
                                task: 'Cek Vitals Rutin',
                                desc: 'Kamar 204 • Tensi, Suhu, Nadi',
                                time: '14:00',
                                status: false,
                            },
                        ].map((t, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-4 md:flex-row md:items-center"
                            >
                                <div className="mb-2 flex items-center gap-3 md:mb-0">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded-md border-2 border-gray-300 accent-[#0d4f42]"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {t.task}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {t.desc}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`text-xs ${t.time.includes('Terlambat') ? 'font-bold text-red-600' : 'text-gray-500'}`}
                                    >
                                        {t.time}
                                    </span>
                                    <button className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                                        Tandai Selesai
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Aksi Cepat */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 font-bold text-gray-900">Aksi Cepat</h3>
                    <div className="space-y-3">
                        {[
                            {
                                label: 'Catat Vital Pasien',
                                desc: 'Input data TTV terbaru',
                                icon: <i className="fa-solid fa-chart-line text-lg text-teal-700"></i>,
                            },
                            {
                                label: 'Lihat Daftar Monitoring',
                                desc: 'Jadwal observasi pasien',
                                icon: <i className="fa-solid fa-clipboard-list text-lg text-teal-700"></i>,
                            },
                            {
                                label: 'Request Obat Farmasi',
                                desc: 'Isi ulang stok ruangan',
                                icon: <i className="fa-solid fa-pills text-lg text-teal-700"></i>,
                            },
                        ].map((a, idx) => (
                            <button
                                key={idx}
                                className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] p-3 text-left transition-colors hover:bg-gray-100"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{a.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">
                                            {a.label}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {a.desc}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 4. Dashboard Dokter (Gambar 3)
    const DoctorDashboard = () => (
        <div className="space-y-6">
            <div>
                <h1 className="mb-1 font-serif text-3xl text-[#0d4f42]">
                    Selamat pagi, dr. Ahmad Fauzi, Sp.PD
                </h1>
                <p className="text-sm text-gray-500">
                    Semoga hari Anda menyenangkan dan produktif.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Pasien Berikutnya */}
                <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <span className="text-xs font-bold tracking-widest text-[#0d4f42] uppercase">
                        Pasien Berikutnya
                    </span>
                    <div className="mt-3 flex items-start justify-between">
                        <div>
                            <p className="font-serif text-3xl font-medium text-gray-900">
                                Tn. Budi Santoso
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                09:00 - Konsultasi Rutin (Hipertensi)
                            </p>
                        </div>
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 text-2xl font-bold text-[#0d4f42]">
                            BS
                        </div>
                    </div>
                    <button className="mt-8 flex w-fit items-center gap-2 rounded-lg bg-[#0d4f42] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0a3d33]">
                        <i className="fa-solid fa-user-doctor"></i> Mulai Konsultasi Pasien Berikutnya
                    </button>
                </div>

                {/* Jadwal Praktik Hari Ini */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">
                            Jadwal Praktik Hari Ini
                        </h3>
                        <span className="text-gray-400">...</span>
                    </div>
                    <div className="relative ml-3 space-y-6 border-l border-gray-200 pb-4">
                        {[
                            {
                                time: '08:00',
                                name: 'Ibu Ratna Sari',
                                status: 'Selesai',
                                type: 'Kontrol Diabetes',
                                statusColor: 'bg-gray-100 text-gray-600',
                                isSelected: false,
                            },
                            {
                                time: '08:30',
                                name: 'Tn. Agus Haryanto',
                                status: 'Sedang Konsultasi',
                                type: 'Keluhan Nyeri Dada',
                                statusColor: 'bg-green-100 text-green-700',
                                isSelected: true,
                            },
                            {
                                time: '09:00',
                                name: 'Tn. Budi Santoso',
                                status: 'Menunggu',
                                type: 'Konsultasi Rutin (Hipertensi)',
                                statusColor: 'bg-gray-200 text-gray-700',
                                isSelected: false,
                            },
                            {
                                time: '09:30',
                                name: 'Ny. Lilis Suryani',
                                status: 'Menunggu',
                                type: 'Check-up Pasca Rawat',
                                statusColor: 'bg-gray-200 text-gray-700',
                                isSelected: false,
                            },
                        ].map((j, idx) => (
                            <div
                                key={idx}
                                className={`relative pl-6 ${j.isSelected ? '-ml-4 rounded-r-lg border-l-4 border-[#0d4f42] bg-[#e0f2f1] py-3 pl-8' : ''}`}
                            >
                                <div
                                    className={`absolute top-2 left-[-5px] h-2.5 w-2.5 rounded-full ${j.isSelected ? 'bg-[#0d4f42]' : 'bg-gray-300'}`}
                                ></div>
                                <div className="flex items-center gap-3">
                                    <span className="min-w-[40px] text-xs font-bold text-[#0d4f42]">
                                        {j.time}
                                    </span>
                                    <div className="flex-1">
                                        <p
                                            className={`text-sm font-bold ${j.isSelected ? 'text-gray-900' : 'text-gray-800'}`}
                                        >
                                            {j.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {j.type}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${j.statusColor}`}
                                    >
                                        {j.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <a
                        href="#"
                        className="mt-2 block text-center text-sm font-bold text-[#0d4f42]"
                    >
                        Lihat Jadwal Lengkap
                    </a>
                </div>
            </div>

            {/* Statistik Bawah */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-[#d1fae5]/20 p-6">
                        <div>
                            <p className="text-sm text-gray-600">
                                Pasien Hari Ini
                            </p>
                            <p className="mt-1 font-serif text-4xl font-medium text-[#0d4f42]">
                                18
                            </p>
                            <p className="mt-1 text-[10px] text-gray-400">
                                ↑ 2 dari kemarin
                            </p>
                        </div>
                        <i className="fa-solid fa-users text-2xl text-[#0d4f42]"></i>
                    </div>
                    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-[#d1fae5]/20 p-6">
                        <div>
                            <p className="text-sm text-gray-600">
                                Rata-rata Waktu Konsultasi
                            </p>
                            <p className="mt-1 font-serif text-4xl font-medium text-[#0d4f42]">
                                15 mnt
                            </p>
                            <p className="mt-1 text-[10px] text-gray-400">
                                ⊙ Tepat waktu
                            </p>
                        </div>
                        <i className="fa-regular fa-clock text-2xl text-[#0d4f42]"></i>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-bell text-lg text-orange-500"></i>
                        <h3 className="font-bold text-gray-900">
                            Pemberitahuan Penting
                        </h3>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-flask-vial text-orange-500 text-lg"></i>
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    Hasil lab Ibu Siti Aminah sudah masuk.
                                </p>
                                <p className="text-xs text-gray-500">
                                    HbA1c menunjukkan perbaikan signifikan.
                                </p>
                            </div>
                        </div>
                        <a
                            href="#"
                            className="text-sm font-bold text-[#0d4f42] hover:underline"
                        >
                            Lihat Hasil
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );

    // 5. Dashboard Apoteker (Gambar 5)
    const PharmacistDashboard = () => (
        <div className="space-y-6">
            <h1 className="mb-1 font-serif text-3xl text-[#0d4f42]">
                Dashboard Apoteker
            </h1>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="mb-2 text-sm font-bold text-gray-800">
                        Resep Masuk Hari Ini
                    </p>
                    <p className="mb-4 font-serif text-4xl text-[#0d4f42]">
                        34{' '}
                        <span className="font-sans text-base font-bold text-[#0d4f42]">
                            Resep
                        </span>
                    </p>
                    <div className="flex justify-between text-xs text-gray-600">
                        <div className="flex flex-col items-center gap-1 rounded-md bg-yellow-100 px-2 py-1 text-yellow-700">
                            Menunggu{' '}
                            <span className="text-base font-bold">12</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-orange-700">
                            Disiapkan{' '}
                            <span className="text-base font-bold">15</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-green-700">
                            Siap <span className="text-base font-bold">7</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="mb-4 text-sm font-bold text-gray-800">
                        Stok Obat Menipis
                    </p>
                    <div className="space-y-3 text-xs">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span>Paracetamol 500mg</span>
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                                Habis
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span>Amlodipine 5mg</span>
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700">
                                Menipis
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span>Vitamin C</span>
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700">
                                Menipis
                            </span>
                        </div>
                    </div>
                    <button className="mt-4 w-full rounded-md border border-gray-200 bg-[#f8fafc] py-2 text-xs font-bold text-gray-800">
                        Lihat Semua Stok
                    </button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="mb-2 text-sm font-bold text-gray-800">
                        Transaksi Harian
                    </p>
                    <p className="mb-4 font-serif text-3xl text-[#0d4f42]">
                        34 Resep Diproses
                    </p>
                    <div className="flex h-16 items-end justify-between gap-2">
                        {[2, 4, 6, 8, 5, 3, 4].map((h, idx) => (
                            <div
                                key={idx}
                                className={`w-full h-${h * 3} bg-[#0d4f42]/${idx === 3 ? 100 : 80} rounded-sm`}
                            ></div>
                        ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-gray-500">
                        <span>Pagi</span>
                        <span>Siang</span>
                    </div>
                </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 rounded-lg bg-[#0d4f42] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0a3d33]">
                    <i className="fa-solid fa-plus"></i> Catat Pengeluaran Stok
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-[#0d4f42]/20 bg-[#d1fae5] px-5 py-3 text-xs font-bold text-[#0d4f42] hover:bg-teal-100">
                    <i className="fa-solid fa-boxes-stacked"></i> Lihat Stok Obat
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-xs font-bold hover:bg-gray-50">
                    <i className="fa-solid fa-file-lines"></i> Lihat Riwayat Transaksi
                </button>
            </div>

            {/* Tabel & Sidebar Stok */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            Antrian Resep Masuk
                        </h3>
                        <a
                            href="#"
                            className="text-sm font-bold text-[#0d4f42]"
                        >
                            Lihat Semua
                        </a>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500">
                            <tr>
                                <th className="py-2 font-medium">
                                    Nama Pasien
                                </th>
                                <th className="py-2 font-medium">Dokter</th>
                                <th className="py-2 font-medium">
                                    Jumlah Item
                                </th>
                                <th className="py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                {
                                    name: 'Ani Wijaya',
                                    dr: 'dr. Andi',
                                    items: '3 Item',
                                    status: 'Menunggu',
                                    color: 'bg-yellow-100 text-yellow-700',
                                },
                                {
                                    name: 'Budi Santoso',
                                    dr: 'dr. Melati',
                                    items: '2 Item',
                                    status: 'Disiapkan',
                                    color: 'bg-green-100 text-green-700',
                                },
                                {
                                    name: 'Citra Dewi',
                                    dr: 'dr. Hermawan',
                                    items: '1 Item',
                                    status: 'Siap',
                                    color: 'bg-[#d1fae5] text-[#0d4f42]',
                                },
                            ].map((r, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-gray-100"
                                >
                                    <td className="py-3 font-medium text-gray-800">
                                        {r.name}
                                    </td>
                                    <td className="py-3 text-gray-600">
                                        {r.dr}
                                    </td>
                                    <td className="py-3 text-gray-600">
                                        {r.items}
                                    </td>
                                    <td className="py-3">
                                        <span
                                            className={`rounded-md px-3 py-1 text-[10px] font-bold ${r.color}`}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 font-bold text-gray-900">
                            Highlight Stok
                        </h3>
                        <div className="flex gap-4">
                            <div className="flex-1 rounded-lg border border-red-100 bg-red-50 p-4 text-center">
                                <p className="text-3xl font-bold text-red-600">
                                    0
                                </p>
                                <p className="text-xs font-bold text-red-700">
                                    Paracetamol
                                </p>
                            </div>
                            <div className="flex-1 rounded-lg border border-yellow-100 bg-yellow-50 p-4 text-center">
                                <p className="text-3xl font-bold text-yellow-600">
                                    12
                                </p>
                                <p className="text-xs font-bold text-yellow-700">
                                    Amlodipine
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 flex justify-between font-bold text-gray-900">
                            Riwayat Transaksi{' '}
                            <a
                                href="#"
                                className="text-xs font-bold text-[#0d4f42]"
                            >
                                Lihat Semua
                            </a>
                        </h3>
                        <div className="space-y-3 text-xs">
                            {[
                                {
                                    id: '#RS-001',
                                    name: 'Ani Wijaya',
                                    time: '10:30',
                                    status: 'Selesai',
                                },
                                {
                                    id: '#RS-002',
                                    name: 'Budi Santoso',
                                    time: '09:15',
                                    status: 'Selesai',
                                },
                                {
                                    id: '#RS-003',
                                    name: 'Citra Dewi',
                                    time: '08:45',
                                    status: 'Selesai',
                                },
                            ].map((t, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between border-b border-gray-100 pb-2 last:border-0"
                                >
                                    <div>
                                        <p className="font-bold text-gray-800">
                                            {t.id}
                                        </p>
                                        <p className="text-gray-500">
                                            {t.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-800">
                                            {t.time}
                                        </p>
                                        <p className="text-green-600">
                                            {t.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // =======================================================================
    // [LOGIKA UTAMA] Render dashboard berdasarkan Role yang dipilih
    // =======================================================================
    return (
        <Layout user={user} role={role}>
            <div className="min-h-[calc(100vh-100px)] bg-white p-4 md:p-8">
                {role === 'admin' && <AdminDashboard />}
                {role === 'dokter' && <DoctorDashboard />}
                {role === 'perawat' && <NurseDashboard />}
                {role === 'apoteker' && <PharmacistDashboard />}
                {role === 'kasir' && <BillingDashboard />}

                {/* Jika role tidak terdaftar di kelima template di atas, tampilkan default (aman) */}
                {![
                    'admin',
                    'dokter',
                    'perawat',
                    'apoteker',
                    'kasir',
                    'billing',
                ].includes(role) && (
                    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            Selamat Datang, {user?.nama_lengkap || 'Pengguna'}
                        </h1>
                        <p className="text-gray-500">
                            Sistem Informasi Manajemen Rumah Sakit - Mode Portal{' '}
                            {ROLE_LABELS[role]}
                        </p>
                    </div>
                )}
            </div>

            {/* [TIDAK DIUBAH] Modal Form Tambah Pasien (Hanya untuk Admin & Resepsionis) */}
            {isModalOpen && (role === 'admin' || role === 'resepsionis') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Tambah Data Pasien Baru
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Daftarkan rekam medis dan opsi pendaftaran
                                    layanan pasien
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

                        <form
                            onSubmit={handleSubmitPatient}
                            className="mt-4 space-y-4"
                        >
                            {/* [KODE MODAL ORISINAL TETAP SAMA] ... */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Nama Lengkap{' '}
                                    <span className="text-red-500">*</span>
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
                                            setData(
                                                'jenis_kelamin',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                                    >
                                        <option value="Laki-laki">
                                            Laki-laki
                                        </option>
                                        <option value="Perempuan">
                                            Perempuan
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
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
                            <div className="space-y-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
                                <div>
                                    <label className="block text-xs font-bold text-teal-900">
                                        Status Pendaftaran / Jenis Layanan
                                    </label>
                                    <select
                                        value={data.jenis_layanan}
                                        onChange={(e) =>
                                            setData(
                                                'jenis_layanan',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-teal-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-900 focus:border-teal-700 focus:outline-none"
                                    >
                                        <option value="">
                                            - Belum Mendaftar Layanan -
                                        </option>
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
                                                        setData(
                                                            'penjamin',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                                >
                                                    <option value="umum">
                                                        Umum
                                                    </option>
                                                    <option value="bpjs">
                                                        BPJS Kesehatan
                                                    </option>
                                                    <option value="asuransi">
                                                        Asuransi Swasta
                                                    </option>
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
                                                            setData(
                                                                'prioritas',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-teal-700 focus:outline-none"
                                                    >
                                                        <option value="normal">
                                                            Normal
                                                        </option>
                                                        <option value="urgent">
                                                            Urgent
                                                        </option>
                                                        <option value="emergency">
                                                            Emergency
                                                        </option>
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
                                                        setData(
                                                            'nomor_penjamin',
                                                            e.target.value,
                                                        )
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
                                                    setData(
                                                        'keluhan',
                                                        e.target.value,
                                                    )
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
                            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
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
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Pasien'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
