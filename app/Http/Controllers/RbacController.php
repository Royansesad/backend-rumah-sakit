<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class RbacController extends Controller
{
    public function index()
    {
        $matrix = [
            'admin' => ['manage_users', 'view_reports', 'manage_settings'],
            'dokter' => ['view_patients', 'create_prescriptions', 'view_schedule'],
            // etc...
        ];

        return Inertia::render('rbac/index', [
            'matrix' => $matrix,
        ]);
    }
}
