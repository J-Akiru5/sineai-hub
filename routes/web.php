<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AiAssistantController;
use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('/phpinfo', function () {
    return phpinfo();
});

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Routes for our Projects feature
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');

    // Chat routes
    Route::get('/chat', [ChatController::class, 'index'])->name('chat');
    Route::post('/chat/messages', [ChatController::class, 'store'])->name('chat.messages');

    // AI Assistant route to display page
    Route::get('/ai/chat', [AiAssistantController::class, 'index'])->name('ai.assistant');
    // AI Assistant route
    Route::post('/ai/chat', [AiAssistantController::class, 'chat'])->name('ai.chat');
    // Fetch full conversation history
    Route::get('/ai/conversations/{conversation}', [AiAssistantController::class, 'show'])->name('ai.conversations.show');

    // (Scriptwriter removed)

// Language switch route (sets session locale)
Route::post('/language', function (Request $request) {
    $request->validate(['locale' => 'required|string']);
    $locale = $request->locale;
    session(['locale' => $locale]);
    return back(303);
})->name('language');
});

require __DIR__.'/auth.php';
