import React from 'react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';
import { Link } from '@inertiajs/react';

interface KasirMenuProps {
    user: any;
    role: Role;
    menu: string;
}

export default function KasirMenu({
    user,
    role = 'kasir',
    menu = 'Billing & Pembayaran Kasir',
}: KasirMenuProps) {
    return (
        <Layout user={user} role={role}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-[#0d4f42]">
                            Modul {menu}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Pusat pengelolaan transaksi kasir, pembayaran
                            invoice, dan laporan keuangan.
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0d4f42] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#08382f]"
                    >
                        ← Kembali ke Dashboard Kasir
                    </Link>
                </div>

                <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xs">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                        <svg
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Sistem Kasir SIMRS Sentosa Medika Aktif
                    </h2>
                    <p className="mx-auto max-w-md text-xs leading-relaxed text-gray-500">
                        Semua fitur billing, pemrosesan transaksi lunas,
                        pembuatan invoice baru, dan pencetakan kuitansi telah
                        terintegrasi di Dashboard Kasir.
                    </p>
                    <div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800"
                        >
                            Buka Aplikasi Kasir Sekarang
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
