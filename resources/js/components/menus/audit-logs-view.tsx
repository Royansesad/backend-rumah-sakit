import React from 'react';

interface AuditLogsViewProps {
    logs: any[];
}

const FALLBACK_LOGS = [
    {
        id: 1,
        pembuat_type: 'admin',
        modul: 'system',
        aksi: 'INITIALIZE',
        ip_address: '127.0.0.1',
        created_at: '2026-08-04 09:00:00',
    },
    {
        id: 2,
        pembuat_type: 'resepsionis',
        modul: 'pasien',
        aksi: 'CREATE_PATIENT',
        ip_address: '192.168.1.10',
        created_at: '2026-08-04 09:15:00',
    },
    {
        id: 3,
        pembuat_type: 'admin',
        modul: 'user_management',
        aksi: 'CREATE_USER',
        ip_address: '127.0.0.1',
        created_at: '2026-08-04 09:30:00',
    },
];

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs = [] }) => {
    const displayLogs = logs.length > 0 ? logs : FALLBACK_LOGS;

    return (
        <>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    System Audit Logs
                </h1>
                <p className="text-xs text-gray-500">
                    Catatan aktivitas dan riwayat keamanan sistem rumah sakit
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-[640px] text-left text-xs text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">Waktu</th>
                            <th className="p-4">Aktor Role</th>
                            <th className="p-4">Modul</th>
                            <th className="p-4">Aksi</th>
                            <th className="p-4">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {displayLogs.map((l: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-4 font-mono text-gray-400">
                                    {l.created_at}
                                </td>
                                <td className="p-4 font-semibold text-primary-deep uppercase">
                                    {l.pembuat_type}
                                </td>
                                <td className="p-4 font-medium text-gray-900">
                                    {l.modul}
                                </td>
                                <td className="p-4">
                                    <span className="rounded bg-primary/25 px-2 py-0.5 font-mono font-bold text-teal-800">
                                        {l.aksi}
                                    </span>
                                </td>
                                <td className="p-4 font-mono text-gray-400">
                                    {l.ip_address || '127.0.0.1'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
