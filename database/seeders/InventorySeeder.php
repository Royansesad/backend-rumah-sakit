<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('inventory_categories')->insertOrIgnore([
            ['id' => '00000000-0000-0000-0000-000000000040', 'nama_kategori' => 'Alat Medis Habis Pakai', 'deskripsi' => 'Konsumsi medis sekali pakai', 'is_aktif' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => '00000000-0000-0000-0000-000000000041', 'nama_kategori' => 'Obat & Farmasi', 'deskripsi' => 'Persediaan obat dan bahan farmasi', 'is_aktif' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => '00000000-0000-0000-0000-000000000042', 'nama_kategori' => 'ATK & Kantor', 'deskripsi' => 'Alat tulis dan kebutuhan kantor', 'is_aktif' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => '00000000-0000-0000-0000-000000000043', 'nama_kategori' => 'Makanan & Minuman', 'deskripsi' => 'Persediaan gizi pasien', 'is_aktif' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => '00000000-0000-0000-0000-000000000044', 'nama_kategori' => 'Sanitasi & Kebersihan', 'deskripsi' => 'Produk pembersih dan sanitasi', 'is_aktif' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('inventory_items')->insertOrIgnore([
            [
                'id' => '00000000-0000-0000-0000-000000000050',
                'kode_barang' => 'INV-MED-0001',
                'nama_barang' => 'Masker Bedah 3 Ply',
                'inventory_category_id' => '00000000-0000-0000-0000-000000000040',
                'satuan' => 'box',
                'stok_minimum' => 50,
                'stok_saat_ini' => 120,
                'harga_beli' => 12000.00,
                'harga_jual' => 18000.00,
                'warehouse_id' => '00000000-0000-0000-0000-000000000031',
                'supplier_id' => '00000000-0000-0000-0000-000000000034',
                'masa_berlaku' => '2028-06-30',
                'deskripsi' => 'Masker bedah 3 lapis standar rumah sakit',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000051',
                'kode_barang' => 'INV-MED-0002',
                'nama_barang' => 'Sarung Tangan Lateks Non-Steril',
                'inventory_category_id' => '00000000-0000-0000-0000-000000000040',
                'satuan' => 'box',
                'stok_minimum' => 30,
                'stok_saat_ini' => 80,
                'harga_beli' => 25000.00,
                'harga_jual' => 38000.00,
                'warehouse_id' => '00000000-0000-0000-0000-000000000031',
                'supplier_id' => '00000000-0000-0000-0000-000000000034',
                'masa_berlaku' => '2027-12-31',
                'deskripsi' => 'Sarung tangan lateks untuk tindakan non-bedah',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000052',
                'kode_barang' => 'INV-MED-0003',
                'nama_barang' => 'Alcohol Swab',
                'inventory_category_id' => '00000000-0000-0000-0000-000000000040',
                'satuan' => 'pack',
                'stok_minimum' => 40,
                'stok_saat_ini' => 10,
                'harga_beli' => 3000.00,
                'harga_jual' => 5000.00,
                'warehouse_id' => '00000000-0000-0000-0000-000000000031',
                'supplier_id' => '00000000-0000-0000-0000-000000000035',
                'masa_berlaku' => '2027-03-15',
                'deskripsi' => 'Tisu alkohol 70% untuk disinfeksi kulit',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000053',
                'kode_barang' => 'INV-OBT-0001',
                'nama_barang' => 'Cairan Infus NaCl 0,9% 500ml',
                'inventory_category_id' => '00000000-0000-0000-0000-000000000041',
                'satuan' => 'botol',
                'stok_minimum' => 100,
                'stok_saat_ini' => 200,
                'harga_beli' => 15000.00,
                'harga_jual' => 25000.00,
                'warehouse_id' => '00000000-0000-0000-0000-000000000030',
                'supplier_id' => '00000000-0000-0000-0000-000000000033',
                'masa_berlaku' => '2027-08-20',
                'deskripsi' => 'Cairan infus isotonik NaCl 0,9%',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000054',
                'kode_barang' => 'INV-ATK-0001',
                'nama_barang' => 'Kertas HVS A4 80gr',
                'inventory_category_id' => '00000000-0000-0000-0000-000000000042',
                'satuan' => 'rim',
                'stok_minimum' => 100,
                'stok_saat_ini' => 300,
                'harga_beli' => 45000.00,
                'harga_jual' => 55000.00,
                'warehouse_id' => '00000000-0000-0000-0000-000000000032',
                'supplier_id' => '00000000-0000-0000-0000-000000000036',
                'masa_berlaku' => null,
                'deskripsi' => 'Kertas HVS ukuran A4 80 gram',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => '00000000-0000-0000-0000-000000000055',
                'kode_barang' => 'INV-SAN-0001',
                'nama_barang' => 'Sabun Cair Antiseptik 5L',
                'inventory_category_id' => '00000000-0000-0000-0000-000000000044',
                'satuan' => 'jerigen',
                'stok_minimum' => 20,
                'stok_saat_ini' => 60,
                'harga_beli' => 85000.00,
                'harga_jual' => 110000.00,
                'warehouse_id' => '00000000-0000-0000-0000-000000000032',
                'supplier_id' => '00000000-0000-0000-0000-000000000036',
                'masa_berlaku' => '2027-01-10',
                'deskripsi' => 'Sabun antiseptik untuk cuci tangan petugas',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $operatorRole = 'admin';
        $operatorId = '00000000-0000-0000-0000-000000000010';

        DB::table('inventory_stock_movements')->insertOrIgnore([
            // Masker Bedah: masuk 200, keluar 50 + 30 -> stok 120
            ['id' => '00000000-0000-0000-0000-000000000060', 'inventory_item_id' => '00000000-0000-0000-0000-000000000050', 'tipe' => 'masuk', 'qty' => 200, 'warehouse_id' => '00000000-0000-0000-0000-000000000031', 'referensi' => 'PO-2026-0001', 'keterangan' => 'Penerimaan pembelian awal', 'stok_setelah' => 200, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(30)],
            ['id' => '00000000-0000-0000-0000-000000000061', 'inventory_item_id' => '00000000-0000-0000-0000-000000000050', 'tipe' => 'keluar', 'qty' => -50, 'warehouse_id' => '00000000-0000-0000-0000-000000000031', 'referensi' => 'RM-2024-0001', 'keterangan' => 'Pemakaian rawat jalan', 'stok_setelah' => 150, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(12)],
            ['id' => '00000000-0000-0000-0000-000000000062', 'inventory_item_id' => '00000000-0000-0000-0000-000000000050', 'tipe' => 'keluar', 'qty' => -30, 'warehouse_id' => '00000000-0000-0000-0000-000000000031', 'referensi' => 'RM-2024-0002', 'keterangan' => 'Pemakaian UGD', 'stok_setelah' => 120, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(3)],

            // Sarung Tangan: masuk 150, keluar 40 + 30 -> stok 80
            ['id' => '00000000-0000-0000-0000-000000000063', 'inventory_item_id' => '00000000-0000-0000-0000-000000000051', 'tipe' => 'masuk', 'qty' => 150, 'warehouse_id' => '00000000-0000-0000-0000-000000000031', 'referensi' => 'PO-2026-0002', 'keterangan' => 'Penerimaan pembelian awal', 'stok_setelah' => 150, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(28)],
            ['id' => '00000000-0000-0000-0000-000000000064', 'inventory_item_id' => '00000000-0000-0000-0000-000000000051', 'tipe' => 'keluar', 'qty' => -40, 'warehouse_id' => '00000000-0000-0000-0000-000000000031', 'referensi' => 'RM-2024-0001', 'keterangan' => 'Pemakaian poli umum', 'stok_setelah' => 110, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(10)],
            ['id' => '00000000-0000-0000-0000-000000000065', 'inventory_item_id' => '00000000-0000-0000-0000-000000000051', 'tipe' => 'keluar', 'qty' => -30, 'warehouse_id' => '00000000-0000-0000-0000-000000000031', 'referensi' => 'RM-2024-0003', 'keterangan' => 'Pemakaian UGD', 'stok_setelah' => 80, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(5)],

            // Alcohol Swab: masuk 50, keluar 40 -> stok 10
            ['id' => '00000000-0000-0000-0000-000000000066', 'inventory_item_id' => '00000000-0000-0000-0000-000000000052', 'tipe' => 'masuk', 'qty' => 50, 'warehouse_id' => '00000000-0000-0000-0000-000000000031', 'referensi' => 'PO-2026-0003', 'keterangan' => 'Penerimaan pembelian awal', 'stok_setelah' => 50, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(20)],
            ['id' => '00000000-0000-0000-0000-000000000067', 'inventory_item_id' => '00000000-0000-0000-0000-000000000052', 'tipe' => 'keluar', 'qty' => -40, 'warehouse_id' => '00000000-0000-0000-0000-000000000031', 'referensi' => 'RM-2024-0002', 'keterangan' => 'Pemakaian poli anak', 'stok_setelah' => 10, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(7)],

            // Infus NaCl: masuk 300, keluar 60 + 40 -> stok 200
            ['id' => '00000000-0000-0000-0000-000000000068', 'inventory_item_id' => '00000000-0000-0000-0000-000000000053', 'tipe' => 'masuk', 'qty' => 300, 'warehouse_id' => '00000000-0000-0000-0000-000000000030', 'referensi' => 'PO-2026-0004', 'keterangan' => 'Penerimaan pembelian awal', 'stok_setelah' => 300, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(25)],
            ['id' => '00000000-0000-0000-0000-000000000069', 'inventory_item_id' => '00000000-0000-0000-0000-000000000053', 'tipe' => 'keluar', 'qty' => -60, 'warehouse_id' => '00000000-0000-0000-0000-000000000030', 'referensi' => 'RM-2024-0001', 'keterangan' => 'Pemakaian rawat inap A', 'stok_setelah' => 240, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(9)],
            ['id' => '00000000-0000-0000-0000-00000000006a', 'inventory_item_id' => '00000000-0000-0000-0000-000000000053', 'tipe' => 'keluar', 'qty' => -40, 'warehouse_id' => '00000000-0000-0000-0000-000000000030', 'referensi' => 'RM-2024-0003', 'keterangan' => 'Pemakaian ICU', 'stok_setelah' => 200, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(2)],

            // Kertas HVS: masuk 500, keluar 150 + 50 -> stok 300
            ['id' => '00000000-0000-0000-0000-00000000006b', 'inventory_item_id' => '00000000-0000-0000-0000-000000000054', 'tipe' => 'masuk', 'qty' => 500, 'warehouse_id' => '00000000-0000-0000-0000-000000000032', 'referensi' => 'PO-2026-0005', 'keterangan' => 'Penerimaan pembelian awal', 'stok_setelah' => 500, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(40)],
            ['id' => '00000000-0000-0000-0000-00000000006c', 'inventory_item_id' => '00000000-0000-0000-0000-000000000054', 'tipe' => 'keluar', 'qty' => -150, 'warehouse_id' => '00000000-0000-0000-0000-000000000032', 'referensi' => 'ADM-2026-01', 'keterangan' => 'Penggunaan bagian administrasi', 'stok_setelah' => 350, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(15)],
            ['id' => '00000000-0000-0000-0000-00000000006d', 'inventory_item_id' => '00000000-0000-0000-0000-000000000054', 'tipe' => 'keluar', 'qty' => -50, 'warehouse_id' => '00000000-0000-0000-0000-000000000032', 'referensi' => 'ADM-2026-02', 'keterangan' => 'Penggunaan pendaftaran pasien', 'stok_setelah' => 300, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(4)],

            // Sabun Cair: masuk 100, keluar 40 -> stok 60
            ['id' => '00000000-0000-0000-0000-00000000006e', 'inventory_item_id' => '00000000-0000-0000-0000-000000000055', 'tipe' => 'masuk', 'qty' => 100, 'warehouse_id' => '00000000-0000-0000-0000-000000000032', 'referensi' => 'PO-2026-0006', 'keterangan' => 'Penerimaan pembelian awal', 'stok_setelah' => 100, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(22)],
            ['id' => '00000000-0000-0000-0000-00000000006f', 'inventory_item_id' => '00000000-0000-0000-0000-000000000055', 'tipe' => 'keluar', 'qty' => -40, 'warehouse_id' => '00000000-0000-0000-0000-000000000032', 'referensi' => 'SAN-2026-01', 'keterangan' => 'Distribusi ke unit pelayanan', 'stok_setelah' => 60, 'operator_role' => $operatorRole, 'operator_id' => $operatorId, 'created_at' => $now->subDays(8)],
        ]);
    }
}
