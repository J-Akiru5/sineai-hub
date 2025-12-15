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
Route::get('/search/suggestions', [\App\Http\Controllers\SearchController::class, 'suggestions'])->name('search.suggestions');

// Premiere discovery (public)
Route::get('/premiere', [PremiereController::class, 'index'])->name('premiere.index');
Route::get('/premiere/{project}', [PremiereController::class, 'show'])->name('premiere.show');

// Premiere authenticated actions
Route::middleware(['auth'])->group(function () {
    Route::patch('/premiere/{project}', [PremiereController::class, 'update'])->name('premiere.update');
    Route::post('/premiere/{project}/like', [PremiereController::class, 'toggleLike'])->name('premiere.toggleLike');
});

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
    Route::get('/scripts', [ScriptwriterController::class, 'list'])->name('scripts.index');
    Route::get('/scriptwriter', [ScriptwriterController::class, 'index'])->name('scriptwriter.index');
    Route::post('/scriptwriter/assist', [ScriptwriterController::class, 'assist'])->name('scriptwriter.assist');
    // Script CRUD
    Route::post('/scriptwriter', [ScriptwriterController::class, 'store'])->name('scriptwriter.store');
    Route::get('/scriptwriter/{script}', [ScriptwriterController::class, 'show'])->name('scriptwriter.show');
    Route::put('/scriptwriter/{script}', [ScriptwriterController::class, 'update'])->name('scriptwriter.update');
    Route::delete('/scriptwriter/{script}', [ScriptwriterController::class, 'destroy'])->name('scriptwriter.destroy');
    // Script project linking
    Route::post('/scriptwriter/{script}/attach-project', [ScriptwriterController::class, 'attachProject'])->name('scriptwriter.attachProject');
    Route::get('/scriptwriter/api/user-projects', [ScriptwriterController::class, 'getUserProjects'])->name('scriptwriter.userProjects');

    // Spark AI Integration for Scriptwriter
    Route::post('/spark/rewrite', [\App\Http\Controllers\SparkScriptController::class, 'rewrite'])->name('spark.rewrite');
    Route::post('/spark/generate', [\App\Http\Controllers\SparkScriptController::class, 'generate'])->name('spark.generate');

    // Storage Management
    Route::get('/storage', [\App\Http\Controllers\StorageController::class, 'index'])->name('storage.index');
    Route::post('/storage/upload', [\App\Http\Controllers\StorageController::class, 'upload'])->name('storage.upload');
    Route::delete('/storage/{file}', [\App\Http\Controllers\StorageController::class, 'destroy'])->name('storage.destroy');
    Route::patch('/storage/{file}/rename', [\App\Http\Controllers\StorageController::class, 'rename'])->name('storage.rename');
    Route::patch('/storage/{file}/move', [\App\Http\Controllers\StorageController::class, 'move'])->name('storage.move');
    Route::get('/storage/folder/{folder?}', [\App\Http\Controllers\StorageController::class, 'folder'])->name('storage.folder');
    Route::get('/storage/type/{type}', [\App\Http\Controllers\StorageController::class, 'byType'])->name('storage.type');

    // Video Editor (Studio)
    Route::get('/studio/projects', [\App\Http\Controllers\EditorProjectController::class, 'index'])->name('studio.projects');
    Route::post('/studio/projects', [\App\Http\Controllers\EditorProjectController::class, 'store'])->name('studio.projects.store');
    Route::get('/studio/editor/{project}', [\App\Http\Controllers\EditorProjectController::class, 'edit'])->name('studio.editor.edit');
    Route::patch('/studio/editor/{project}', [\App\Http\Controllers\EditorProjectController::class, 'update'])->name('studio.editor.update');
    Route::post('/studio/editor/{project}/timeline', [\App\Http\Controllers\EditorProjectController::class, 'saveTimeline'])->name('studio.editor.timeline');
    Route::post('/studio/editor/{project}/assets', [\App\Http\Controllers\EditorProjectController::class, 'uploadAsset'])->name('studio.editor.upload');
    Route::post('/studio/editor/{project}/assets/library', [\App\Http\Controllers\EditorProjectController::class, 'addAssetFromLibrary'])->name('studio.editor.addFromLibrary');
    Route::delete('/studio/editor/{project}/assets/{asset}', [\App\Http\Controllers\EditorProjectController::class, 'removeAsset'])->name('studio.editor.removeAsset');
    Route::delete('/studio/projects/{project}', [\App\Http\Controllers\EditorProjectController::class, 'destroy'])->name('studio.projects.destroy');
    Route::post('/studio/projects/{project}/duplicate', [\App\Http\Controllers\EditorProjectController::class, 'duplicate'])->name('studio.projects.duplicate');
    
    // Legacy route for new project creation flow
    Route::get('/studio/editor', function () {
        return Inertia::render('Studio/Editor', [
            'project' => null,
            'userVideos' => auth()->user()->files()->ofType('video')->orderBy('created_at', 'desc')->get(),
            'quota' => [
                'remaining' => auth()->user()->getOrCreateStorageQuota()->remaining_bytes,
                'formatted_remaining' => auth()->user()->getOrCreateStorageQuota()->formatted_remaining,
            ],
        ]);
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
        
        // Category management
        Route::get('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('categories.store');
        Route::patch('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::post('/categories/reorder', [\App\Http\Controllers\Admin\CategoryController::class, 'reorder'])->name('categories.reorder');
        
        // Admin Creator Management
        Route::get('/creators', [\App\Http\Controllers\Admin\CreatorController::class, 'index'])->name('creators.index');
        Route::patch('/creators/{user}/verify', [\App\Http\Controllers\Admin\CreatorController::class, 'toggleVerification'])->name('creators.verify');
    });

    // Settings routes
    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
    Route::patch('/settings', [\App\Http\Controllers\SettingsController::class, 'update'])->name('settings.update');
    Route::patch('/settings/notifications', [\App\Http\Controllers\SettingsController::class, 'updateNotifications'])->name('settings.notifications');
    Route::patch('/settings/privacy', [\App\Http\Controllers\SettingsController::class, 'updatePrivacy'])->name('settings.privacy');
    Route::patch('/settings/appearance', [\App\Http\Controllers\SettingsController::class, 'updateAppearance'])->name('settings.appearance');
    Route::patch('/settings/player', [\App\Http\Controllers\SettingsController::class, 'updatePlayer'])->name('settings.player');
    Route::delete('/settings/account', [\App\Http\Controllers\SettingsController::class, 'deleteAccount'])->name('settings.deleteAccount');
    Route::get('/settings/export', [\App\Http\Controllers\SettingsController::class, 'exportData'])->name('settings.export');

    // Notifications routes
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('notifications.unreadCount');
    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::delete('/notifications/{notification}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [\App\Http\Controllers\NotificationController::class, 'clearAll'])->name('notifications.clearAll');

    // Playlists resource
    Route::resource('playlists', \App\Http\Controllers\PlaylistController::class);
    Route::post('/playlists/{playlist}/add', [\App\Http\Controllers\PlaylistController::class, 'addProject'])->name('playlists.addProject');
    Route::post('/playlists/{playlist}/remove', [\App\Http\Controllers\PlaylistController::class, 'removeProject'])->name('playlists.removeProject');
    Route::post('/playlists/{playlist}/reorder', [\App\Http\Controllers\PlaylistController::class, 'reorder'])->name('playlists.reorder');

    // Comments (project comments)
    Route::resource('comments', \App\Http\Controllers\CommentController::class)->only(['store', 'destroy']);

    // Flags (content reporting)
    Route::post('/flags', [\App\Http\Controllers\FlagController::class, 'store'])->name('flags.store');

    // Follow/Unfollow actions
    Route::post('/creators/{user}/follow', [\App\Http\Controllers\CreatorController::class, 'follow'])->name('creator.follow');
    Route::delete('/creators/{user}/follow', [\App\Http\Controllers\CreatorController::class, 'unfollow'])->name('creator.unfollow');

// Language switch route (sets session locale)
Route::post('/language', function (Request $request) {
    $request->validate(['locale' => 'required|string']);
    $locale = $request->locale;
    session(['locale' => $locale]);
    return back(303);
})->name('language');

    // Settings
    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/notifications', [\App\Http\Controllers\SettingsController::class, 'updateNotifications'])->name('settings.notifications');
    Route::put('/settings/privacy', [\App\Http\Controllers\SettingsController::class, 'updatePrivacy'])->name('settings.privacy');
    Route::put('/settings/appearance', [\App\Http\Controllers\SettingsController::class, 'updateAppearance'])->name('settings.appearance');
    Route::post('/settings/avatar', [\App\Http\Controllers\SettingsController::class, 'updateAvatar'])->name('settings.avatar');
    Route::post('/settings/banner', [\App\Http\Controllers\SettingsController::class, 'updateBanner'])->name('settings.banner');
    Route::put('/settings/profile', [\App\Http\Controllers\SettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::delete('/settings/account', [\App\Http\Controllers\SettingsController::class, 'deleteAccount'])->name('settings.deleteAccount');

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('notifications.unreadCount');
    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::delete('/notifications/{notification}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');
});

// Public creator profile (public route)
Route::get('/creator/{identifier}', [\App\Http\Controllers\CreatorController::class, 'show'])->name('creator.show');

// Follow actions (authenticated)
Route::middleware(['auth'])->group(function () {
    Route::post('/creator/{user}/follow', [\App\Http\Controllers\CreatorController::class, 'follow'])->name('creator.follow');
    Route::delete('/creator/{user}/follow', [\App\Http\Controllers\CreatorController::class, 'unfollow'])->name('creator.unfollow');
});

// Public Creator Profile routes (outside auth middleware)
Route::get('/creator/{identifier}', [\App\Http\Controllers\CreatorController::class, 'show'])->name('creator.show');
Route::get('/creator/{identifier}/followers', [\App\Http\Controllers\CreatorController::class, 'followers'])->name('creator.followers');
Route::get('/creator/{identifier}/following', [\App\Http\Controllers\CreatorController::class, 'following'])->name('creator.following');

require __DIR__.'/auth.php';
