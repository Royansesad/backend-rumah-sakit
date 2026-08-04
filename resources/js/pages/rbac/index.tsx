import React from 'react';
import { Layout } from '../../components/layout';
import { Role, ROLE_COLORS, ROLE_LABELS } from '../../types/simrs';

interface RbacProps {
  user: any;
  role: Role;
}

const ROLES: Role[] = ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis', 'manajemen', 'pasien'];

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'user_management', label: 'Manajemen User' },
  { key: 'patient_management', label: 'Manajemen Pasien' },
  { key: 'medical_records', label: 'Rekam Medis' },
  { key: 'pharmacy', label: 'Farmasi' },
  { key: 'billing', label: 'Billing & Kasir' },
  { key: 'registration', label: 'Pendaftaran' },
  { key: 'reports', label: 'Laporan' },
  { key: 'audit_log', label: 'Audit Log' },
];

export default function RbacIndex({ user, role = 'admin' }: RbacProps) {
  return (
    <Layout user={user} role={role}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Matriks Hak Akses (RBAC)</h1>
        <p className="text-xs text-gray-500">Konfigurasi izin modul berdasarkan peran pengguna</p>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="p-4 sticky left-0 bg-gray-50 min-w-[160px]">Modul</th>
              {ROLES.map((r) => (
                <th key={r} className="p-4 text-center min-w-[100px]" style={{ color: ROLE_COLORS[r] }}>
                  {ROLE_LABELS[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MODULES.map((m) => (
              <tr key={m.key} className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white">{m.label}</td>
                {ROLES.map((r) => {
                  const allowed = r === 'admin' || (r === 'dokter' && ['dashboard', 'patient_management', 'medical_records'].includes(m.key)) || (r === 'perawat' && ['dashboard', 'medical_records'].includes(m.key)) || (r === 'apoteker' && ['dashboard', 'pharmacy'].includes(m.key)) || (r === 'kasir' && ['dashboard', 'billing'].includes(m.key)) || (r === 'resepsionis' && ['dashboard', 'registration'].includes(m.key)) || (r === 'manajemen' && ['dashboard', 'reports', 'audit_log'].includes(m.key));
                  return (
                    <td key={r} className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        allowed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-400'
                      }`}>
                        {allowed ? 'Akses' : 'Tidak'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
