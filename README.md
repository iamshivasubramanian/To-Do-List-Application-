# TaskFlow - Modern To-Do List Application

> **CodeSoft Web Development Internship Submission**  
> Built strictly with **HTML5**, **CSS3**, and **Vanilla JavaScript** (No external frameworks or libraries).

---

## 🌟 Project Overview

**TaskFlow** is a modern, responsive task management application designed for productivity, simplicity, and visual polish. It delivers a full dashboard experience featuring dynamic statistics, categorized task management, priority badging, overdue task tracking, dark/light theme switching, and real-time search & filtering.

All state is persisted client-side using browser **Local Storage** with no backend or external database required.

---

## 📁 File Structure

```text
todo-list/
├── index.html     # Semantic HTML5 layout, accessible modal dialogs, and SVG icons
├── style.css      # CSS3 custom properties, CSS Grid & Flexbox, dark mode, responsive styling
├── script.js     # Vanilla JavaScript state management, DOM manipulation, and Local Storage CRUD
└── README.md      # Project documentation & internship presentation guide
```

---

## 🚀 Live Host Link & Local Run Instructions

The local development server is currently running:

- **Host Link:** [http://127.0.0.1:3000/todo-list/index.html](http://127.0.0.1:3000/todo-list/index.html) or [http://localhost:3000/](http://localhost:3000/)

### Alternative Ways to Run:
1. **Direct Browser Execution:** Double-click `index.html` inside the `todo-list/` directory to launch it immediately in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
2. **Local HTTP Server (Node / Python):**
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Or using Node
   npx serve .
   ```

---

## 🎯 Key Features & Capabilities

### 1. Summary Dashboard Cards
- **Total Tasks:** Real-time count of all registered tasks.
- **Completed Tasks:** Dynamic progress bar showing % completed.
- **Pending Tasks:** Tracks awaiting items.
- **Overdue Tasks:** Automatically flags incomplete tasks whose due date has passed.
- **Interactive Filtering:** Clicking any summary card instantly filters the task list to that status.

### 2. Task Creation & Form Validation
- Required **Task Title** with trim sanitization and error prevention.
- Optional **Description** (multi-line notes).
- **Categories:** Personal, Work, Study, Shopping, Other.
- **Priority Levels:** High, Medium, Low (with color-coded visual badges).
- Optional **Due Date** picker.
- Non-reloading `e.preventDefault()` submission.

### 3. Task Management (CRUD)
- **Toggle Completion:** Accessible checkbox with checkmark transition and title strikethrough.
- **Edit Modal:** Edit title, description, category, priority, and due date in a popup modal. Accessible via `Escape` key or backdrop click.
- **Delete Confirmation Modal:** Custom popup confirming deletion to prevent accidental loss.
- **XSS Prevention:** User input rendered safely via `textContent` and HTML entity escaping.

### 4. Search, Filter & Sort Engine
- **Real-Time Search:** Instant filtering across titles and descriptions as you type.
- **Status Filter:** All, Pending, Completed, Overdue.
- **Category Filter:** All Categories or individual categories.
- **Priority Filter:** All Priorities, Low, Medium, High.
- **Sorting Options:** Newest First, Oldest First, Due Date (earliest first), Priority (High to Low).
- **Reset Filters:** One-click reset button to restore default view.

### 5. Dark Mode Support
- Smooth transition between light and dark surfaces.
- Persisted in browser `localStorage` across page reloads and browser restarts.

### 6. User Feedback (Toast Notifications)
- Non-intrusive floating toast notifications for adds, edits, status toggles, deletions, and validation warnings.
- Auto-dismissing after 3 seconds.

---

## 💡 JavaScript Architecture for Internship Review

| Function | Description |
|---|---|
| `initTasks()` | Seeds starter tasks on first launch or loads from Local Storage. |
| `loadTasks()` | Safely parses JSON task records from `localStorage`. |
| `saveTasks()` | Serializes and saves task array into `localStorage`. |
| `addTask(e)` | Validates inputs, creates new task object, and updates UI. |
| `toggleTaskStatus(id)` | Inverts completed flag and refreshes summary statistics. |
| `openEditModal(id)` / `saveEditTask(e)` | Controls modal dialog for editing existing tasks. |
| `openDeleteModal(id)` / `confirmDeleteTask()` | Controls modal confirmation for safe task removal. |
| `getFilteredAndSortedTasks()` | Multi-condition filtering and sorting pipeline. |
| `updateSummary()` | Calculates counts, percentages, and progress meters. |
| `renderTasks()` | Safely creates DOM elements and updates empty states. |
| `toggleDarkMode()` | Toggles theme token styles and updates storage preference. |
| `showToast(msg, type)` | Spawns accessible feedback alert toasts. |

---

## 🏆 Assessment Criteria Checklist

- [x] HTML5, CSS3, and Vanilla JavaScript only (Zero third-party frameworks).
- [x] Separate files for HTML, CSS, and JS.
- [x] Clean, modern dashboard UI with cards, shadows, and smooth transitions.
- [x] Full Local Storage persistence.
- [x] Responsive layout on Desktop, Tablet, and Mobile.
- [x] Accessible modal dialogues with keyboard support (`Escape` to close).
- [x] Real-time search, multi-filter combinations, and sorting.
