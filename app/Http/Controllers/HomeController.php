<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class HomeController extends Controller
{
    /**
     * Show the public landing page.
     */
    public function index()
    {
        // Fetch site team members (admins / super-admins)
        $teamMembers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'super-admin']);
        })->get();

        // Serve the cinematic landing page at Home/Index
        return Inertia::render('Home/Index', [
            'teamMembers' => $teamMembers,
        ]);
    }
}
