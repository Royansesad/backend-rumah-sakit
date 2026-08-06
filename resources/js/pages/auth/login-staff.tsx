import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { User, Mail, Eye, EyeOff, Check, Info, LogOut } from 'lucide-react';
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

    // Warna tema yang diminta: 00faf2 (Cyan)
    // Saya mengaplikasikannya pada button utama dan state fokus
    const themeColor = '#00faf2';

    return (
        <div className="flex min-h-screen w-full bg-white font-sans text-gray-900">
            
            {/* Left Side: Login Form */}
            <div className="w-full md:w-[55%] flex flex-col justify-between relative px-6 py-8 md:px-10 md:py-12 lg:px-16 bg-white z-10">
                
                {/* Header Top */}
                <div className="flex justify-between items-center gap-4 mb-10 w-full max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-[#004d40] font-semibold text-lg md:text-xl tracking-wide">
                        <div className="bg-[#004d40] text-white p-1 rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        </div>
                        RS Sentosa Medika
                    </div>
                    <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
                        <span>Portal Staf Internal</span>
                        <User className="w-5 h-5 text-[#004d40]" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <h2 className="text-4xl lg:text-5xl font-serif text-[#004d40] mb-2">Selamat Datang</h2>
                    <p className="text-gray-500 mb-8 font-light text-sm md:text-base">
                        Silakan masuk menggunakan kredensial internal Anda.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Dropdown */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Login sebagai
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={data.role}
                                    onChange={(e) => handleRoleChange(e.target.value as Role)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00faf2] appearance-none bg-white"
                                >
                                    {STAFF_ROLES.map((r) => (
                                        <option key={r} value={r}>
                                            {ROLE_LABELS[r]} ({r.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Email Kerja / NIP
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00faf2]"
                                    placeholder="Masukkan Email atau NIP"
                                    required
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-medium text-gray-600">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-bold text-[#004d40] hover:underline">
                                    Lupa Password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00faf2]"
                                    placeholder="********"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#00faf2] focus:ring-[#00faf2] accent-[#00faf2]"
                            />
                            <label htmlFor="remember" className="text-xs text-gray-500 select-none cursor-pointer">
                                Ingat saya di perangkat ini
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 w-full bg-[#00faf2] text-[#004d40] font-semibold py-3 rounded-lg shadow-sm hover:bg-[#00e0d8] transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Memproses...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-[#004d40] font-medium">
                        Lupa akses? Hubungi <a href="#" className="underline hover:opacity-80">Admin IT</a>
                    </div>
                </div>

                {/* Footer Left */}
                <div className="mt-10 text-xs text-gray-400 pt-4 border-t border-gray-100 w-full max-w-md mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span>&copy; 2024 RS Sentosa Medika. Internal Use Only.</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <a href="#" className="hover:text-gray-600">Hubungi IT Admin</a>
                        <a href="#" className="hover:text-gray-600">Panduan Keamanan</a>
                        <a href="#" className="hover:text-gray-600">Sistem Pelaporan Insiden</a>
                    </div>
                </div>
            </div>

            {/* Right Side: Background Image & Quote */}
            <div 
                className="hidden md:block w-[45%] relative bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/images/dokter-login.png')",
                }}
            >
                {/* Overlay Quote */}
                <div className="absolute bottom-10 right-10 left-10 bg-white bg-opacity-90 p-6 rounded-md shadow-lg backdrop-blur-sm">
                    <p className="text-sm text-gray-800 italic leading-relaxed">
                        "Pelayanan kesehatan terbaik dimulai dari kolaborasi tim yang kuat dan komunikasi yang jelas."
                    </p>
                    <p className="text-xs font-semibold text-[#004d40] mt-2 tracking-wide">
                        — Manajemen RS Sentosa Medika
                    </p>
                </div>
            </div>
        </div>
    );
}