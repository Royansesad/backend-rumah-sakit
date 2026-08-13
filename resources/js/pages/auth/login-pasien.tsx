import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ShieldCheck, Smartphone } from 'lucide-react';

export default function LoginPasien() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: 'agus.pasien@simrs.id',
        password: 'password123',
        role: 'pasien',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="flex h-screen max-h-screen w-full flex-col bg-white font-sans text-gray-900 overflow-hidden">
            {/* Header Top Navbar */}
            <header className="flex h-12 w-full items-center justify-between border-b border-[#e2efe9] bg-[#f2f9f7] px-6 md:px-12 shrink-0">
                <div className="font-serif text-lg font-bold tracking-tight text-[#17524c]">
                    RS Sentosa Medika
                </div>
                <a
                    href="#"
                    className="text-xs font-bold text-[#257a72] hover:underline"
                >
                    Butuh Bantuan?
                </a>
            </header>

            {/* Main Content Split Layout */}
            <div className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
                {/* Left Side: Form Container */}
                <div className="flex w-full items-center justify-center bg-[#f2f9f7] p-4 lg:w-1/2 lg:p-8 overflow-y-auto">
                    <div className="w-full max-w-[380px] rounded-sm border border-[#dce8e4] bg-white p-5 shadow-none sm:p-6 my-auto">
                        {/* Header inside Card */}
                        <h3 className="font-serif text-xs font-bold text-[#17524c]">
                            RS Sentosa Medika
                        </h3>
                        <h1 className="mt-0.5 font-serif text-xl font-bold text-gray-900 sm:text-2xl">
                            Masuk ke Akun
                        </h1>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Akses rekam medis dan janji temu Anda
                        </p>

                        {/* Error Alert Box (Matches design screenshot alert) */}
                        {(errors.email || errors.password) && (
                            <div className="mt-3 flex items-center gap-2.5 rounded-[3px] border border-[#fca5a5] bg-[#fde8e8] p-2 text-xs font-medium text-[#c53030]">
                                <AlertCircle className="h-4 w-4 shrink-0 text-[#e53e3e]" />
                                <span>
                                    {errors.email || errors.password || 'Email atau kata sandi salah'}
                                </span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
                            <div>
                                <label className="mb-1 block text-[11px] font-bold text-gray-600">
                                    Email atau Nomor Rekam Medis
                                </label>
                                <input
                                    type="text"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-[4px] border border-gray-200 bg-[#fbfcfc] px-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#257a72] focus:bg-white focus:outline-none"
                                    placeholder="Contoh: user@email.com atau RM-12345"
                                    required
                                />
                            </div>

                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-gray-600">
                                        Kata Sandi
                                    </label>
                                    <a
                                        href="#"
                                        className="text-[11px] font-bold text-[#257a72] hover:underline"
                                    >
                                        Lupa Kata Sandi?
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        className="w-full rounded-[4px] border border-gray-200 bg-[#fbfcfc] py-1.5 pl-3 pr-8 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#257a72] focus:bg-white focus:outline-none"
                                        placeholder="Masukkan kata sandi Anda"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-center gap-2 pt-0.5">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
                                    }
                                    className="h-3.5 w-3.5 rounded border-gray-300 text-[#257a72] focus:ring-[#257a72]"
                                />
                                <label
                                    htmlFor="remember"
                                    className="select-none text-[11px] text-gray-600 cursor-pointer"
                                >
                                    Ingat saya di perangkat ini
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-1 w-full rounded-[4px] bg-[#3d8b87] py-2 text-xs font-bold uppercase tracking-wider text-white shadow-none transition-colors hover:bg-[#317773] disabled:opacity-70 cursor-pointer"
                            >
                                {processing ? 'Memproses...' : 'MASUK SEKARANG'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-3 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <span className="relative bg-white px-2.5 text-[11px] text-gray-400">
                                Atau masuk dengan
                            </span>
                        </div>

                        {/* Alternative Login Options */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-1.5 rounded-[4px] border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                </svg>
                                <span>Google</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-1.5 rounded-[4px] border border-gray-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                                <Smartphone className="h-3.5 w-3.5 text-gray-500" />
                                <span>Kode OTP</span>
                            </button>
                        </div>

                        {/* Bottom Link */}
                        <div className="mt-3 text-center text-[11px] text-gray-600">
                            Belum memiliki akun?{' '}
                            <a
                                href="#"
                                className="font-semibold text-[#e06d53] hover:underline"
                            >
                                Daftar Sekarang
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Side: Hero Image Banner */}
                <div
                    className="relative hidden w-1/2 flex-col justify-center bg-cover bg-center p-8 lg:flex lg:p-10"
                    style={{ backgroundImage: "url('/images/pasien-login.jpg')" }}
                >
                    {/* Contrast overlay for readability */}
                    <div className="absolute inset-0 bg-black/20" />

                    <div className="relative z-10 max-w-lg">
                        <h2 className="font-serif text-3xl font-bold leading-tight text-white xl:text-4xl drop-shadow-sm">
                            Melayani dengan Sepenuh Hati
                        </h2>
                        <p className="mt-2 text-xs font-normal leading-relaxed text-white/95 drop-shadow-sm max-w-md">
                            Selamat datang kembali di portal pasien RS Sentosa Medika. Kami hadir untuk memudahkan akses informasi kesehatan Anda dengan rasa aman dan nyaman.
                        </p>

                        {/* Accreditation Badge */}
                        <div className="mt-5 flex max-w-xs items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-[#267a72] text-white shadow-xs">
                                <ShieldCheck className="h-4.5 w-4.5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white">
                                    Terakreditasi KARS
                                </div>
                                <div className="text-[10px] text-gray-200">
                                    Standar Pelayanan Internasional
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom Bar */}
            <footer className="flex h-13 w-full flex-col items-center justify-between gap-2 border-t border-[#dbe8e2] bg-[#e2efe9] px-6 py-2 text-[11px] text-gray-600 md:flex-row md:px-12 shrink-0">
                <div className="font-serif text-xs font-bold text-[#17524c]">
                    RS Sentosa Medika
                </div>
                <div className="flex flex-wrap justify-center gap-4 font-medium text-gray-600">
                    <a href="#" className="hover:text-gray-900">
                        Emergency Info
                    </a>
                    <a href="#" className="hover:text-gray-900">
                        Services
                    </a>
                    <a href="#" className="hover:text-gray-900">
                        Doctors
                    </a>
                    <a href="#" className="hover:text-gray-900">
                        Privacy Policy
                    </a>
                </div>
                <div className="text-gray-500 text-[10px]">
                    © 2024 RS Sentosa Medika. All rights reserved.
                </div>
            </footer>
        </div>
    );
}


