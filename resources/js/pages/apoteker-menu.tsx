import React from 'react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';
import { Link } from '@inertiajs/react';

interface ApotekerMenuProps {
    user: any;
    role: Role;
    menu: string;
}

export default function ApotekerMenu({
    user,
    role = 'apoteker',
    menu = 'Farmasi & Apotek',
}: ApotekerMenuProps) {
    return (
        <Layout user={user} role={role}>
            <div className="space-y-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-[#0d4f42]">
                            Modul {menu}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Pusat pelayanan resep digital, penebusan obat, dan
                            pengelolaan stok inventaris apotek.
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0d4f42] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#08382f]"
                    >
                        ← Kembali ke Dashboard Apoteker
                    </Link>
                </div>

                <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xs">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                        <svg
                            className="h-9 w-9"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.022.547l-1.3 1.3a2 2 0 00-.578 1.414V20a2 2 0 002 2h16a2 2 0 002-2v-1.618a2 2 0 00-.578-1.414l-1.3-1.3zM12 4a4 4 0 100 8 4 4 0 000-8z"
                            />
                        </svg>
                    </div>
                    <div className="mx-auto max-w-md space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">
                            Sistem Farmasi SIMRS Sentosa Medika
                        </h2>
                        <p className="text-xs leading-relaxed text-gray-500">
                            Seluruh fungsi penebusan resep real-time (pemotongan
                            stok otomatis), manajemen katalog obat master,
                            pencatatan pengeluaran stok, dan riwayat transaksi
                            telah aktif secara penuh di Dashboard Apoteker.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0d4f42] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#08382f]"
                        >
                            Buka Dashboard Apoteker
                        </Link>
                        <Link
                            href="/rme"
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                            Buka Rekam Medis (RME) & Resep Digital
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
