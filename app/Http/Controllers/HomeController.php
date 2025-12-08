<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Show the public landing page.
     */
    public function index()
    {
        // Serve the cinematic landing page at Home/Index
        return Inertia::render('Home/Index');
    }
}
