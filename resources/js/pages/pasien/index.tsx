import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import { Role } from '../../types/simrs';

interface PasienProps {
  user: any;
  role: Role;
  patients: any[];
}

export default function PasienIndex({ user, role = 'admin', patients = [] }: PasienProps) {
  const [search, setSearch] = useState('');

  const displayPatients = patients.length > 0 ? patients : [
    { nomor_rekam_medis: 'RM-2024-0001', nama_lengkap: 'Agus Setiawan', nik: '3174012345678901', jenis_kelamin: 'Laki-laki', golongan_darah: 'A', no_hp: '081234567890', alamat: 'Jakarta' },
    { nomor_rekam_medis: 'RM-2024-0002', nama_lengkap: 'Maya Anggraeni', nik: '3273012345678902', jenis_kelamin: 'Perempuan', golongan_darah: 'O', no_hp: '081298765432', alamat: 'Bandung' },
    { nomor_rekam_medis: 'RM-2024-0003', nama_lengkap: 'Rizki Ramadhan', nik: '3578012345678903', jenis_kelamin: 'Laki-laki', golongan_darah: 'B', no_hp: '081311223344', alamat: 'Surabaya' }
  ];

  return (
    <Layout user={user} role={role}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Data Pasien</h1>
          <p className="text-xs text-gray-500">Daftar rekam medis dan profil pasien rumah sakit</p>
        </div>
      </div>

      <div className="bg-white shadow-sm p-4 rounded-xl border border-gray-200">
        <input
          type="text"
          placeholder="Cari berdasarkan nama, NIK, atau No. Rekam Medis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="p-4">No. RM</th>
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">NIK</th>
              <th className="p-4">JK</th>
              <th className="p-4">Gol. Darah</th>
              <th className="p-4">No. HP</th>
              <th className="p-4">Alamat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayPatients.map((p: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-blue-600">{p.nomor_rekam_medis}</td>
                <td className="p-4 font-semibold text-gray-900">{p.nama_lengkap}</td>
                <td className="p-4 font-mono">{p.nik}</td>
                <td className="p-4">{p.jenis_kelamin}</td>
                <td className="p-4 font-bold text-indigo-600">{p.golongan_darah}</td>
                <td className="p-4">{p.no_hp}</td>
                <td className="p-4">{p.alamat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
