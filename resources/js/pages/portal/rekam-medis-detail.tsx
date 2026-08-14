import { Link } from '@inertiajs/react';
import React from 'react';
import { PatientLayout } from '../../components/patient-layout';

interface ResepItem {
    nama_obat: string;
    bentuk_sediaan?: string;
    aturan_pakai: string;
    jumlah_dosis: number;
    catatan?: string;
}

interface Resep {
    id: string;
    no_resep: string;
    status: string;
    items: ResepItem[];
}

interface RekamMedisDetail {
    id: string;
    keluhan_utama: string;
    diagnosis_deskripsi?: string;
    icd10_code?: string;
    poli: string;
    dokter: string;
    spesialisasi?: string;
    finalized_at?: string;
    created_at?: string;
    perawat?: string;
    sistol?: number;
    diastol?: number;
    suhu_tubuh?: number;
    denyut_nadi?: number;
    spo2?: number;
    kondisi_pasien?: string;
    catatan_keperawatan?: string;
    catatan_dokter?: string;
    resep?: Resep | null;
}

interface RekamMedisDetailProps {
    user?: any;
    role?: string;
    rekamMedis?: RekamMedisDetail;
}

function VitalItem({
    label,
    value,
    unit,
}: {
    label: string;
    value?: number | null;
    unit?: string;
}) {
    return (
        <div className="rounded-xl bg-[#f7fcfb] p-3 text-center">
            <div className="text-[10px] font-semibold text-gray-400">
                {label}
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-gray-900">
                {value ?? '-'}{' '}
                {value != null && unit ? (
                    <span className="text-[10px] font-medium text-gray-400">
                        {unit}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

const KONDISI_LABEL: Record<string, string> = {
    stabil: 'Stabil',
    perlu_perhatian: 'Perlu Perhatian',
    kritis: 'Kritis',
};

export default function RekamMedisDetail({
    user,
    rekamMedis: rm,
}: RekamMedisDetailProps) {
    if (!rm) {
        return (
            <PatientLayout user={user}>
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                    Rekam medis tidak ditemukan.
                </div>
            </PatientLayout>
        );
    }

    return (
        <PatientLayout user={user}>
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/portal/rekam-medis"
                        className="inline-flex items-center text-xs font-semibold text-[#145e5b] hover:underline"
                    >
                        <i className="fa-solid fa-arrow-left mr-1.5 text-[10px]"></i>
                        <span>Kembali ke daftar</span>
                    </Link>
                    <h1 className="mt-1 font-serif text-2xl font-bold text-[#17524c] sm:text-3xl">
                        Detail Rekam Medis
                    </h1>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                    FINAL
                </span>
            </div>

            <div className="mt-6 space-y-4">
                {/* Informasi umum */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-gray-900">
                        Informasi Pemeriksaan
                    </h3>
                    <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">
                                Tanggal Pemeriksaan
                            </dt>
                            <dd className="font-semibold text-gray-800">
                                {rm.finalized_at || rm.created_at || '-'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Poli</dt>
                            <dd className="font-semibold text-gray-800">
                                {rm.poli}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Dokter</dt>
                            <dd className="font-semibold text-gray-800">
                                {rm.dokter}{' '}
                                {rm.spesialisasi ? `(${rm.spesialisasi})` : ''}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Perawat</dt>
                            <dd className="font-semibold text-gray-800">
                                {rm.perawat || '-'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Kode ICD-10</dt>
                            <dd className="font-semibold text-gray-800">
                                {rm.icd10_code || '-'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Status Pasien</dt>
                            <dd className="font-semibold text-gray-800">
                                {KONDISI_LABEL[rm.kondisi_pasien || ''] ||
                                    rm.kondisi_pasien ||
                                    '-'}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Vital Signs */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-gray-900">
                        Tanda Vital
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <VitalItem
                            label="Tekanan Darah"
                            value={rm.sistol}
                            unit="mmHg"
                        />
                        <VitalItem
                            label="Diastol"
                            value={rm.diastol}
                            unit="mmHg"
                        />
                        <VitalItem
                            label="Suhu Tubuh"
                            value={rm.suhu_tubuh}
                            unit="°C"
                        />
                        <VitalItem
                            label="Denyut Nadi"
                            value={rm.denyut_nadi}
                            unit="/mnt"
                        />
                        <VitalItem label="SpO₂" value={rm.spo2} unit="%" />
                    </div>
                </div>

                {/* Keluhan & Diagnosis */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <h3 className="text-sm font-bold text-gray-900">
                            Keluhan Utama
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                            {rm.keluhan_utama || '-'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <h3 className="text-sm font-bold text-gray-900">
                            Diagnosis
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                            {rm.diagnosis_deskripsi || '-'}
                        </p>
                    </div>
                </div>

                {/* Catatan */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <h3 className="text-sm font-bold text-gray-900">
                            Catatan Keperawatan
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                            {rm.catatan_keperawatan || '-'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <h3 className="text-sm font-bold text-gray-900">
                            Catatan Dokter
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                            {rm.catatan_dokter || '-'}
                        </p>
                    </div>
                </div>

                {/* Resep */}
                {rm.resep ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">
                                Resep Digital
                            </h3>
                            <span className="text-[11px] font-semibold text-gray-400">
                                No. {rm.resep.no_resep}
                            </span>
                        </div>
                        <div className="mt-3 overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="p-3">Nama Obat</th>
                                        <th className="p-3">Sediaan</th>
                                        <th className="p-3">Dosis</th>
                                        <th className="p-3">Aturan Pakai</th>
                                        <th className="p-3">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rm.resep.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3 font-semibold text-gray-800">
                                                {item.nama_obat}
                                            </td>
                                            <td className="p-3 text-gray-600">
                                                {item.bentuk_sediaan || '-'}
                                            </td>
                                            <td className="p-3 text-gray-600">
                                                {item.jumlah_dosis}
                                            </td>
                                            <td className="p-3 text-gray-600">
                                                {item.aturan_pakai}
                                            </td>
                                            <td className="p-3 text-gray-600">
                                                {item.catatan || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center text-xs text-gray-400">
                        Tidak ada resep digital untuk pemeriksaan ini.
                    </div>
                )}
            </div>
        </PatientLayout>
    );
}
