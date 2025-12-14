<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PremiereController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AiAssistantController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ScriptwriterController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\RoleController as AdminRoleController;
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

// Search (public)
Route::get('/search', [\App\Http\Controllers\SearchController::class, 'index'])->name('search.index');

// Premiere discovery (public)
Route::get('/premiere', [PremiereController::class, 'index'])->name('premiere.index');
Route::get('/premiere/{project}', [PremiereController::class, 'show'])->name('premiere.show');

// Public AI Chat endpoint for guests (no auth) - rate limited to prevent abuse
Route::post('/ai/guest-chat', [AiAssistantController::class, 'guestChat'])->middleware('throttle:10,1')->name('ai.guest-chat');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Routes for our Projects feature
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/my-projects', [ProjectController::class, 'myProjects'])->name('projects.my');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');

    // Edit & update routes for projects (owners only)
    Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::patch('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');

    // Show individual project
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    // Chat routes
    Route::get('/chat', [ChatController::class, 'index'])->name('chat');
    Route::get('/chat/{channel}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/messages', [ChatController::class, 'store'])->name('chat.messages');
    Route::get('/chat/user/scripts', [ChatController::class, 'userScripts'])->name('chat.user.scripts');
    Route::get('/chat/user/projects', [ChatController::class, 'userProjects'])->name('chat.user.projects');

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

    // Spark AI Integration for Scriptwriter
    Route::post('/spark/rewrite', [\App\Http\Controllers\SparkScriptController::class, 'rewrite'])->name('spark.rewrite');
    Route::post('/spark/generate', [\App\Http\Controllers\SparkScriptController::class, 'generate'])->name('spark.generate');

    // Video Editor (Studio)
    Route::get('/studio/editor', function () {
        return Inertia::render('Studio/Editor');
    })->name('studio.editor');

    // Admin area routes (requires user to have the 'admin' role)
    Route::middleware(['auth', 'ensure.role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        // User management (list, update roles)
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::patch('/users/{user}/ban', [AdminUserController::class, 'toggleBan'])->name('users.ban');

        // Role management (list, create, delete)
        Route::get('/roles', [AdminRoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [AdminRoleController::class, 'store'])->name('roles.store');
        Route::delete('/roles/{role}', [AdminRoleController::class, 'destroy'])->name('roles.destroy');
        Route::get('/roles/{role}/edit', [AdminRoleController::class, 'edit'])->name('roles.edit');
        Route::patch('/roles/{role}', [AdminRoleController::class, 'update'])->name('roles.update');
        
        // Activity logs
        Route::get('/activity-logs', [\App\Http\Controllers\Admin\ActivityLogController::class, 'index'])->name('activity-logs.index');
        
        // Channel management
        Route::get('/channels', [\App\Http\Controllers\Admin\ChannelController::class, 'index'])->name('channels.index');
        Route::post('/channels', [\App\Http\Controllers\Admin\ChannelController::class, 'store'])->name('channels.store');
        Route::patch('/channels/{channel}', [\App\Http\Controllers\Admin\ChannelController::class, 'update'])->name('channels.update');
        Route::delete('/channels/{channel}', [\App\Http\Controllers\Admin\ChannelController::class, 'destroy'])->name('channels.destroy');
        
        // Moderation panel
        Route::get('/moderation', [\App\Http\Controllers\Admin\ModerationController::class, 'index'])->name('moderation.index');
        Route::patch('/moderation/project/{project}', [\App\Http\Controllers\Admin\ModerationController::class, 'updateProjectStatus'])->name('moderation.updateProjectStatus');
        Route::patch('/moderation/flag/{flag}', [\App\Http\Controllers\Admin\ModerationController::class, 'resolveFlag'])->name('moderation.resolveFlag');
    });

    // (Scriptwriter removed)

    // Playlists resource
    Route::resource('playlists', \App\Http\Controllers\PlaylistController::class);
    Route::post('/playlists/{playlist}/add', [\App\Http\Controllers\PlaylistController::class, 'addProject'])->name('playlists.addProject');

    // Comments (project comments)
    Route::resource('comments', \App\Http\Controllers\CommentController::class)->only(['store', 'destroy']);

    // Flags (content reporting)
    Route::post('/flags', [\App\Http\Controllers\FlagController::class, 'store'])->name('flags.store');

// Language switch route (sets session locale)
Route::post('/language', function (Request $request) {
    $request->validate(['locale' => 'required|string']);
    $locale = $request->locale;
    session(['locale' => $locale]);
    return back(303);
})->name('language');
});

require __DIR__.'/auth.php';
