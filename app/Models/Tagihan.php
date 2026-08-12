<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tagihan extends Model
{
    use HasUuids;

    protected $table = 'tagihans';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'rincian' => 'array',
            'waktu_pembayaran' => 'datetime',
            'subtotal' => 'integer',
            'diskon' => 'integer',
            'pajak' => 'integer',
            'total_tagihan' => 'integer',
            'jumlah_dibayar' => 'integer',
            'kembalian' => 'integer',
        ];
    }

    /** @return BelongsTo<Pasien, $this> */
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class, 'pasien_id');
    }

    /** @return BelongsTo<Kasir, $this> */
    public function kasir(): BelongsTo
    {
        return $this->belongsTo(Kasir::class, 'kasir_id');
    }
}
