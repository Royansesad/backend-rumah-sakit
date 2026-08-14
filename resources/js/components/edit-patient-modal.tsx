import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

const DAFTAR_PROVINSI = [
    'Aceh',
    'Sumatera Utara',
    'Sumatera Barat',
    'Riau',
    'Kepulauan Riau',
    'Jambi',
    'Sumatera Selatan',
    'Kepulauan Bangka Belitung',
    'Bengkulu',
    'Lampung',
    'DKI Jakarta',
    'Jawa Barat',
    'Banten',
    'Jawa Tengah',
    'DI Yogyakarta',
    'Jawa Timur',
    'Bali',
    'Nusa Tenggara Barat',
    'Nusa Tenggara Timur',
    'Kalimantan Barat',
    'Kalimantan Tengah',
    'Kalimantan Selatan',
    'Kalimantan Timur',
    'Kalimantan Utara',
    'Sulawesi Utara',
    'Gorontalo',
    'Sulawesi Tengah',
    'Sulawesi Barat',
    'Sulawesi Selatan',
    'Sulawesi Tenggara',
    'Maluku',
    'Maluku Utara',
    'Papua Barat',
    'Papua',
];

const DAFTAR_KOTA = [
    'Kota Jakarta Pusat',
    'Kota Jakarta Utara',
    'Kota Jakarta Barat',
    'Kota Jakarta Selatan',
    'Kota Jakarta Timur',
    'Kab. Kepulauan Seribu',
    'Kota Bandung',
    'Kab. Bandung',
    'Kab. Bandung Barat',
    'Kota Bogor',
    'Kab. Bogor',
    'Kota Bekasi',
    'Kab. Bekasi',
    'Kota Depok',
    'Kota Tangerang',
    'Kota Tangerang Selatan',
    'Kab. Tangerang',
    'Kota Semarang',
    'Kab. Semarang',
    'Kota Surakarta',
    'Kota Yogyakarta',
    'Kab. Sleman',
    'Kab. Bantul',
    'Kota Surabaya',
    'Kota Malang',
    'Kota Denpasar',
    'Kota Medan',
    'Kota Palembang',
    'Kota Makassar',
    'Kota Balikpapan',
    'Kota Samarinda',
    'Kota Banjarmasin',
    'Kota Pontianak',
    'Kota Manado',
];

export interface EditPatientModalProps {
    isOpen: boolean;
    patient: any | null;
    onClose: () => void;
    onSuccess?: (message?: string) => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
    isOpen,
    patient,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        nik: '',
        tanggal_lahir: '',
        jenis_kelamin: 'Laki-laki',
        alamat: '',
        provinsi: '',
        kota_kabupaten: '',
        no_hp: '',
        email: '',
        penjamin: 'umum',
        nomor_penjamin: '',
        golongan_darah: 'O',
        alergi: '',
        nama_kontak_darurat: '',
        no_hp_kontak_darurat: '',
        status_aktif: 'aktif',
    });

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (patient) {
            setFormData({
                nama_lengkap: patient.nama_lengkap || '',
                nik: patient.nik || '',
                tanggal_lahir: patient.tanggal_lahir || '',
                jenis_kelamin: patient.jenis_kelamin || 'Laki-laki',
                alamat: patient.alamat || '',
                provinsi: patient.provinsi || '',
                kota_kabupaten: patient.kota_kabupaten || '',
                no_hp: patient.no_hp || '',
                email: patient.email || '',
                penjamin: patient.penjamin || 'umum',
                nomor_penjamin: patient.nomor_penjamin || '',
                golongan_darah: patient.golongan_darah || 'O',
                alergi: patient.alergi || '',
                nama_kontak_darurat: patient.nama_kontak_darurat || '',
                no_hp_kontak_darurat: patient.no_hp_kontak_darurat || '',
                status_aktif: patient.status_aktif || 'aktif',
            });
        }
    }, [patient]);

    if (!isOpen || !patient) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        if (patient.id) {
            router.put(`/pasien/${patient.id}`, formData, {
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                    if (onSuccess)
                        onSuccess('Data pasien berhasil diperbarui.');
                },
                onError: () => {
                    setProcessing(false);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            });
        } else {
            // Local fallback simulation
            setProcessing(false);
            onClose();
            if (onSuccess) onSuccess('Data pasien berhasil diperbarui.');
        }
    };

    return (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4 backdrop-blur-xs duration-200">
            <div className="relative my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                {/* Header Modal */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-[#f7fcfb] px-6 py-4">
                    <div>
                        <span className="font-mono text-xs font-bold text-gray-500">
                            {patient.nomor_rekam_medis || 'RM-XXXX-XXXX'}
                        </span>
                        <h2 className="font-serif text-xl font-bold text-[#145e5b]">
                            Edit Data Pasien
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

                {/* Form Body */}
                <form onSubmit={handleSubmit}>
                    <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6 text-xs">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Nama Lengkap */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama_lengkap}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nama_lengkap: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                />
                            </div>

                            {/* NIK */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    NIK (No. KTP)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nik}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nik: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 font-mono text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                />
                            </div>

                            {/* Tanggal Lahir */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    value={formData.tanggal_lahir}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tanggal_lahir: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                />
                            </div>

                            {/* Jenis Kelamin */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Jenis Kelamin
                                </label>
                                <select
                                    value={formData.jenis_kelamin}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            jenis_kelamin: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                >
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>

                            {/* No. HP */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    No. Telepon / HP
                                </label>
                                <input
                                    type="text"
                                    value={formData.no_hp}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            no_hp: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                />
                            </div>

                            {/* Penjamin / Asuransi */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Penjamin / Asuransi
                                </label>
                                <select
                                    value={formData.penjamin}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            penjamin: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                >
                                    <option value="bpjs">BPJS Kesehatan</option>
                                    <option value="asuransi">
                                        Asuransi Swasta
                                    </option>
                                    <option value="umum">Umum</option>
                                </select>
                            </div>

                            {/* No. Penjamin / Polis */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    No. Kartu / Polis Penjamin
                                </label>
                                <input
                                    type="text"
                                    value={formData.nomor_penjamin}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nomor_penjamin: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 font-mono text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                />
                            </div>

                            {/* Golongan Darah */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Golongan Darah
                                </label>
                                <select
                                    value={formData.golongan_darah}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            golongan_darah: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                >
                                    <option value="O">O</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="-">-</option>
                                </select>
                            </div>

                            {/* Status Aktif */}
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Status Pasien
                                </label>
                                <select
                                    value={formData.status_aktif}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status_aktif: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="tidak_aktif">
                                        Tidak Aktif
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Alamat Lengkap */}
                        <div>
                            <label className="mb-1 block font-semibold text-gray-700">
                                Alamat Lengkap
                            </label>
                            <textarea
                                rows={2}
                                value={formData.alamat}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        alamat: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                            />
                        </div>

                        {/* Provinsi & Kota/Kabupaten */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Provinsi
                                </label>
                                <select
                                    value={formData.provinsi}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            provinsi: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                >
                                    <option value="">Pilih Provinsi</option>
                                    {formData.provinsi &&
                                        !DAFTAR_PROVINSI.includes(
                                            formData.provinsi,
                                        ) && (
                                            <option value={formData.provinsi}>
                                                {formData.provinsi}
                                            </option>
                                        )}
                                    {DAFTAR_PROVINSI.map((prov, idx) => (
                                        <option key={idx} value={prov}>
                                            {prov}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Kota / Kabupaten
                                </label>
                                <select
                                    value={formData.kota_kabupaten}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            kota_kabupaten: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                >
                                    <option value="">
                                        Pilih Kota / Kabupaten
                                    </option>
                                    {formData.kota_kabupaten &&
                                        !DAFTAR_KOTA.includes(
                                            formData.kota_kabupaten,
                                        ) && (
                                            <option
                                                value={formData.kota_kabupaten}
                                            >
                                                {formData.kota_kabupaten}
                                            </option>
                                        )}
                                    {DAFTAR_KOTA.map((kota, idx) => (
                                        <option key={idx} value={kota}>
                                            {kota}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Alergi */}
                        <div>
                            <label className="mb-1 block font-semibold text-gray-700">
                                Alergi Obat / Makanan (Dipisahkan koma)
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Amoxicillin, Seafood"
                                value={formData.alergi}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        alergi: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                            />
                        </div>

                        {/* Kontak Darurat */}
                        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-3 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    Nama Kontak Darurat
                                </label>
                                <input
                                    type="text"
                                    value={formData.nama_kontak_darurat}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nama_kontak_darurat: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block font-semibold text-gray-700">
                                    No. HP Kontak Darurat
                                </label>
                                <input
                                    type="text"
                                    value={formData.no_hp_kontak_darurat}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            no_hp_kontak_darurat:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#145e5b] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Modal */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-[#f7fcfb] px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-[#145e5b] px-5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#0f4947] disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
