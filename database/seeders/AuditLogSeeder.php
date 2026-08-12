<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        // First clean up existing audit_logs to have pristine data matching design
        DB::table('audit_logs')->truncate();

        $logs = [
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'dokter',
                'pembuat_id' => '00000000-0000-0000-0000-000000000011',
                'modul' => 'rekam_medis',
                'aksi' => 'AKSES_DATA',
                'data_sebelum' => null,
                'data_sesudah' => null,
                'ip_address' => '192.168.1.45',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
                'target_label' => 'Rekam Medis',
                'target_id' => 'Pasien: RM-2023-8912',
                'alasan' => null,
                'created_at' => '2023-10-24 14:32:05',
            ],
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'perawat',
                'pembuat_id' => '00000000-0000-0000-0000-000000000013',
                'modul' => 'tanda_vital',
                'aksi' => 'EDIT_DATA',
                'data_sebelum' => json_encode([
                    'Tekanan Darah' => '120/80 mmHg',
                    'Suhu' => '36.5°C',
                ]),
                'data_sesudah' => json_encode([
                    'Tekanan Darah' => '125/85 mmHg',
                    'Suhu' => '36.5°C',
                ]),
                'ip_address' => '10.0.0.12',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                'target_label' => 'Tanda Vital',
                'target_id' => 'Visit: V-8891',
                'alasan' => 'Koreksi input dari alat ukur manual.',
                'created_at' => '2023-10-24 13:15:22',
            ],
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'admin',
                'pembuat_id' => '00000000-0000-0000-0000-000000000010',
                'modul' => 'jadwal_dokter',
                'aksi' => 'HAPUS_PERMANEN',
                'data_sebelum' => json_encode([
                    'Jadwal ID' => 'SCH-0992',
                    'Dokter' => 'Dr. Siti Rahayu',
                    'Hari' => 'Senin (08:00 - 12:00)',
                    'Status' => 'Dibatalkan Permanen',
                ]),
                'data_sesudah' => null,
                'ip_address' => '192.168.1.1',
                'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64; rv:119.0) Gecko/20100101 Firefox/119.0',
                'target_label' => 'Jadwal Dokter',
                'target_id' => 'ID: SCH-0992',
                'alasan' => 'Permintaan penutupan slot praktik dokter.',
                'created_at' => '2023-10-24 11:05:10',
            ],
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'apoteker',
                'pembuat_id' => '00000000-0000-0000-0000-000000000015',
                'modul' => 'resep_obat',
                'aksi' => 'CREATE',
                'data_sebelum' => null,
                'data_sesudah' => json_encode([
                    'Resep' => 'RSP-9921',
                    'Obat' => 'Paracetamol 500mg (10 tab), Amoxicillin 500mg (15 cap)',
                    'Status' => 'Disiapkan',
                ]),
                'ip_address' => '10.1.1.5',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'target_label' => 'Resep Obat',
                'target_id' => 'Resep: RSP-9921',
                'alasan' => null,
                'created_at' => '2023-10-24 10:42:15',
            ],
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'kasir',
                'pembuat_id' => '00000000-0000-0000-0000-000000000016',
                'modul' => 'pembayaran',
                'aksi' => 'UPDATE_STATUS',
                'data_sebelum' => json_encode([
                    'Invoice' => 'INV-2023-4412',
                    'Status' => 'UNPAID',
                    'Total Tagihan' => 'Rp 450.000',
                ]),
                'data_sesudah' => json_encode([
                    'Invoice' => 'INV-2023-4412',
                    'Status' => 'PAID',
                    'Metode' => 'QRIS Transfer',
                    'Total Tagihan' => 'Rp 450.000',
                ]),
                'ip_address' => '10.1.1.20',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'target_label' => 'Tagihan Pasien',
                'target_id' => 'Invoice: INV-2023-4412',
                'alasan' => 'Pelunasan tagihan melalui kasir loket.',
                'created_at' => '2023-10-24 09:20:18',
            ],
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'resepsionis',
                'pembuat_id' => '00000000-0000-0000-0000-000000000017',
                'modul' => 'pendaftaran',
                'aksi' => 'CREATE',
                'data_sebelum' => null,
                'data_sesudah' => json_encode([
                    'Antrian' => 'A-012',
                    'Pasien' => 'Agus Setiawan',
                    'Poli' => 'Poli Umum',
                ]),
                'ip_address' => '10.1.2.15',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'target_label' => 'Pendaftaran Pasien',
                'target_id' => 'Antrian: A-012',
                'alasan' => null,
                'created_at' => '2023-10-24 08:35:00',
            ],
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'manajemen',
                'pembuat_id' => '00000000-0000-0000-0000-000000000018',
                'modul' => 'laporan',
                'aksi' => 'EXPORT_DATA',
                'data_sebelum' => null,
                'data_sesudah' => json_encode([
                    'Laporan' => 'Rekap Pendapatan Rawat Jalan',
                    'Format' => 'Excel (.xlsx)',
                    'Periode' => '01 Okt 2023 - 24 Okt 2023',
                ]),
                'ip_address' => '192.168.1.150',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'target_label' => 'Laporan Keuangan',
                'target_id' => 'RPT-2023-10',
                'alasan' => null,
                'created_at' => '2023-10-24 08:15:30',
            ],
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'dokter',
                'pembuat_id' => '00000000-0000-0000-0000-000000000011',
                'modul' => 'auth',
                'aksi' => 'LOGIN',
                'data_sebelum' => null,
                'data_sesudah' => json_encode(['Sesi' => 'Masuk melalui portal staff']),
                'ip_address' => '192.168.1.45',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
                'target_label' => 'Sistem',
                'target_id' => 'Portal Dokter',
                'alasan' => null,
                'created_at' => '2023-10-24 07:45:10',
            ],
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'admin',
                'pembuat_id' => '00000000-0000-0000-0000-000000000010',
                'modul' => 'user_management',
                'aksi' => 'EDIT_DATA',
                'data_sebelum' => json_encode([
                    'Nama' => 'Dewi Lestari',
                    'Shift' => 'Pagi (07:00 - 14:00)',
                ]),
                'data_sesudah' => json_encode([
                    'Nama' => 'Dewi Lestari',
                    'Shift' => 'Malam (21:00 - 07:00)',
                ]),
                'ip_address' => '192.168.1.11',
                'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64; rv:119.0) Gecko/20100101 Firefox/119.0',
                'target_label' => 'Pengguna',
                'target_id' => 'User: Dewi Lestari',
                'alasan' => 'Penyesuaian kebutuhan shift perawat malam.',
                'created_at' => '2023-10-23 16:20:00',
            ],
            [
                'id' => Str::uuid()->toString(),
                'pembuat_type' => 'dokter',
                'pembuat_id' => '00000000-0000-0000-0000-000000000012',
                'modul' => 'rekam_medis',
                'aksi' => 'AKSES_DATA',
                'data_sebelum' => null,
                'data_sesudah' => null,
                'ip_address' => '192.168.1.50',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                'target_label' => 'Rekam Medis',
                'target_id' => 'Pasien: RM-2023-7741',
                'alasan' => null,
                'created_at' => '2023-10-23 14:10:30',
            ],
        ];

        DB::table('audit_logs')->insert($logs);
    }
}
