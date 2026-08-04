import React from 'react';
import { useForm } from '@inertiajs/react';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm">PS</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Portal Pasien / Tamu</h1>
            <p className="text-xs text-gray-500">Layanan Mandiri & Rekam Medis Pasien</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Pasien / Rekam Medis</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="nama@email.com"
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
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 font-semibold rounded-xl text-white shadow-sm transition-all text-sm mt-2"
          >
            {processing ? 'Memproses...' : 'Masuk Portal Pasien ➔'}
          </button>
        </form>
      </div>
    </div>
  );
}
