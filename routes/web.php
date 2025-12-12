<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AiAssistantController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ScriptwriterController;
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

// Scriptwriter page (Inertia) - accessible to authenticated users
// Some frontend code references `scriptwriter.index` so provide a real page.
// The page itself lives at `resources/js/Pages/Scriptwriter/Index.jsx`.
// Route is added inside the auth group further below.

Route::get('/', [HomeController::class, 'index'])->name('home');

// Public AI Chat endpoint for guests (no auth) - rate limited to prevent abuse
Route::post('/ai/guest-chat', [AiAssistantController::class, 'guestChat'])->middleware('throttle:10,1')->name('ai.guest-chat');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Routes for our Projects feature
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');

    // Show individual project
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');

    // Chat routes
    Route::get('/chat', [ChatController::class, 'index'])->name('chat');
    Route::post('/chat/messages', [ChatController::class, 'store'])->name('chat.messages');

    // AI Assistant route to display page
    Route::get('/ai/chat', [AiAssistantController::class, 'index'])->name('ai.assistant');
    // AI Assistant route
    Route::post('/ai/chat', [AiAssistantController::class, 'chat'])->name('ai.chat');
    // Fetch full conversation history
    Route::get('/ai/conversations/{conversation}', [AiAssistantController::class, 'show'])->name('ai.conversations.show');
    // Conversation management: update title, delete conversation
    Route::put('/ai/conversations/{conversation}', [AiAssistantController::class, 'update'])->name('ai.conversations.update');
    Route::delete('/ai/conversations/{conversation}', [AiAssistantController::class, 'destroy'])->name('ai.conversations.destroy');

    // Scriptwriter page (Cinematic UI)
    Route::get('/scriptwriter', [ScriptwriterController::class, 'index'])->name('scriptwriter.index');
    Route::post('/scriptwriter/assist', [ScriptwriterController::class, 'assist'])->name('scriptwriter.assist');
    // Script CRUD
    Route::post('/scriptwriter', [ScriptwriterController::class, 'store'])->name('scriptwriter.store');
    Route::get('/scriptwriter/{script}', [ScriptwriterController::class, 'show'])->name('scriptwriter.show');
    Route::put('/scriptwriter/{script}', [ScriptwriterController::class, 'update'])->name('scriptwriter.update');
    Route::delete('/scriptwriter/{script}', [ScriptwriterController::class, 'destroy'])->name('scriptwriter.destroy');

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
