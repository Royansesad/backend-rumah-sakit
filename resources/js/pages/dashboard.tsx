import React from 'react';
import { Layout } from '../components/layout';
import { Role, ROLE_COLORS, ROLE_LABELS } from '../types/simrs';

interface DashboardProps {
  user: any;
  role: Role;
  stats: any[];
  recentAuditLogs: any[];
}

export default function Dashboard({ user, role = 'admin', stats = [], recentAuditLogs = [] }: DashboardProps) {
  const color = ROLE_COLORS[role] || '#6366f1';

  return (
    <Layout user={user} role={role}>
      <div className="flex items-center justify-between bg-white shadow-sm p-6 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span>Selamat Datang, {user?.nama_lengkap || 'Pengguna'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Sistem Informasi Manajemen Rumah Sakit - Mode Portal {ROLE_LABELS[role]}</p>
        </div>
        <span 
          className="px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase shadow-md"
          style={{ backgroundColor: color }}
        >
          {ROLE_LABELS[role]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(stats.length > 0 ? stats : [
          { label: 'Total User Staff', value: '9 Account', icon: 'US' },
          { label: 'Total Pasien', value: '3 Terdaftar', icon: 'TP' },
          { label: 'Sesi Aktif', value: '1 Online', icon: 'SA' },
          { label: 'Audit Logs', value: '3 Entries', icon: 'AL' },
        ]).map((st, idx) => (
          <div key={idx} className="bg-white shadow-sm p-5 rounded-xl border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center font-bold text-gray-700 bg-gray-100 rounded-xl">{st.icon || 'ST'}</div>
            <div>
              <div className="text-xs text-gray-500">{st.label}</div>
              <div className="text-xl font-bold text-gray-900 mt-0.5">{st.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-sm p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>Aktivitas Sistem Terbaru (Audit Log)</span>
        </h2>

        <div className="space-y-3">
          {(recentAuditLogs.length > 0 ? recentAuditLogs : [
            { id: 1, modul: 'system', aksi: 'INITIALIZE', pembuat_type: 'admin', created_at: 'Baru Saja' },
            { id: 2, modul: 'pasien', aksi: 'CREATE_PATIENT', pembuat_type: 'resepsionis', created_at: '5 menit lalu' }
          ]).map((log: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold uppercase">{log.aksi}</span>
                <span className="text-gray-900 font-medium">{log.modul}</span>
              </div>
              <div className="text-gray-500">{log.pembuat_type} • {log.created_at}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
