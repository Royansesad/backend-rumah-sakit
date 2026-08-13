import { Link } from '@inertiajs/react';
import React from 'react';
import { PatientLayout } from '../../components/patient-layout';

interface RekamMedisItem {
    id: string;
    keluhan_utama: string;
    diagnosis_deskripsi?: string;
    icd10_code?: string;
    poli: string;
    dokter: string;
    spesialisasi?: string;
    finalized_at?: string;
    created_at?: string;
}

interface RekamMedisProps {
    user?: any;
    role?: string;
    rekamMedis?: RekamMedisItem[];
}

export default function RekamMedis({ user, rekamMedis = [] }: RekamMedisProps) {
    return (
        <PatientLayout user={user}>
            <div>
                <h1 className="font-serif text-2xl font-bold text-[#17524c] sm:text-3xl">Rekam Medis Saya</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Riwayat pemeriksaan dan diagnosis yang telah difinalisasi oleh dokter.
                </p>
            </div>

            <div className="mt-6 space-y-3">
                {rekamMedis.length > 0 ? (
                    rekamMedis.map((rm) => (
                        <Link
                            key={rm.id}
                            href={`/portal/rekam-medis/${rm.id}`}
                            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-[#145e5b]/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-gray-900">{rm.keluhan_utama}</div>
                                <div className="mt-1 line-clamp-2 text-xs text-gray-500">
                                    {rm.diagnosis_deskripsi || 'Belum ada deskripsi diagnosis'}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-400">
                                    {rm.icd10_code && (
                                        <span className="rounded-md bg-[#e4f6f2] px-2 py-0.5 font-mono font-bold text-[#145e5b]">
                                            {rm.icd10_code}
                                        </span>
                                    )}
                                    <span>{rm.poli}</span>
                                    <span>•</span>
                                    <span>{rm.dokter}</span>
                                    <span>•</span>
                                    <span>{rm.finalized_at}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    Final
                                </span>
                                <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e4f6f2] text-[#145e5b]">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-gray-600">Belum ada rekam medis</p>
                        <p className="mt-1 text-xs text-gray-400">
                            Rekam medis yang telah difinalisasi oleh dokter akan muncul di sini.
                        </p>
                    </div>
                )}
            </div>
        </PatientLayout>
    );
}
