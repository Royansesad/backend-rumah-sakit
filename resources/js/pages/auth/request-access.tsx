import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function RequestAccess() {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: '',
        email: '',
        role: '',
        nomor_hp: '',
        catatan: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin-request-access', {
            onSuccess: () => {
                setIsSubmitted(true);
            },
        });
    };

    const handleReset = () => {
        reset();
        setIsSubmitted(false);
    };

    return (
        <div className="flex h-screen max-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#f8f7f4] px-3 py-2 font-sans text-gray-900 selection:bg-[#174e48] selection:text-white sm:px-4 sm:py-3">
            {/* Top Brand Logo */}
            <div className="mb-2 flex items-center justify-center gap-2 sm:mb-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-[#174e48] text-white shadow-xs">
                    <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                    </svg>
                </div>
                <span className="font-serif text-sm font-bold tracking-tight text-[#174e48] sm:text-base">
                    RS Sentosa Medika
                </span>
            </div>

            {/* Main Access Request Card */}
            <div className="w-full max-w-[360px] rounded-xl border border-[#d2e7e3] bg-[#f3f8f7] p-3.5 shadow-xs sm:max-w-[390px] sm:p-5">
                <h1 className="text-center font-serif text-lg font-semibold tracking-tight text-[#1e3b38] sm:text-xl">
                    Ajukan Permintaan Akses
                </h1>

                {isSubmitted || flash?.success ? (
                    /* Success Confirmation View */
                    <div className="mt-3 text-center sm:mt-4">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f4f2] text-[#1c6460]">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="mt-2 font-serif text-sm font-bold text-gray-900 sm:text-base">
                            Permintaan Berhasil Dikirim!
                        </h3>
                        <p className="mt-1 text-[10.5px] leading-relaxed text-gray-600 sm:text-xs">
                            Terima kasih, data pengajuan akses akun staf Anda
                            telah diteruskan ke{' '}
                            <strong>
                                Tim Administrator IT RS Sentosa Medika
                            </strong>
                            . Kami akan memverifikasi data dan menghubungi Anda
                            melalui WhatsApp / Email dalam 1x24 jam kerja.
                        </p>

                        <div className="mt-3 flex flex-col gap-1.5">
                            <Link
                                href="/admin-login"
                                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1c6460] py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#154e4a] sm:py-2 sm:text-sm"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Kembali ke Halaman Login
                            </Link>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-[10.5px] font-semibold text-[#1c6460] hover:underline sm:text-xs"
                            >
                                Ajukan Permintaan Lain
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Request Form */
                    <>
                        {/* Information Banner */}
                        <div className="mt-1.5 rounded-md bg-[#e6f3f1] p-2 text-[10.5px] leading-snug text-gray-600 sm:mt-2 sm:text-xs">
                            Akun staf internal dibuat oleh Administrator Sistem.
                            Jika Anda staf baru dan belum memiliki akun, silakan
                            hubungi bagian IT/Admin melalui form di bawah ini.
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-2 space-y-1.5 sm:mt-2.5 sm:space-y-2"
                        >
                            {/* Nama Lengkap */}
                            <div>
                                <label className="mb-0.5 block text-[10.5px] font-semibold text-gray-700 sm:text-xs">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_lengkap}
                                    onChange={(e) =>
                                        setData('nama_lengkap', e.target.value)
                                    }
                                    className="w-full rounded-md border border-[#c6e1dc] bg-[#f4faf9] px-2.5 py-1 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#174e48] focus:bg-white focus:ring-1 focus:ring-[#174e48] focus:outline-none sm:py-1.5 sm:text-sm"
                                    placeholder="Dr. Budi Santoso"
                                    required
                                />
                                {errors.nama_lengkap && (
                                    <p className="mt-0.5 text-[9.5px] text-red-500">
                                        {errors.nama_lengkap}
                                    </p>
                                )}
                            </div>

                            {/* Email Kerja */}
                            <div>
                                <label className="mb-0.5 block text-[10.5px] font-semibold text-gray-700 sm:text-xs">
                                    Email Kerja
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-md border border-[#c6e1dc] bg-[#f4faf9] px-2.5 py-1 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#174e48] focus:bg-white focus:ring-1 focus:ring-[#174e48] focus:outline-none sm:py-1.5 sm:text-sm"
                                    placeholder="budi.s@rssentosamedika.id"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-0.5 text-[9.5px] text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Departemen / Role */}
                            <div>
                                <label className="mb-0.5 block text-[10.5px] font-semibold text-gray-700 sm:text-xs">
                                    Departemen / Role
                                </label>
                                <div className="relative">
                                    <select
                                        value={data.role}
                                        onChange={(e) =>
                                            setData('role', e.target.value)
                                        }
                                        className="w-full appearance-none rounded-md border border-[#c6e1dc] bg-[#f4faf9] py-1 pr-8 pl-2.5 text-xs text-gray-800 focus:border-[#174e48] focus:bg-white focus:ring-1 focus:ring-[#174e48] focus:outline-none sm:py-1.5 sm:text-sm"
                                        required
                                    >
                                        <option value="" disabled>
                                            Pilih Departemen Anda
                                        </option>
                                        <option value="Dokter Spesialis / Umum">
                                            Dokter Spesialis / Umum
                                        </option>
                                        <option value="Keperawatan (Perawat / Bidan)">
                                            Keperawatan (Perawat / Bidan)
                                        </option>
                                        <option value="Farmasi & Apoteker">
                                            Farmasi & Apoteker
                                        </option>
                                        <option value="Kasir & Billing Keuangan">
                                            Kasir & Billing Keuangan
                                        </option>
                                        <option value="Pendaftaran & Resepsionis">
                                            Pendaftaran & Resepsionis
                                        </option>
                                        <option value="Manajemen & Direksi">
                                            Manajemen & Direksi
                                        </option>
                                        <option value="Administrator IT & SIMRS">
                                            Administrator IT & SIMRS
                                        </option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                                </div>
                                {errors.role && (
                                    <p className="mt-0.5 text-[9.5px] text-red-500">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* Nomor HP (WhatsApp Aktif) */}
                            <div>
                                <label className="mb-0.5 block text-[10.5px] font-semibold text-gray-700 sm:text-xs">
                                    Nomor HP (WhatsApp Aktif)
                                </label>
                                <input
                                    type="tel"
                                    value={data.nomor_hp}
                                    onChange={(e) =>
                                        setData('nomor_hp', e.target.value)
                                    }
                                    className="w-full rounded-md border border-[#c6e1dc] bg-[#f4faf9] px-2.5 py-1 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#174e48] focus:bg-white focus:ring-1 focus:ring-[#174e48] focus:outline-none sm:py-1.5 sm:text-sm"
                                    placeholder="0812-3456-7890"
                                    required
                                />
                                {errors.nomor_hp && (
                                    <p className="mt-0.5 text-[9.5px] text-red-500">
                                        {errors.nomor_hp}
                                    </p>
                                )}
                            </div>

                            {/* Catatan Singkat (Opsional) */}
                            <div>
                                <label className="mb-0.5 block text-[10.5px] font-semibold text-gray-700 sm:text-xs">
                                    Catatan Singkat{' '}
                                    <span className="font-normal text-gray-400">
                                        (Opsional)
                                    </span>
                                </label>
                                <textarea
                                    value={data.catatan}
                                    onChange={(e) =>
                                        setData('catatan', e.target.value)
                                    }
                                    rows={1}
                                    className="w-full resize-none rounded-md border border-[#c6e1dc] bg-[#f4faf9] px-2.5 py-1 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#174e48] focus:bg-white focus:ring-1 focus:ring-[#174e48] focus:outline-none sm:py-1.5 sm:text-sm"
                                    placeholder="Misal: Saya dokter spesialis baru di Poli Jantung..."
                                />
                                {errors.catatan && (
                                    <p className="mt-0.5 text-[9.5px] text-red-500">
                                        {errors.catatan}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#1c6460] py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#154e4a] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-3 sm:py-2 sm:text-sm"
                            >
                                <span>
                                    {processing
                                        ? 'Mengirim...'
                                        : 'Kirim Permintaan'}
                                </span>
                                <svg
                                    className="h-3 w-3 fill-current"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </form>

                        {/* Back to Login Link */}
                        <div className="mt-2 text-center sm:mt-2.5">
                            <Link
                                href="/admin-login"
                                className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#1c6460] hover:underline sm:text-xs"
                            >
                                <ArrowLeft className="h-3 w-3" />
                                Kembali ke Login
                            </Link>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Copyright */}
            <div className="mt-2.5 text-center text-xs text-gray-500">
                © 2024 RS Sentosa Medika. Internal Use Only.
            </div>
        </div>
    );
}
