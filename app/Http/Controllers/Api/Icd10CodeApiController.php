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
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $data = $query->orderBy('code')->paginate($request->input('per_page', 50));

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }
}
