<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class RbacController extends Controller
{
    public function index(): Response
    {
        $matrix = [
            'admin' => ['manage_users', 'view_reports', 'manage_settings'],
            'dokter' => ['view_patients', 'create_prescriptions', 'view_schedule'],
            // etc...
        ];

        return Inertia::render('admin-menu', [
            'menu' => 'rbac',
            'matrix' => $matrix,
        ]);
    }
}
