<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query();

        if ($request->filled('modul')) {
            $query->where('modul', 'like', "%{$request->input('modul')}%");
        }

        if ($request->filled('pembuat_type')) {
            $query->where('pembuat_type', $request->input('pembuat_type'));
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }
}
