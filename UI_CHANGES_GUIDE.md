# UI Changes - Visual Guide

## Scriptwriter Interface Updates

### 1. Left Sidebar - New "Sync to Project" Button

```
┌─────────────────────────────────────┐
│  Left Pane (Scene Navigator)       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  + New Script               │   │ ← Existing
│  │  (Amber gradient button)    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔗 Sync to Project         │   │ ← NEW! Purple button
│  │  (Purple border)            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📖 Export PDF              │   │ ← Existing
│  │  (Blue border)              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Scenes (3)                         │
│  ┌─────────────────────────────┐   │
│  │ 1  INT. COFFEE SHOP - DAY   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 2  EXT. STREET - NIGHT      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 2. Title Bar - Enhanced with Project Link Display

**Before (No Project):**
```
┌────────────────────────────────────────────────────────┐
│  [Untitled Script                    ] ☁️ Synced       │
└────────────────────────────────────────────────────────┘
```

**After (With Project):**
```
┌────────────────────────────────────────────────────────┐
│  [My Awesome Script                  ] ☁️ Synced       │
│  🔗 Synced to: Action Film Project ❌                  │ ← NEW!
└────────────────────────────────────────────────────────┘
     ↑                                  ↑
   Link Icon                         Unlink Button
```

### 3. Project Selector Modal

**Opened when clicking "Sync to Project" button:**

```
╔═════════════════════════════════════════════════════════════╗
║  🔗 Sync to Project                                    ❌    ║
║  Link this script to one of your projects                   ║
╠═════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ ❌ Unlink from Current Project                       │   ║ ← If already linked
║  │ Make this script standalone                          │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ [Thumbnail] Action Film Project                   ✓  │   ║ ← Currently linked
║  │            Created Dec 10, 2025                      │   ║   (Purple border)
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ [Thumbnail] Documentary Series                       │   ║ ← Available projects
║  │            Created Dec 8, 2025                       │   ║   (White border)
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ [Thumbnail] Comedy Short                             │   ║
║  │            Created Nov 30, 2025                      │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
╚═════════════════════════════════════════════════════════════╝
```

**Empty State (No Projects):**
```
╔═════════════════════════════════════════════════════════════╗
║  🔗 Sync to Project                                    ❌    ║
║  Link this script to one of your projects                   ║
╠═════════════════════════════════════════════════════════════╣
║                                                              ║
║                        🎬                                    ║
║                   No projects found                          ║
║         Create a project first to sync your script           ║
║                                                              ║
╚═════════════════════════════════════════════════════════════╝
```

**Loading State:**
```
╔═════════════════════════════════════════════════════════════╗
║  🔗 Sync to Project                                    ❌    ║
║  Link this script to one of your projects                   ║
╠═════════════════════════════════════════════════════════════╣
║                                                              ║
║                        ⟳                                     ║
║                   (spinning)                                 ║
║                                                              ║
╚═════════════════════════════════════════════════════════════╝
```

---

## User Flow Examples

### Scenario 1: Linking a Script to a Project

1. User clicks **"Sync to Project"** button (purple, left sidebar)
2. Modal opens with loading spinner
3. User's projects load and display
4. User clicks on a project card
5. Modal shows syncing state
6. Script syncs, modal closes
7. Title bar now shows: "🔗 Synced to: [Project Name] ❌"

### Scenario 2: Unlinking a Script

**Option A: From Title Bar**
1. User sees "🔗 Synced to: [Project Name] ❌"
2. User clicks the ❌ button
3. Script unlinks (becomes standalone)
4. Project indicator disappears

**Option B: From Modal**
1. User opens "Sync to Project" modal
2. Red "Unlink" button appears at top
3. User clicks "Unlink from Current Project"
4. Script unlinks
5. Modal closes

### Scenario 3: Changing Linked Project

1. Script is linked to "Project A"
2. User opens "Sync to Project" modal
3. "Project A" has purple border and ✓ checkmark
4. User clicks on "Project B"
5. Script switches from A to B
6. Title bar updates to show "Project B"

### Scenario 4: Title Saving (Fixed)

**Old Behavior (Broken):**
1. User types "My New Title"
2. User clicks away (blur)
3. Title reverts on reload ❌

**New Behavior (Fixed):**
1. User types "My New Title"
2. User clicks away (blur)
3. `saveTitle()` called with current value
4. Sync status shows "Syncing..." → "Synced"
5. Title persists on reload ✅

---

## Color Coding

- **Amber/Orange**: Primary actions (New Script)
- **Purple**: Project-related actions (Sync to Project)
- **Blue**: Export/Output actions (Export PDF)
- **Green/Emerald**: Success states (Synced)
- **Red**: Destructive actions (Unlink)
- **Gray/Slate**: Background, disabled states

---

## Accessibility Features

- ✅ Keyboard navigation (Tab to focus, Enter to select)
- ✅ Clear button labels with icons
- ✅ Disabled states for invalid actions
- ✅ Loading states with visual feedback
- ✅ High contrast text (WCAG AA compliant)
- ✅ Focus rings on interactive elements

---

## Responsive Design

- Desktop (>1024px): Full 3-column layout
- Tablet (768-1023px): Responsive modal, stacked buttons
- Mobile (<768px): Hidden sidebars when printing

---

## Technical Implementation

### State Management
```javascript
// New state variables added
const [showProjectModal, setShowProjectModal] = useState(false);
const [userProjects, setUserProjects] = useState([]);
const [loadingProjects, setLoadingProjects] = useState(false);
const [syncingProject, setSyncingProject] = useState(false);
```

### Key Functions
```javascript
// Title saving
const saveTitle = useCallback((newTitle) => {
    axios.put(route('scriptwriter.update', currentScript.id), { title: newTitle })
}, []);

// Project syncing
const handleSyncToProject = async (projectId) => {
    axios.post(route('scriptwriter.attachProject', activeScript.id), 
        { project_id: projectId })
};
```

### API Integration
- `GET /scriptwriter/api/user-projects` - Fetch projects
- `POST /scriptwriter/{id}/attach-project` - Link/unlink
- `PUT /scriptwriter/{id}` - Update title/content/project

---

**Created**: 2025-12-15  
**Version**: 1.0  
**Status**: ✅ Implemented
