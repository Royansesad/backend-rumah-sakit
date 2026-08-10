<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Icd10Code;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class Icd10CodeApiController extends Controller
{
    /**
     * GET /api/v1/icd10
     * Daftar kode ICD-10 (searchable, paginated).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Icd10Code::query();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%");
            });

            // Order prefix matches on code first, then exact matches
            $query->orderByRaw("CASE WHEN code LIKE ? THEN 1 WHEN code LIKE ? THEN 2 ELSE 3 END", [
                "{$search}",
                "{$search}%"
            ]);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $perPage = (int) $request->input('per_page', 25);
        $perPage = min(max($perPage, 5), 100);

        $data = $query->orderBy('code')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }
}
