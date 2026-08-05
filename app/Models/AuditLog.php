<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasUuids;

    protected $table = 'audit_logs';

    protected $guarded = [];

    public $timestamps = false;

    // if only created_at is needed, we could set a default or hook, but since timestamps is false, we can just let DB or code set created_at.
}
