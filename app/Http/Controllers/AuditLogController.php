<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AuditLog;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::query();

        if ($request->has('modul')) {
            $query->where('aksi', 'like', "%{$request->input('modul')}%");
        }
        
        if ($request->has('pembuat_type')) {
            $query->where('pembuat_type', $request->input('pembuat_type'));
        }

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
        ]);
    }
}
