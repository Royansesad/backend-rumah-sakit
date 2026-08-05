import { useForm } from '@inertiajs/react';
import React from 'react';
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
        <div className="flex min-h-screen items-center justify-center bg-white p-6 font-sans text-gray-900">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-teal-950">
                        AD
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Portal Admin & Staff
                        </h1>
                        <p className="text-xs text-gray-500">
                            Akses Internal Petugas Rumah Sakit
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                            Pilih Jabatan / Role Admin & Staff
                        </label>
                        <select
                            value={data.role}
                            onChange={(e) =>
                                handleRoleChange(e.target.value as Role)
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                        >
                            {STAFF_ROLES.map((r) => (
                                <option key={r} value={r}>
                                    {ROLE_LABELS[r]} ({r.toUpperCase()})
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                            Email Official Staff
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            placeholder="pegawai@simrs.id"
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
                        {processing
                            ? 'Memproses...'
                            : `Masuk Portal Staff (${ROLE_LABELS[data.role]}) ➔`}
                    </button>
                </form>
            </div>
        </div>
    );
}
