import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { Shield, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const { flash } = usePage<{
        flash?: { success?: string; step?: number; identifier?: string };
    }>().props;
    const [currentStep, setCurrentStep] = useState<number>(flash?.step ?? 1);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form 1: Request OTP
    const formOtp = useForm({
        identifier: flash?.identifier ?? '',
    });

    // Form 2: Verify OTP and Set New Password
    const formReset = useForm({
        identifier: flash?.identifier ?? '',
        otp: '',
        password: '',
        password_confirmation: '',
    });

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        formOtp.post('/admin-forgot-password', {
            onSuccess: () => {
                formReset.setData('identifier', formOtp.data.identifier);
                setCurrentStep(2);
            },
        });
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        formReset.post('/admin-reset-password', {
            onSuccess: () => {
                setIsSuccess(true);
            },
        });
    };

    return (
        <div className="flex h-screen max-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#f8f7f4] px-3 py-2 font-sans text-gray-900 selection:bg-[#174e48] selection:text-white sm:px-4 sm:py-3">
            {/* Main Reset Password Card */}
            <div className="w-full max-w-[340px] rounded-xl border border-[#d2e7e3] bg-[#f3f8f7] p-4 shadow-xs sm:max-w-[360px] sm:p-5">
                {/* Header Icon: Medical Kit / Briefcase */}
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#1c6460] text-white shadow-xs sm:h-9 sm:w-9">
                    <svg
                        className="h-4 w-4 fill-current text-white sm:h-4.5 sm:w-4.5"
                        viewBox="0 0 24 24"
                    >
                        <path d="M19 8h-2V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-10-2h6v2H9V6zm10 14H5V10h14v10zm-6-8h-2v2H9v2h2v2h2v-2h2v-2h-2z" />
                    </svg>
                </div>

                {/* Header Titles */}
                <div className="mt-2 text-center sm:mt-2.5">
                    <p className="font-serif text-xs font-bold tracking-tight text-[#1c6460]">
                        RS Sentosa Medika
                    </p>
                    <h1 className="mt-0.5 font-serif text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
                        Reset Kata Sandi
                    </h1>
                    <p className="text-[10.5px] text-gray-500 sm:text-xs">
                        Portal Staf Internal
                    </p>
                </div>

                {/* Step Progress Bar */}
                <div className="my-2.5 flex items-center justify-center gap-1.5 sm:my-3">
                    <span
                        className={`h-2 w-2 rounded-full transition-colors ${
                            currentStep >= 1 ? 'bg-[#1c6460]' : 'bg-[#cbe3e0]'
                        }`}
                    />
                    <span
                        className={`h-[2px] w-14 transition-colors sm:w-16 ${
                            currentStep === 2 ? 'bg-[#1c6460]' : 'bg-[#c6e1dc]'
                        }`}
                    />
                    <span
                        className={`h-2 w-2 rounded-full transition-colors ${
                            currentStep === 2 ? 'bg-[#1c6460]' : 'bg-[#cbe3e0]'
                        }`}
                    />
                </div>

                {isSuccess ? (
                    /* Success State */
                    <div className="text-center">
                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f4f2] text-[#1c6460]">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h3 className="mt-2 font-serif text-sm font-bold text-gray-900">
                            Kata Sandi Berhasil Direset!
                        </h3>
                        <p className="mt-1 text-[10.5px] text-gray-600 sm:text-xs">
                            Silakan masuk kembali ke portal internal RS Sentosa
                            Medika menggunakan kata sandi baru Anda.
                        </p>
                        <Link
                            href="/admin-login"
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1c6460] py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#154e4a] sm:py-2 sm:text-sm"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Kembali ke Log Masuk
                        </Link>
                    </div>
                ) : currentStep === 1 ? (
                    /* Step 1: Input Email / NIP (Matches Image 2 exactly) */
                    <div>
                        <form onSubmit={handleSendOtp} className="space-y-2.5">
                            <div>
                                <label className="mb-0.5 block text-[10.5px] font-semibold text-gray-700 sm:text-xs">
                                    Email Kerja / NIP
                                </label>
                                <input
                                    type="text"
                                    value={formOtp.data.identifier}
                                    onChange={(e) =>
                                        formOtp.setData(
                                            'identifier',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-[#c6e1dc] bg-[#f4faf9] px-2.5 py-1 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#1c6460] focus:bg-white focus:ring-1 focus:ring-[#1c6460] focus:outline-none sm:py-1.5 sm:text-sm"
                                    placeholder="Cth: budi.s@rssentosa.id atau 198502..."
                                    required
                                />
                                {formOtp.errors.identifier && (
                                    <p className="mt-0.5 text-[9.5px] text-red-500">
                                        {formOtp.errors.identifier}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={formOtp.processing}
                                className="mt-2.5 w-full cursor-pointer rounded-md bg-[#1c6460] py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#154e4a] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-3 sm:py-2 sm:text-sm"
                            >
                                {formOtp.processing
                                    ? 'Mengirim OTP...'
                                    : 'Kirim OTP'}
                            </button>
                        </form>

                        <Link
                            href="/admin-login"
                            className="mt-2.5 block text-center text-[10.5px] font-semibold text-[#1c6460] hover:underline sm:text-xs"
                        >
                            Kembali ke Log Masuk
                        </Link>
                    </div>
                ) : (
                    /* Step 2: Verification and Set New Password */
                    <div>
                        {flash?.success && (
                            <div className="mb-2 rounded-md bg-[#e6f4f2] p-2 text-[10.5px] text-[#1c6460] sm:text-xs">
                                {flash.success}
                            </div>
                        )}
                        <form
                            onSubmit={handleResetPassword}
                            className="space-y-2"
                        >
                            <div>
                                <label className="mb-0.5 block text-[10.5px] font-semibold text-gray-700 sm:text-xs">
                                    Kode OTP (Cek Email / WhatsApp)
                                </label>
                                <input
                                    type="text"
                                    value={formReset.data.otp}
                                    onChange={(e) =>
                                        formReset.setData('otp', e.target.value)
                                    }
                                    className="w-full rounded-md border border-[#c6e1dc] bg-[#f4faf9] px-2.5 py-1 text-center font-mono text-xs tracking-widest text-gray-800 placeholder:text-gray-400 focus:border-[#1c6460] focus:bg-white focus:ring-1 focus:ring-[#1c6460] focus:outline-none sm:py-1.5 sm:text-sm"
                                    placeholder="123456"
                                    maxLength={6}
                                    required
                                />
                                {formReset.errors.otp && (
                                    <p className="mt-0.5 text-[9.5px] text-red-500">
                                        {formReset.errors.otp}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-0.5 block text-[10.5px] font-semibold text-gray-700 sm:text-xs">
                                    Kata Sandi Baru
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={formReset.data.password}
                                        onChange={(e) =>
                                            formReset.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border border-[#c6e1dc] bg-[#f4faf9] py-1 pr-8 pl-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#1c6460] focus:bg-white focus:ring-1 focus:ring-[#1c6460] focus:outline-none sm:py-1.5 sm:text-sm"
                                        placeholder="Minimal 6 karakter"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-3.5 w-3.5" />
                                        ) : (
                                            <Eye className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                                {formReset.errors.password && (
                                    <p className="mt-0.5 text-[9.5px] text-red-500">
                                        {formReset.errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-0.5 block text-[10.5px] font-semibold text-gray-700 sm:text-xs">
                                    Konfirmasi Kata Sandi Baru
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formReset.data.password_confirmation}
                                    onChange={(e) =>
                                        formReset.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-[#c6e1dc] bg-[#f4faf9] px-2.5 py-1 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#1c6460] focus:bg-white focus:ring-1 focus:ring-[#1c6460] focus:outline-none sm:py-1.5 sm:text-sm"
                                    placeholder="Ulangi kata sandi baru"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={formReset.processing}
                                className="mt-2.5 w-full cursor-pointer rounded-md bg-[#1c6460] py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#154e4a] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-3 sm:py-2 sm:text-sm"
                            >
                                {formReset.processing
                                    ? 'Memproses...'
                                    : 'Simpan Kata Sandi Baru'}
                            </button>

                            <div className="mt-2 flex items-center justify-between text-[10.5px] sm:text-xs">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="font-medium text-gray-500 hover:text-gray-800"
                                >
                                    ← Ubah Email/NIP
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    className="font-semibold text-[#1c6460] hover:underline"
                                >
                                    Kirim Ulang OTP
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Bottom Notice Box (Matches Image 2) */}
                <div className="mt-3.5 flex items-start gap-1.5 rounded-md border border-[#c6e1dc] bg-[#e6f3f1] p-2 text-left text-[10.5px] leading-snug text-gray-700 sm:mt-4 sm:p-2.5 sm:text-xs">
                    <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1c6460]" />
                    <span>
                        Jika email/NIP tidak dikenali, hubungi{' '}
                        <Link
                            href="/admin-request-access"
                            className="font-bold text-gray-900 underline hover:text-[#1c6460]"
                        >
                            Admin IT
                        </Link>{' '}
                        — bukan tim Customer Service pasien.
                    </span>
                </div>
            </div>

            {/* Bottom Copyright */}
            <div className="mt-2.5 text-center text-xs text-gray-500">
                © 2024 RS Sentosa Medika. Internal Use Only.
            </div>
        </div>
    );
}
