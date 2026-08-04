import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import { Role, ROLE_LABELS } from '../../types/simrs';

interface UsersProps {
  user: any;
  role: Role;
  users: any[];
  selectedRole?: string;
}

const ROLES_LIST = ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis', 'manajemen'];

export default function UsersIndex({ user, role = 'admin', users = [], selectedRole = 'dokter' }: UsersProps) {
  const [activeTab, setActiveTab] = useState(selectedRole);

  return (
    <Layout user={user} role={role}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User Staff</h1>
          <p className="text-xs text-gray-500">Kelola akun dan status hak akses petugas rumah sakit</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-2">
        {ROLES_LIST.map((r) => (
          <button
            key={r}
            onClick={() => setActiveTab(r)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase transition-all ${
              activeTab === r
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'
            }`}
          >
            {ROLE_LABELS[r as Role] || r}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">Email</th>
              <th className="p-4">No HP</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(users.length > 0 ? users : [
              { nama_lengkap: 'Dr. Siti Rahayu', email: 'siti.rahayu@simrs.id', no_hp: '08123456789', status_akun: 'aktif' },
              { nama_lengkap: 'Dr. Ahmad Fauzi', email: 'ahmad.fauzi@simrs.id', no_hp: '08198765432', status_akun: 'aktif' }
            ]).map((u: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">{u.nama_lengkap}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.no_hp || '-'}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                    {u.status_akun || 'aktif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
