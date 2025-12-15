# Scriptwriter Module - Root Cause Analysis Report

## Executive Summary
This document provides a comprehensive diagnosis of three critical issues identified in the Scriptwriter module of SineAI Hub. Each issue has been thoroughly investigated and root causes have been documented below.

---

## Task 1: Script Title Logic - Input Field Behavior

### Investigation
**File Examined:** `resources/js/Pages/Scriptwriter/Index.jsx` (lines 540-554)

### Findings

#### ✅ **Input Field Present**
- **Line 540-554**: The Script Title is implemented as an `<input>` element (not just text).
- The input is bound to `activeScript?.title` with a controlled component pattern.

#### ✅ **onChange Handler Present**
- **Line 542-546**: There is an `onChange` handler that updates the local state:
  ```javascript
  onChange={(e) => {
      if (activeScript) {
          setActiveScript({ ...activeScript, title: e.target.value });
      }
  }}
  ```

#### ❌ **ROOT CAUSE #1: Title Changes NOT Saved to API**

**Location:** Lines 547-551

**The Problem:**
The `onBlur` handler calls `handleAutoSave(blocks)` but does NOT include the updated title:

```javascript
onBlur={() => {
    if (activeScript && activeScript.id) {
        handleAutoSave(blocks);  // ⚠️ Only saves content, NOT title
    }
}}
```

**Detailed Analysis:**

1. **Current Flow:**
   - User types in title field → `onChange` updates local state only
   - User clicks away → `onBlur` fires
   - `handleAutoSave(blocks)` is called
   - Looking at `handleAutoSave` (lines 107-125), it sends:
     ```javascript
     axios.put(route('scriptwriter.update', currentScript.id), {
         content: JSON.stringify(blocksData),
         title: currentScript.title  // ⚠️ Uses OLD title from ref
     })
     ```

2. **The Bug:**
   - `activeScriptRef.current` is updated via `useEffect` (lines 38-40)
   - BUT there's a timing issue: when `onBlur` fires, the ref may not have the updated title yet
   - Even if the ref is updated, `handleAutoSave` receives `blocks` as parameter but doesn't receive the new title
   - The API call uses `currentScript.title` from the ref, which may be stale

3. **Impact:**
   - Script title changes are NOT persisted to the database
   - Users can type a title, but it reverts to the old value on page reload
   - This creates a confusing user experience

**Evidence from Controller:**
- `app/Http/Controllers/ScriptwriterController.php` (lines 69-91)
- The `update` method DOES accept and save the title:
  ```php
  if (array_key_exists('title', $data)) {
      $script->title = $data['title'] ?? $script->title;
  }
  ```
- So the backend is ready to receive title updates, but the frontend doesn't send them properly

---

## Task 2: "Sync to Project" Failure - 422 Validation Errors

### Investigation
**Files Examined:**
- `app/Http/Controllers/ScriptwriterController.php`
- `database/migrations/2025_12_12_120000_create_scripts_table.php`
- `app/Models/Script.php`

### Findings

#### ❌ **ROOT CAUSE #2: No Project Linking Functionality Exists**

**Location:** Entire `ScriptwriterController.php` and `Script` model

**The Problem:**
There is NO "Sync to Project" functionality implemented at all. This is not a validation error - the feature doesn't exist.

**Detailed Analysis:**

1. **Database Schema (scripts table):**
   - **Line 18**: `foreignId('user_id')` - ✅ Exists
   - **Line 19**: `string('title')` - ✅ Exists  
   - **Line 20**: `json('content')` - ✅ Exists
   - **MISSING**: `project_id` column - ❌ Does NOT exist

2. **Controller Methods:**
   - `store()` - Creates scripts with user_id only
   - `update()` - Updates title and content only
   - **MISSING**: No method to link/sync scripts to projects
   - **MISSING**: No validation for `project_id`

3. **Model Relationships:**
   - `Script.php` (lines 1-22):
     - Has `user()` relationship ✅
     - **MISSING**: No `project()` relationship ❌

4. **Why "Sync to Project" Would Fail:**
   - If frontend sends `project_id` in request → Backend ignores it (not in validation rules)
   - If frontend expects to link scripts to projects → No database column to store the relationship
   - If frontend sends `project_id` with strict validation → Would get 422 error because it's not an accepted field

5. **Evidence from Code:**
   - The `update` method (lines 76-79) only validates:
     ```php
     $data = $request->validate([
         'title' => 'nullable|string|max:255',
         'content' => 'nullable',
     ]);
     ```
   - No mention of `project_id` anywhere in validation

6. **Standalone Scripts:**
   - The current implementation treats ALL scripts as standalone
   - There is no concept of "project-linked" vs "standalone" scripts
   - The system doesn't handle or differentiate between these cases

**Impact:**
- Cannot link scripts to projects
- "Sync to Project" button would fail with 422 or be silently ignored
- No way to organize scripts by project
- Standalone scripts work fine because that's the only mode that exists

---

## Task 3: Storage Limit Logic for PDF Exports

### Investigation
**Files Examined:**
- `resources/js/Pages/Scriptwriter/Index.jsx` (lines 348-350)
- `app/Models/UserStorageQuota.php`
- `database/migrations/2025_12_15_100001_create_user_storage_quotas_table.php`
- `database/migrations/2025_12_15_100002_create_user_files_table.php`
- `app/Http/Controllers/ScriptwriterController.php`

### Findings

#### ✅ **Storage Infrastructure Exists**
- `UserStorageQuota` model with quota tracking (1GB default)
- `UserFile` model for tracking uploaded files
- Methods for storage management: `canStore()`, `addUsage()`, `removeUsage()`

#### ❌ **ROOT CAUSE #3: PDF Exports NOT Tracked Against Storage Quota**

**Location:** 
- Frontend: `resources/js/Pages/Scriptwriter/Index.jsx` (line 348)
- Backend: No PDF export endpoint exists

**The Problem:**
PDF exports use browser print dialog (`window.print()`) and are never tracked in the storage system.

**Detailed Analysis:**

1. **Current PDF Export Implementation:**
   ```javascript
   // Line 348-350
   const handleExportPDF = () => {
       window.print();
   };
   ```
   - This triggers the browser's native print dialog
   - User can "Print to PDF" using their browser
   - **NO server-side processing**
   - **NO file size calculation**
   - **NO storage quota checking**
   - **NO file record created**

2. **Storage System Capabilities:**
   - `UserStorageQuota` model has:
     - `canStore(int $bytes)` - Check if user has space ✅
     - `addUsage(int $bytes)` - Add to used storage ✅
     - `removeUsage(int $bytes)` - Remove from used storage ✅
   - `UserFile` model tracks:
     - File name, path, size, type ✅
     - User association ✅

3. **The Missing Logic:**
   
   **NO Backend PDF Export Endpoint:**
   - ScriptwriterController has NO `exportPDF()` or similar method
   - No route like `POST /scriptwriter/{script}/export-pdf`
   - No PDF generation library integration (e.g., no DomPDF, no wkhtmltopdf)

   **NO Storage Quota Check Before Export:**
   - No code checks `$user->getOrCreateStorageQuota()->canStore($estimatedPdfSize)`
   - No validation prevents export when storage is full

   **NO Storage Usage Update After Export:**
   - No code calls `$quota->addUsage($actualPdfSize)` after creating PDF
   - No `UserFile` record created for the PDF

   **NO File Size Calculation:**
   - Text-based scripts (JSON) are tiny (~1-10 KB typically)
   - But PDFs with formatting could be 50-500 KB or more
   - System has no way to estimate or measure PDF size

4. **Evidence from Database:**
   - `user_storage_quotas` table (lines 14-22):
     - `quota_bytes` column exists ✅
     - `used_bytes` column exists ✅
   - `user_files` table (lines 14-29):
     - `size_bytes` column exists ✅
     - Can store document type ✅

5. **Why This Is a Problem:**
   - Users can export unlimited PDFs without any quota enforcement
   - If server-side PDF generation is added later:
     - PDF files would consume storage
     - But usage wouldn't be tracked
     - Users could exceed quotas without warnings
   - Inconsistent storage tracking (images/videos counted, PDFs not counted)

**Current Hypothesis Confirmed:**
Yes, the hypothesis in the task is correct:
- Text-based scripts are small ✅
- PDF exports need to be counted against storage ✅
- This logic is NOT present in the codebase ❌

**Impact:**
- No storage quota enforcement for PDF exports
- Potential for storage abuse if server-side PDF generation is added
- Inconsistent user experience (some files counted, PDFs not counted)
- Missing feature for enterprise/quota-conscious deployments

---

## Summary of Root Causes

### Issue 1: Script Title Not Saving
**Root Cause:** The `onBlur` handler calls `handleAutoSave(blocks)` but the debounced function uses a stale reference to `activeScript.title` that doesn't include the user's changes. The title is only updated in local state, not sent to the API.

### Issue 2: "Sync to Project" Failure
**Root Cause:** The feature doesn't exist. There's no `project_id` column in the `scripts` table, no validation rules for project linking, no controller method to handle syncing, and no model relationship defined. All scripts are effectively standalone.

### Issue 3: Storage Limit Logic Missing
**Root Cause:** PDF exports use `window.print()` (client-side only). There's no server-side PDF generation, no file size calculation, no storage quota checking before export, and no usage tracking after export. The storage infrastructure exists but isn't integrated with the PDF export feature.

---

## Recommendations (Not Implemented - For Planning Only)

### For Issue 1 (Script Title):
1. Modify `onBlur` to include current title in save
2. Or modify `handleAutoSave` to accept both blocks and title as parameters
3. Or trigger auto-save on title change with debouncing

### For Issue 2 (Project Linking):
1. Add migration to add `project_id` nullable foreign key to `scripts` table
2. Add `project()` relationship to `Script` model
3. Update validation rules in `update()` method to accept `project_id`
4. Add method like `syncToProject(Request $request, Script $script)` to controller
5. Handle both standalone and project-linked scripts
6. Update frontend to send `project_id` when syncing

### For Issue 3 (Storage Tracking):
1. Add server-side PDF generation endpoint (e.g., using DomPDF)
2. Calculate PDF file size after generation
3. Check `UserStorageQuota::canStore()` before generating
4. Create `UserFile` record after successful generation
5. Call `UserStorageQuota::addUsage()` to update quota
6. Consider cleanup/deletion logic to reclaim storage
7. Add UI feedback when storage quota is exceeded

---

**Report Generated:** 2025-12-15  
**Analyzed By:** Senior QA & Full Stack Engineer (AI Agent)  
**Status:** Diagnosis Complete - Awaiting Fix Implementation Decision
