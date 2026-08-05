import { useForm } from '@inertiajs/react';
import React from 'react';

export default function LoginPasien() {
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
        <div className="flex min-h-screen items-center justify-center bg-white p-6 font-sans text-gray-900">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-teal-950">
                        PS
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Portal Pasien / Tamu
                        </h1>
                        <p className="text-xs text-gray-500">
                            Layanan Mandiri & Rekam Medis Pasien
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                            Email Pasien / Rekam Medis
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            placeholder="nama@email.com"
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-teal-950 shadow-sm transition-all hover:bg-primary-dark"
                    >
                        {processing ? 'Memproses...' : 'Masuk Portal Pasien ➔'}
                    </button>
                </form>
            </div>
        </div>
    );
}
