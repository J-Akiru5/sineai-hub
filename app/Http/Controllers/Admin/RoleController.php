<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::orderBy('name')->paginate(10)->appends($request->query());
        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for editing the specified role's permissions.
     */
    public function edit(Request $request, Role $role)
    {
        $permissions = DB::table('permissions')->orderBy('name')->get();
        $assigned = DB::table('role_has_permissions')->where('role_id', $role->id)->pluck('permission_id')->toArray();

        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
            'assigned' => $assigned,
        ]);
    }

    /**
     * Update the role's permissions.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $permissionIds = $validated['permissions'] ?? [];

        // Sync pivot table: role_has_permissions (permission_id, role_id)
        DB::transaction(function () use ($role, $permissionIds) {
            DB::table('role_has_permissions')->where('role_id', $role->id)->delete();
            $rows = array_map(function ($pid) use ($role) {
                return ['permission_id' => $pid, 'role_id' => $role->id];
            }, $permissionIds);
            if (!empty($rows)) {
                DB::table('role_has_permissions')->insert($rows);
            }
        });

        return redirect()->back()->with('success', 'Role permissions updated.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
        ]);

        Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        return redirect()->back()->with('success', 'Role created.');
    }

    public function destroy(Role $role)
    {
        if (strtolower($role->name) === 'admin') {
            return redirect()->back()->with('error', 'Cannot delete admin role.');
        }

        try {
            \App\Services\Logger::log('ROLE_DELETED', sprintf('%s deleted role %s', auth()->user()?->name ?? 'System', $role->name));
        } catch (\Throwable $e) {
            // ignore
        }

        $role->delete();
        return redirect()->back()->with('success', 'Role deleted.');
    }
}

