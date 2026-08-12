<?php

namespace Database\Seeders;

use App\Models\Kasir;
use App\Models\Pasien;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagihanSeeder extends Seeder
{
    public function run(): void
    {
        $pasiens = Pasien::all();
        $kasir = Kasir::first();

        if ($pasiens->isEmpty()) {
            $this->command->warn('Skipping TagihanSeeder: No patients found.');

            return;
        }

        $budi = $pasiens->firstWhere('nama_lengkap', 'Budi Santoso') ?? $pasiens->get(0);
        $siti = $pasiens->firstWhere('nama_lengkap', 'Siti Aminah') ?? $pasiens->get(1) ?? $budi;
        $ahmad = $pasiens->firstWhere('nama_lengkap', 'Ahmad Fauzi') ?? $pasiens->get(2) ?? $budi;
        $ratna = $pasiens->get(3) ?? $budi;
        $agus = $pasiens->get(4) ?? $budi;

        $invoices = [
            [
                'no_invoice' => 'INV-202608-042',
                'pasien_id' => $budi->id,
                'layanan' => 'Poli Penyakit Dalam',
                'subtotal' => 1250000,
                'diskon' => 0,
                'pajak' => 0,
                'total_tagihan' => 1250000,
                'jumlah_dibayar' => 0,
                'kembalian' => 0,
                'status' => 'belum_lunas',
                'metode_pembayaran' => null,
                'waktu_pembayaran' => null,
                'kasir_id' => null,
                'rincian' => [
                    [
                        'label' => 'Konsultasi',
                        'desc' => 'Dr. Hermawan (Sp.PD)',
                        'price' => 350000,
                        'qty' => 1,
                        'total' => 350000,
                        'icon' => 'stethoscope',
                    ],
                    [
                        'label' => 'Obat-obatan',
                        'desc' => "Amoxicillin 500mg (10x)\nParacetamol 500mg (10x)",
                        'price' => 200000,
                        'qty' => 1,
                        'total' => 200000,
                        'icon' => 'pills',
                    ],
                    [
                        'label' => 'Tindakan',
                        'desc' => 'Cek Darah Lengkap & Hematologi',
                        'price' => 700000,
                        'qty' => 1,
                        'total' => 700000,
                        'icon' => 'vial',
                    ],
                ],
                'catatan' => 'Pasien rawat jalan Poli Penyakit Dalam.',
                'created_at' => Carbon::now()->subMinutes(30),
            ],
            [
                'no_invoice' => 'INV-202608-041',
                'pasien_id' => $siti->id,
                'layanan' => 'IGD (Gawat Darurat)',
                'subtotal' => 3400000,
                'diskon' => 0,
                'pajak' => 0,
                'total_tagihan' => 3400000,
                'jumlah_dibayar' => 3400000,
                'kembalian' => 0,
                'status' => 'lunas',
                'metode_pembayaran' => 'Tunai',
                'waktu_pembayaran' => Carbon::now()->subHours(1),
                'kasir_id' => $kasir?->id,
                'rincian' => [
                    [
                        'label' => 'Penanganan Emergency IGD',
                        'desc' => 'Tim Medis IGD & Observasi 4 Jam',
                        'price' => 1500000,
                        'qty' => 1,
                        'total' => 1500000,
                        'icon' => 'stethoscope',
                    ],
                    [
                        'label' => 'Infus & Alkes',
                        'desc' => 'Cairan Ringer Laktat + Abocath + Set Infus',
                        'price' => 900000,
                        'qty' => 1,
                        'total' => 900000,
                        'icon' => 'vial',
                    ],
                    [
                        'label' => 'Obat Injeksi & Resep Farmasi',
                        'desc' => 'Oksigen + Injeksi Ranitidine + Analgesik',
                        'price' => 1000000,
                        'qty' => 1,
                        'total' => 1000000,
                        'icon' => 'pills',
                    ],
                ],
                'catatan' => 'Pembayaran lunas tunai di Loket 1.',
                'created_at' => Carbon::now()->subHours(2),
            ],
            [
                'no_invoice' => 'INV-202608-040',
                'pasien_id' => $ahmad->id,
                'layanan' => 'Poli Gigi',
                'subtotal' => 450000,
                'diskon' => 0,
                'pajak' => 0,
                'total_tagihan' => 450000,
                'jumlah_dibayar' => 450000,
                'kembalian' => 0,
                'status' => 'lunas',
                'metode_pembayaran' => 'QRIS',
                'waktu_pembayaran' => Carbon::now()->subHours(2),
                'kasir_id' => $kasir?->id,
                'rincian' => [
                    [
                        'label' => 'Konsultasi Poli Gigi',
                        'desc' => 'drg. Melati Suci',
                        'price' => 200000,
                        'qty' => 1,
                        'total' => 200000,
                        'icon' => 'stethoscope',
                    ],
                    [
                        'label' => 'Tindakan Penambalan Gigi',
                        'desc' => 'Penambalan Gigi Komposit Sinar',
                        'price' => 250000,
                        'qty' => 1,
                        'total' => 250000,
                        'icon' => 'stethoscope',
                    ],
                ],
                'catatan' => 'Pembayaran via QRIS Statis RS.',
                'created_at' => Carbon::now()->subHours(3),
            ],
            [
                'no_invoice' => 'INV-202608-039',
                'pasien_id' => $ratna->id,
                'layanan' => 'Poli Anak',
                'subtotal' => 680000,
                'diskon' => 0,
                'pajak' => 0,
                'total_tagihan' => 680000,
                'jumlah_dibayar' => 0,
                'kembalian' => 0,
                'status' => 'belum_lunas',
                'metode_pembayaran' => null,
                'waktu_pembayaran' => null,
                'kasir_id' => null,
                'rincian' => [
                    [
                        'label' => 'Konsultasi Spesialis Anak',
                        'desc' => 'dr. Andi Wijaya (Sp.A)',
                        'price' => 300000,
                        'qty' => 1,
                        'total' => 300000,
                        'icon' => 'stethoscope',
                    ],
                    [
                        'label' => 'Vaksinasi & Sirup Obat',
                        'desc' => 'Vaksin DPT + Ambroxol Sirup',
                        'price' => 380000,
                        'qty' => 1,
                        'total' => 380000,
                        'icon' => 'pills',
                    ],
                ],
                'catatan' => 'Menunggu penyelesaian di kasir.',
                'created_at' => Carbon::now()->subMinutes(15),
            ],
            [
                'no_invoice' => 'INV-202608-038',
                'pasien_id' => $agus->id,
                'layanan' => 'Rawat Inap - Bangsal Mawar',
                'subtotal' => 2850000,
                'diskon' => 0,
                'pajak' => 0,
                'total_tagihan' => 2850000,
                'jumlah_dibayar' => 0,
                'kembalian' => 0,
                'status' => 'belum_lunas',
                'metode_pembayaran' => null,
                'waktu_pembayaran' => null,
                'kasir_id' => null,
                'rincian' => [
                    [
                        'label' => 'Sewa Bed Kelas 1 (3 Hari)',
                        'desc' => 'Kamar Mawar 102',
                        'price' => 1350000,
                        'qty' => 1,
                        'total' => 1350000,
                        'icon' => 'bed',
                    ],
                    [
                        'label' => 'Visite Dokter Spesialis',
                        'desc' => '3x Visite dr. Siti (Sp.PD)',
                        'price' => 750000,
                        'qty' => 1,
                        'total' => 750000,
                        'icon' => 'stethoscope',
                    ],
                    [
                        'label' => 'Obat & Perawatan Keperawatan',
                        'desc' => 'Paket Rawat Inap & Obat Injeksi',
                        'price' => 750000,
                        'qty' => 1,
                        'total' => 750000,
                        'icon' => 'pills',
                    ],
                ],
                'catatan' => 'Persiapan rincian biaya checkout rawat inap.',
                'created_at' => Carbon::now()->subHours(5),
            ],
        ];

        foreach ($invoices as $inv) {
            Tagihan::firstOrCreate(
                ['no_invoice' => $inv['no_invoice']],
                array_merge($inv, ['id' => (string) Str::uuid()])
            );
        }

        $this->command->info('TagihanSeeder completed successfully!');
    }
}
