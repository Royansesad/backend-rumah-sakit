<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('modul', 'like', "%{$search}%")
                  ->orWhere('target_label', 'like', "%{$search}%")
                  ->orWhere('target_id', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('pembuat_type') && $request->pembuat_type) {
            $query->where('pembuat_type', $request->pembuat_type);
        }

        if ($request->has('aksi') && $request->aksi) {
            $query->where('aksi', $request->aksi);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(10);

        $aksiOptions = AuditLog::select('aksi')->distinct()->whereNotNull('aksi')->pluck('aksi');
        $roleOptions = AuditLog::select('pembuat_type')->distinct()->whereNotNull('pembuat_type')->pluck('pembuat_type');

        $menuComponent = (string) session('simrs_role', 'admin').'-menu';

        return Inertia::render($menuComponent, [
            'menu' => 'audit-logs',
            'logs' => $logs,
            'filters' => $request->only(['search', 'date_from', 'date_to', 'pembuat_type', 'aksi']),
            'aksiOptions' => $aksiOptions,
            'roleOptions' => $roleOptions,
        ]);
    }

    public function export(Request $request)
    {
        $query = AuditLog::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('modul', 'like', "%{$search}%")
                  ->orWhere('target_label', 'like', "%{$search}%")
                  ->orWhere('target_id', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('pembuat_type') && $request->pembuat_type) {
            $query->where('pembuat_type', $request->pembuat_type);
        }

        if ($request->has('aksi') && $request->aksi) {
            $query->where('aksi', $request->aksi);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        $fileName = 'audit-log-export-' . date('Y-m-d') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($logs) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Waktu', 'Pengguna', 'Role', 'Tindakan', 'Modul', 'Target', 'IP Address', 'User Agent']);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->created_at,
                    $log->pembuat ? $log->pembuat['nama_lengkap'] : 'System',
                    $log->pembuat_type,
                    $log->aksi,
                    $log->modul,
                    $log->target_label ? $log->target_label . ' (' . $log->target_id . ')' : $log->target_id,
                    $log->ip_address,
                    $log->user_agent
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
