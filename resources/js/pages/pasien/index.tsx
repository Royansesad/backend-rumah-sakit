import { router } from '@inertiajs/react';
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

    return (
        <Layout user={user} role={role}>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Manajemen Data Pasien
                    </h1>
                    <p className="text-xs text-gray-500">
                        Daftar rekam medis dan profil pasien rumah sakit
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama, NIK, atau No. Rekam Medis... (Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs text-gray-900 focus:border-primary focus:outline-none"
                    />
                </form>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-[720px] text-left text-xs text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">No. RM</th>
                            <th className="p-4">Nama Lengkap</th>
                            <th className="p-4">NIK</th>
                            <th className="p-4">JK</th>
                            <th className="p-4">Gol. Darah</th>
                            <th className="p-4">No. HP</th>
                            <th className="p-4">Alamat</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {patientList.map((p: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-4 font-mono font-bold text-primary-deep">
                                    {p.nomor_rekam_medis}
                                </td>
                                <td className="p-4 font-semibold text-gray-900">
                                    {p.nama_lengkap}
                                </td>
                                <td className="p-4 font-mono">{p.nik}</td>
                                <td className="p-4">{p.jenis_kelamin}</td>
                                <td className="p-4 font-bold text-primary-deep">
                                    {p.golongan_darah}
                                </td>
                                <td className="p-4">{p.no_hp}</td>
                                <td className="p-4">{p.alamat}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
