<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = session('simrs_user', null);
        $role = session('simrs_role', 'guest');

        // Simple stats gathering
        $totalUsers = DB::table('admins')->count() +
                      DB::table('dokters')->count() +
                      DB::table('perawats')->count(); // Add more as needed

        $totalPatients = DB::table('pasien')->count();
        $auditLogsCount = DB::table('audit_logs')->count();

        $stats = [
            'totalUsers' => $totalUsers,
            'totalPatients' => $totalPatients,
            'auditLogsCount' => $auditLogsCount,
            'activeSessions' => 0, // Placeholder
        ];

        $recentAuditLogs = AuditLog::orderBy('created_at', 'desc')->take(5)->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentAuditLogs' => $recentAuditLogs,
            'user' => $user,
            'role' => $role,
        ]);
    }
}
