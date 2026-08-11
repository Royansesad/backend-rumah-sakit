import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    Users,
    Mail,
    Eye,
    EyeOff,
    ChevronDown,
    CircleUserRound,
} from 'lucide-react';
import type { Role } from '../../types/simrs';
import { ROLE_LABELS } from '../../types/simrs';

const STAFF_ROLES: Role[] = [
    'admin',
    'dokter',
    'perawat',
    'apoteker',
    'kasir',
    'resepsionis',
    'manajemen',
];

const DEMO_CREDENTIALS: Record<string, { email: string }> = {
    admin: { email: 'budi.admin@simrs.id' },
    dokter: { email: 'siti.rahayu@simrs.id' },
    perawat: { email: 'dewi.lestari@simrs.id' },
    apoteker: { email: 'andi.pratama@simrs.id' },
    kasir: { email: 'mega.putri@simrs.id' },
    resepsionis: { email: 'lina.sari@simrs.id' },
    manajemen: { email: 'hendra.wijaya@simrs.id' },
};

export default function LoginStaff() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: DEMO_CREDENTIALS.admin.email,
        password: 'password123',
        role: 'admin' as Role,
    });

    const handleRoleChange = (newRole: Role) => {
        setData({
            email: DEMO_CREDENTIALS[newRole]?.email || data.email,
            password: 'password123',
            role: newRole,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin-login');
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#eef7f6] font-sans text-gray-900">
            {/* Top Navbar */}
            <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-[#B8D4D5] bg-[#eef7f6] px-6 md:px-12">
                {/* Brand Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-[#174e48] text-white shadow-xs">
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                        </svg>
                    </div>
                    <span className="font-serif text-lg font-bold tracking-tight text-[#174e48] md:text-xl">
                        RS Sentosa Medika
                    </span>
                </div>

                {/* Right Portal Title & User Icon */}
                <div className="flex items-center gap-2 text-sm font-normal text-[#174e48]">
                    <span>Portal Staf Internal</span>
                    <CircleUserRound className="h-6 w-6 text-[#174e48]" />
                </div>
            </header>

            {/* Main Content Split Layout */}
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                {/* Left Column: Login Form */}
                <div className="flex w-full flex-1 items-center justify-center bg-[#eef7f6] p-6 lg:w-1/2 lg:p-12">
                    <div className="w-full max-w-md">
                        <h1 className="font-serif text-4xl font-bold text-[#174e48] lg:text-5xl">
                            Selamat Datang
                        </h1>
                        <p className="mt-2 mb-8 text-sm font-normal text-gray-600 md:text-base">
                            Silakan masuk menggunakan kredensial internal Anda.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Role Dropdown */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                                    Login sebagai
                                </label>
                                <div className="relative">
                                    <Users className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
                                    <select
                                        value={data.role}
                                        onChange={(e) =>
                                            handleRoleChange(
                                                e.target.value as Role
                                            )
                                        }
                                        className="w-full appearance-none rounded-md border border-gray-300 bg-[#f4faf9] py-2.5 pr-10 pl-10 text-sm text-gray-800 focus:border-[#174e48] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#174e48]"
                                    >
                                        {STAFF_ROLES.map((r) => (
                                            <option key={r} value={r}>
                                                {ROLE_LABELS[r]} (
                                                {r.toUpperCase()})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
                                </div>
                                {errors.role && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                                    Email Kerja / NIP
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 bg-[#f4faf9] py-2.5 pr-10 pl-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#174e48] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#174e48]"
                                        placeholder="Masukkan Email atau NIP"
                                        required
                                    />
                                    <Mail className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label className="text-xs font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <a
                                        href="#"
                                        className="text-xs font-semibold text-[#174e48] hover:underline"
                                    >
                                        Lupa Password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 bg-[#f4faf9] py-2.5 pr-10 pl-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#174e48] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#174e48]"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-[#1b5e5a] focus:ring-[#1b5e5a]"
                                />
                                <label
                                    htmlFor="remember"
                                    className="select-none text-xs text-gray-600 cursor-pointer"
                                >
                                    Ingat saya di perangkat ini
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 w-full rounded-md bg-[#1b5e5a] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#154b48] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                            >
                                {processing ? 'Memproses...' : 'Login'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-xs text-gray-700">
                            Lupa akses?{' '}
                            <a
                                href="#"
                                className="font-bold text-[#174e48] hover:underline"
                            >
                                Hubungi Admin IT
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Column: Hero Doctor Image & Frosted Quote Card */}
                <div
                    className="relative hidden w-full flex-col justify-end bg-cover bg-center p-8 lg:flex lg:w-1/2 lg:p-12"
                    style={{
                        backgroundImage: "url('/images/dokter-login.png')",
                    }}
                >
                    {/* Glassmorphic Quote Box */}
                    <div className="relative z-10 w-full rounded-r-md border-l-4 border-[#009688] bg-white/80 p-6 shadow-md backdrop-blur-md">
                        <p className="font-serif text-sm leading-relaxed text-gray-800 md:text-base">
                            "Pelayanan kesehatan terbaik dimulai dari kolaborasi tim yang kuat dan komunikasi yang jelas."
                        </p>
                        <p className="mt-2.5 text-xs font-semibold text-[#174e48] md:text-sm">
                            — Manajemen RS Sentosa Medika
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <footer className="flex h-16 w-full shrink-0 flex-col items-center justify-between gap-4 border-t border-[#B8D4D5] bg-[#eef7f6] px-6 py-4 text-xs md:flex-row md:px-12 md:text-sm">
                <span className="font-serif font-bold text-gray-900">
                    © 2024 RS Sentosa Medika. Internal Use Only.
                </span>
                <div className="flex flex-wrap items-center justify-center gap-6 font-normal text-gray-700 md:gap-8">
                    <a href="#" className="transition-colors hover:text-gray-900">
                        Hubungi IT Admin
                    </a>
                    <a href="#" className="transition-colors hover:text-gray-900">
                        Panduan Keamanan
                    </a>
                    <a href="#" className="transition-colors hover:text-gray-900">
                        Sistem Pelaporan Insiden
                    </a>
                </div>
            </footer>
        </div>
    );
}