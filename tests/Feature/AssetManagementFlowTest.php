<?php

use App\Models\Asset;
use App\Models\AssetCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

function loginAdminForAsset(): string
{
    $res = test()->postJson('/api/v1/admin-login', [
        'email' => 'budi.admin@simrs.id',
        'password' => 'password123',
        'role' => 'admin',
    ]);
    $res->assertOk();

    return $res->json('data.token');
}

it('can fetch asset master data and list', function () {
    $token = loginAdminForAsset();

    $masterRes = $this->withToken($token)->getJson('/api/v1/aset/master');
    $masterRes->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonStructure(['data' => ['kategori', 'ruangan', 'supplier', 'kpi']]);

    $listRes = $this->withToken($token)->getJson('/api/v1/aset');
    $listRes->assertOk()
        ->assertJsonPath('status', 'success');
});

it('can create, update, maintenance, loan, return, and delete an asset', function () {
    $token = loginAdminForAsset();
    $category = AssetCategory::first();

    // 1. Create Asset
    $createRes = $this->withToken($token)->postJson('/api/v1/aset', [
        'kode_aset' => 'TEST-AST-999',
        'nama_aset' => 'USG 4D Testing System',
        'asset_category_id' => $category->id,
        'merk' => 'Samsung',
        'model' => 'WS80A',
        'nomor_seri' => 'SN-SAMS-9999',
        'tanggal_perolehan' => '2024-01-01',
        'nilai_perolehan' => 150000000,
        'umur_ekonomis_tahun' => 5,
        'nilai_residu' => 15000000,
    ]);

    $createRes->assertStatus(201)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.kode_aset', 'TEST-AST-999');

    $assetId = $createRes->json('data.id');

    // 2. Update Asset
    $updateRes = $this->withToken($token)->putJson("/api/v1/aset/{$assetId}", [
        'kode_aset' => 'TEST-AST-999',
        'nama_aset' => 'USG 4D Testing System Updated',
        'asset_category_id' => $category->id,
        'nilai_perolehan' => 150000000,
    ]);
    $updateRes->assertOk()
        ->assertJsonPath('status', 'success');

    // 3. Record Maintenance
    $maintRes = $this->withToken($token)->postJson("/api/v1/aset/{$assetId}/maintenance", [
        'tanggal' => '2026-08-13',
        'jenis' => 'rutin',
        'biaya' => 500000,
        'vendor' => 'PT Test Vendor',
        'keterangan' => 'Pembersihan probe dan kalibrasi',
    ]);
    $maintRes->assertStatus(201)
        ->assertJsonPath('status', 'success');
    $maintId = $maintRes->json('data.maintenance.id');

    // 4. Complete Maintenance
    $maintDoneRes = $this->withToken($token)->patchJson("/api/v1/aset/maintenance/{$maintId}/selesai");
    $maintDoneRes->assertOk()
        ->assertJsonPath('status', 'success');

    // 5. Loan Asset
    $loanRes = $this->withToken($token)->postJson("/api/v1/aset/{$assetId}/pinjam", [
        'unit_peminjam' => 'Ruang UGD',
        'penanggung_jawab' => 'Dr. Test',
        'tanggal_pinjam' => '2026-08-13',
    ]);
    $loanRes->assertStatus(201)
        ->assertJsonPath('status', 'success');

    // 6. Return Loan Asset
    $returnRes = $this->withToken($token)->postJson("/api/v1/aset/{$assetId}/kembalikan");
    $returnRes->assertOk()
        ->assertJsonPath('status', 'success');

    // 7. Delete Asset
    $deleteRes = $this->withToken($token)->deleteJson("/api/v1/aset/{$assetId}");
    $deleteRes->assertOk()
        ->assertJsonPath('status', 'success');
});
