import React from 'react';

export interface PatientDetailModalProps {
    isOpen: boolean;
    patient: any | null;
    onClose: () => void;
    onDelete?: (patient: any) => void;
    onEdit?: (patient: any) => void;
    onViewHistory?: (patient: any) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
    isOpen,
    patient,
    onClose,
    onDelete,
    onEdit,
    onViewHistory,
}) => {
    if (!isOpen || !patient) return null;

    // Helper calculate age
    const calculateAge = (dateStr?: string) => {
        if (!dateStr) return '';
        const birthDate = new Date(dateStr);
        if (isNaN(birthDate.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return ` (${age} Tahun)`;
    };

    // Helper formatting
    const rmNo = patient.nomor_rekam_medis || '-';
    const nama = patient.nama_lengkap || '-';
    const nik = patient.nik || '-';
    const ageStr = calculateAge(patient.tanggal_lahir);
    const tglLahir = patient.tanggal_lahir
        ? `${patient.tanggal_lahir}${ageStr}`
        : '-';
    const jk = patient.jenis_kelamin || '-';
    const alamat = patient.alamat || '-';
    const phone = patient.no_hp || '-';
    const email = patient.email || '-';
    const kontakDaruratNama = patient.nama_kontak_darurat || '-';
    const kontakDaruratHp = patient.no_hp_kontak_darurat || '-';
    const golDarah = patient.golongan_darah
        ? `O Positif (${patient.golongan_darah})`
        : '-';

    // Strict Alergi checking (No dummy fallback when empty!)
    const rawAlergi = (patient.alergi || '').trim();
    const alergiList = rawAlergi
        ? rawAlergi
              .split(',')
              .map((a: string) => a.trim())
              .filter(Boolean)
        : [];

    // Strict Kondisi Kronis / Keluhan checking (No dummy fallback when empty!)
    const rawKronis = (patient.kondisi_kronis || patient.keluhan || '').trim();
    const kronisList = rawKronis
        ? rawKronis
              .split(',')
              .map((k: string) => k.trim())
              .filter(Boolean)
        : [];

    const penjaminLabel = patient.penjamin
        ? patient.penjamin === 'bpjs'
            ? 'BPJS Kesehatan'
            : patient.penjamin === 'asuransi'
              ? 'Asuransi Swasta'
              : 'Umum'
        : 'Umum';

    const noPolis = patient.nomor_penjamin || '-';
    const tglRegistrasi = patient.created_at
        ? new Date(patient.created_at).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }) + ' WIB'
        : '-';
    const updateTerakhir = patient.updated_at
        ? new Date(patient.updated_at).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }) + ' WIB'
        : '-';
    const didaftarkanOleh = patient.didaftarkan_oleh
        ? `Admin Pendaftaran (${patient.didaftarkan_oleh})`
        : 'Admin Pendaftaran';

    return (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4 backdrop-blur-xs duration-200">
            <div className="relative my-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                {/* Header Modal */}
                <div className="flex items-start justify-between border-b border-gray-100 bg-[#f7fcfb] px-6 py-5">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-gray-700">
                                {rmNo}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#66cdaa]/20 px-2.5 py-0.5 text-xs font-semibold text-[#145e5b]">
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                {penjaminLabel} Aktif
                            </span>
                        </div>
                        <h2 className="mt-1 font-serif text-2xl font-bold text-gray-900">
                            {nama}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Tutup modal"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body Modal - 6 Grid Cards */}
                <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto bg-gray-50/50 p-6 md:grid-cols-2">
                    {/* Card 1: Data Pribadi */}
                    <div className="space-y-2.5 rounded-xl border border-gray-200/80 bg-white p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[#145e5b]">
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            Data Pribadi
                        </h3>
                        <div className="divide-y divide-gray-100 text-xs">
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    Nama Lengkap
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {nama}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">NIK</span>
                                <span className="font-mono text-gray-800">
                                    {nik}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    Tanggal Lahir
                                </span>
                                <span className="text-gray-800">
                                    {tglLahir}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    Jenis Kelamin
                                </span>
                                <span className="text-gray-800">{jk}</span>
                            </div>
                            <div className="pt-1.5">
                                <span className="mb-1 block text-gray-500">
                                    Alamat Lengkap
                                </span>
                                <span className="block leading-relaxed text-gray-800">
                                    {alamat}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Kontak */}
                    <div className="space-y-2.5 rounded-xl border border-gray-200/80 bg-white p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[#145e5b]">
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
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                            Kontak
                        </h3>
                        <div className="divide-y divide-gray-100 text-xs">
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    No. Telepon
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {phone}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">Email</span>
                                <span className="text-gray-800">{email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Kontak Darurat */}
                    <div className="space-y-2.5 rounded-xl border border-gray-200/80 bg-white p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[#145e5b]">
                            <i className="fa-solid fa-asterisk text-xs text-red-500"></i>
                            Kontak Darurat
                        </h3>
                        <div className="divide-y divide-gray-100 text-xs">
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">Nama</span>
                                <span className="font-semibold text-gray-800">
                                    {kontakDaruratNama}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    No. Telepon
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {kontakDaruratHp}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Data Kesehatan */}
                    <div className="space-y-2.5 rounded-xl border border-gray-200/80 bg-white p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[#145e5b]">
                            <svg
                                className="h-4 w-4 fill-red-500 text-red-500"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            Data Kesehatan
                        </h3>
                        <div className="divide-y divide-gray-100 text-xs">
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-gray-500">
                                    Golongan Darah
                                </span>
                                <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                                    {golDarah !== '-' ? (
                                        <>
                                            <i className="fa-solid fa-droplet text-xs text-red-500"></i>{' '}
                                            {golDarah}
                                        </>
                                    ) : (
                                        '-'
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-gray-500">Alergi</span>
                                <div className="flex flex-wrap justify-end gap-1.5">
                                    {alergiList.length > 0 ? (
                                        alergiList.map(
                                            (a: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="rounded bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700"
                                                >
                                                    {a}
                                                </span>
                                            ),
                                        )
                                    ) : (
                                        <span className="font-medium text-gray-500">
                                            Tidak ada
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="pt-1.5">
                                <span className="mb-1 block text-gray-500">
                                    Kondisi Kronis
                                </span>
                                {kronisList.length > 0 ? (
                                    <ul className="space-y-1 pl-1 text-gray-800">
                                        {kronisList.map(
                                            (item: string, idx: number) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-1.5"
                                                >
                                                    <span className="font-bold text-[#145e5b]">
                                                        •
                                                    </span>{' '}
                                                    {item}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                ) : (
                                    <span className="font-medium text-gray-500">
                                        Tidak ada
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card 5: Asuransi */}
                    <div className="space-y-2.5 rounded-xl border border-gray-200/80 bg-white p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[#145e5b]">
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
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                            Asuransi
                        </h3>
                        <div className="divide-y divide-gray-100 text-xs">
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    Jenis Penjamin
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {penjaminLabel}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    No. Polis / Kartu
                                </span>
                                <span className="font-mono text-gray-800">
                                    {noPolis}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 6: Metadata */}
                    <div className="space-y-2.5 rounded-xl border border-gray-200/80 bg-white p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[#145e5b]">
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
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Metadata
                        </h3>
                        <div className="divide-y divide-gray-100 text-xs">
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    Tgl Registrasi
                                </span>
                                <span className="text-gray-800">
                                    {tglRegistrasi}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    Update Terakhir
                                </span>
                                <span className="text-gray-800">
                                    {updateTerakhir}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-gray-500">
                                    Didaftarkan Oleh
                                </span>
                                <span className="text-gray-800">
                                    {didaftarkanOleh}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-[#f7fcfb] px-6 py-4">
                    <button
                        type="button"
                        onClick={() => onDelete && onDelete(patient)}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 transition hover:text-rose-800"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                        Hapus Pasien
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                onViewHistory && onViewHistory(patient)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-[#145e5b] px-4 py-2 text-xs font-semibold text-[#145e5b] transition hover:bg-[#145e5b]/5"
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
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Lihat Riwayat Kunjungan
                        </button>
                        <button
                            type="button"
                            onClick={() => onEdit && onEdit(patient)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#145e5b] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0f4947]"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            Edit Pasien
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
