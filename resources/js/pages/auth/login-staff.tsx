import React from 'react';
import { useForm } from '@inertiajs/react';
import { Role, ROLE_LABELS } from '../../types/simrs';

const STAFF_ROLES: Role[] = ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis', 'manajemen'];

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">AD</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Portal Admin & Staff</h1>
            <p className="text-xs text-gray-500">Akses Internal Petugas Rumah Sakit</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pilih Jabatan / Role Admin & Staff</label>
            <select
              value={data.role}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]} ({r.toUpperCase()})
                </option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Official Staff</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="pegawai@simrs.id"
              required
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl text-white shadow-sm transition-all text-sm mt-2"
          >
            {processing ? 'Memproses...' : `Masuk Portal Staff (${ROLE_LABELS[data.role]}) ➔`}
          </button>
        </form>
      </div>
    </div>
  );
}
