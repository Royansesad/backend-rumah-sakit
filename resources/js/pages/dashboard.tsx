import React from 'react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';
import { ROLE_LABELS } from '../types/simrs';

interface DashboardProps {
    user: any;
    role: Role;
    stats: any[];
    recentAuditLogs: any[];
}

export default function Dashboard({
    user,
    role = 'admin',
    stats = [],
    recentAuditLogs = [],
}: DashboardProps) {
    return (
        <Layout user={user} role={role}>
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="min-w-0">
                    <h1 className="flex flex-wrap items-center gap-3 text-xl font-bold text-gray-900 sm:text-2xl">
                        <span className="truncate">
                            Selamat Datang, {user?.nama_lengkap || 'Pengguna'}
                        </span>
                    </h1>
                    <p className="mt-1 text-xs text-gray-500">
                        Sistem Informasi Manajemen Rumah Sakit - Mode Portal{' '}
                        {ROLE_LABELS[role]}
                    </p>
                </div>
                <span className="w-fit rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-teal-950 uppercase shadow-md">
                    {ROLE_LABELS[role]}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(stats.length > 0
                    ? stats
                    : [
                          {
                              label: 'Total User Staff',
                              value: '9 Account',
                              icon: 'US',
                          },
                          {
                              label: 'Total Pasien',
                              value: '3 Terdaftar',
                              icon: 'TP',
                          },
                          {
                              label: 'Sesi Aktif',
                              value: '1 Online',
                              icon: 'SA',
                          },
                          {
                              label: 'Audit Logs',
                              value: '3 Entries',
                              icon: 'AL',
                          },
                      ]
                ).map((st, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/30 font-bold text-teal-900">
                            {st.icon || 'ST'}
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">
                                {st.label}
                            </div>
                            <div className="mt-0.5 text-xl font-bold text-gray-900">
                                {st.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <span>Aktivitas Sistem Terbaru (Audit Log)</span>
                </h2>

                <div className="space-y-3">
                    {(recentAuditLogs.length > 0
                        ? recentAuditLogs
                        : [
                              {
                                  id: 1,
                                  modul: 'system',
                                  aksi: 'INITIALIZE',
                                  pembuat_type: 'admin',
                                  created_at: 'Baru Saja',
                              },
                              {
                                  id: 2,
                                  modul: 'pasien',
                                  aksi: 'CREATE_PATIENT',
                                  pembuat_type: 'resepsionis',
                                  created_at: '5 menit lalu',
                              },
                          ]
                    ).map((log: any, idx: number) => (
                        <div
                            key={idx}
                            className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="shrink-0 rounded bg-primary/25 px-2 py-0.5 font-mono font-bold text-teal-800 uppercase">
                                    {log.aksi}
                                </span>
                                <span className="truncate font-medium text-gray-900">
                                    {log.modul}
                                </span>
                            </div>
                            <div className="shrink-0 text-gray-500">
                                {log.pembuat_type} • {log.created_at}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
