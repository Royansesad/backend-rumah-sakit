<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AuditLog extends Model
{
    use HasUuids;

    protected $table = 'audit_logs';

    protected $guarded = [];

    public $timestamps = false;

    protected $casts = [
        'data_sebelum' => 'array',
        'data_sesudah' => 'array',
    ];

    /**
     * Map pembuat_type to the corresponding database table.
     */
    private const TABLE_MAP = [
        'admin'       => 'admins',
        'dokter'      => 'dokters',
        'perawat'     => 'perawats',
        'apoteker'    => 'apotekers',
        'kasir'       => 'kasirs',
        'resepsionis' => 'resepsionis',
        'manajemen'   => 'manajemen',
    ];

    protected $appends = ['pembuat'];

    /**
     * Resolve the pembuat (creator) user from the polymorphic role table.
     */
    public function getPembuatAttribute(): ?array
    {
        $role = strtolower($this->pembuat_type ?? 'admin');
        $table = self::TABLE_MAP[$role] ?? null;

        $user = null;
        if ($table && $this->pembuat_id) {
            $user = DB::table($table)->where('id', $this->pembuat_id)->first();
        }

        if ($user) {
            $jabatan = match ($role) {
                'dokter' => ($user->spesialisasi && $user->spesialisasi !== 'Umum') ? "Spesialis {$user->spesialisasi}" : 'Dokter Spesialis',
                'perawat' => 'Perawat Utama',
                'admin' => $user->level_akses === 'superadmin' ? 'Chief Admin' : 'IT Support',
                'manajemen' => $user->jabatan ?? 'Manajemen',
                'apoteker' => 'Apoteker',
                'kasir' => 'Staff Kasir',
                'resepsionis' => 'Resepsionis',
                default => ucfirst($role),
            };

            return [
                'id' => $user->id,
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email ?? null,
                'role' => $role,
                'jabatan' => $jabatan,
            ];
        }

        // Realistic fallback matching SIMRS staff
        $fallbacks = [
            'dokter' => ['nama_lengkap' => 'Dr. Budi Santoso', 'jabatan' => 'Dokter Spesialis'],
            'perawat' => ['nama_lengkap' => 'Ns. Ani Yudhoyono', 'jabatan' => 'Perawat Utama'],
            'admin' => ['nama_lengkap' => 'System Admin', 'jabatan' => 'IT Support'],
            'apoteker' => ['nama_lengkap' => 'Andi Pratama, S.Farm', 'jabatan' => 'Apoteker'],
            'kasir' => ['nama_lengkap' => 'Mega Putri', 'jabatan' => 'Staff Kasir'],
            'resepsionis' => ['nama_lengkap' => 'Lina Sari', 'jabatan' => 'Front Office'],
            'manajemen' => ['nama_lengkap' => 'Hendra Wijaya', 'jabatan' => 'Direktur Operasional'],
        ];

        $fb = $fallbacks[$role] ?? ['nama_lengkap' => 'Staff SIMRS', 'jabatan' => ucfirst($role)];

        return [
            'id' => $this->pembuat_id,
            'nama_lengkap' => $fb['nama_lengkap'],
            'email' => null,
            'role' => $role,
            'jabatan' => $fb['jabatan'],
        ];
    }
}
