/**
 * ==============================================================================
 * TaskFlow - Modern Task Management Dashboard
 * Frontend-only Vanilla JavaScript Implementation
 * Built for CodeSoft Web Development Internship
 * ==============================================================================
 */

// Strict mode for enhanced security and cleaner error detection
'use strict';

/* --------------------------------------------------------------------------
   1. State Management & Constants
   -------------------------------------------------------------------------- */
const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks_v1',
  THEME: 'taskflow_theme_v1',
  INITIALIZED: 'taskflow_initialized_v1'
};

// Application state holding all tasks in memory
let tasks = [];

// Track the task currently selected for deletion
let taskToDeleteId = null;

// Track active filters and search query
const state = {
  searchQuery: '',
  filterStatus: 'all',     // 'all' | 'pending' | 'completed' | 'overdue'
  filterCategory: 'all',   // 'all' | 'Personal' | 'Work' | 'Study' | 'Shopping' | 'Other'
  filterPriority: 'all',   // 'all' | 'Low' | 'Medium' | 'High'
  sortBy: 'newest'         // 'newest' | 'oldest' | 'dueDate' | 'priority'
};

/* --------------------------------------------------------------------------
   2. DOM Element Selectors
   -------------------------------------------------------------------------- */
const elements = {
  // Theme Toggle
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeStatusText: document.getElementById('themeStatusText'),
  currentDateDisplay: document.getElementById('currentDateDisplay'),

  // Summary Cards
  totalTasksCount: document.getElementById('totalTasksCount'),
  completedTasksCount: document.getElementById('completedTasksCount'),
  pendingTasksCount: document.getElementById('pendingTasksCount'),
  overdueTasksCount: document.getElementById('overdueTasksCount'),
  completedSubtext: document.getElementById('completedSubtext'),
  overdueSubtext: document.getElementById('overdueSubtext'),
  completedProgressBar: document.getElementById('completedProgressBar'),
  pendingProgressBar: document.getElementById('pendingProgressBar'),
  overdueProgressBar: document.getElementById('overdueProgressBar'),
  productivityText: document.getElementById('productivityText'),

  cardTotal: document.getElementById('cardTotal'),
  cardCompleted: document.getElementById('cardCompleted'),
  cardPending: document.getElementById('cardPending'),
  cardOverdue: document.getElementById('cardOverdue'),

  // Add Task Form
  addTaskForm: document.getElementById('addTaskForm'),
  taskTitleInput: document.getElementById('taskTitleInput'),
  taskDescInput: document.getElementById('taskDescInput'),
  taskCategorySelect: document.getElementById('taskCategorySelect'),
  taskPrioritySelect: document.getElementById('taskPrioritySelect'),
  taskDueDateInput: document.getElementById('taskDueDateInput'),
  titleError: document.getElementById('titleError'),
  clearAddFormBtn: document.getElementById('clearAddFormBtn'),

  // Search & Filter Controls
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  filterStatus: document.getElementById('filterStatus'),
  filterCategory: document.getElementById('filterCategory'),
  filterPriority: document.getElementById('filterPriority'),
  sortTasksSelect: document.getElementById('sortTasksSelect'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),
  activeCountText: document.getElementById('activeCountText'),
  activeFilterTags: document.getElementById('activeFilterTags'),

  // Task List & Empty States
  taskList: document.getElementById('taskList'),
  emptyStateNoTasks: document.getElementById('emptyStateNoTasks'),
  emptyStateNoResults: document.getElementById('emptyStateNoResults'),
  emptyStateResetBtn: document.getElementById('emptyStateResetBtn'),

  // Edit Modal
  editModal: document.getElementById('editModal'),
  editTaskForm: document.getElementById('editTaskForm'),
  editTaskId: document.getElementById('editTaskId'),
  editTaskTitle: document.getElementById('editTaskTitle'),
  editTaskDesc: document.getElementById('editTaskDesc'),
  editTaskCategory: document.getElementById('editTaskCategory'),
  editTaskPriority: document.getElementById('editTaskPriority'),
  editTaskDueDate: document.getElementById('editTaskDueDate'),
  editTitleError: document.getElementById('editTitleError'),
  closeEditModalBtn: document.getElementById('closeEditModalBtn'),
  cancelEditModalBtn: document.getElementById('cancelEditModalBtn'),

  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteTaskTitlePreview: document.getElementById('deleteTaskTitlePreview'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

/* --------------------------------------------------------------------------
   3. Initialization & Lifecycle
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCurrentDate();
  initTasks();
  setupEventListeners();
  renderApp();
});

/**
 * Initializes the header date display (e.g. "Tuesday, Oct 14, 2026")
 */
function initCurrentDate() {
  if (!elements.currentDateDisplay) return;
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  elements.currentDateDisplay.textContent = now.toLocaleDateString(undefined, options);
}

/**
 * Loads tasks from Local Storage or prepares sample tasks on first visit
 */
function initTasks() {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  
  if (!isInitialized) {
    // Generate helpful starter tasks for demonstration
    const sampleDueDate = new Date();
    sampleDueDate.setDate(sampleDueDate.getDate() + 2);
    const formattedDueDate = sampleDueDate.toISOString().split('T')[0];

    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 1);
    const formattedPastDueDate = pastDueDate.toISOString().split('T')[0];

    tasks = [
      {
        id: generateId(),
        title: 'Prepare internship project documentation',
        description: 'Review code structure, test edge cases, and write README for CodeSoft submission.',
        category: 'Work',
        priority: 'High',
        dueDate: formattedDueDate,
        completed: false,
        createdAt: Date.now() - 1000 * 60 * 60 * 24
      },
      {
        id: generateId(),
        title: 'Complete JavaScript practice challenges',
        description: 'Focus on Array methods, DOM manipulation, and Local Storage APIs.',
        category: 'Study',
        priority: 'High',
        dueDate: formattedPastDueDate, // Sample overdue task for immediate dashboard testing
        completed: false,
        createdAt: Date.now() - 1000 * 60 * 60 * 48
      },
      {
        id: generateId(),
        title: 'Organize study desk and workspace',
        description: 'Tidy up the desk area and arrange study notes.',
        category: 'Personal',
        priority: 'Low',
        dueDate: '',
        completed: true,
        createdAt: Date.now() - 1000 * 60 * 60 * 12
      }
    ];

    saveTasks();
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } else {
    tasks = loadTasks();
  }
}

/* --------------------------------------------------------------------------
   4. Local Storage Operations
   -------------------------------------------------------------------------- */
/**
 * Loads and parses tasks from Local Storage safely
 * @returns {Array} List of task objects
 */
function loadTasks() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!rawData) return [];
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading tasks from Local Storage:', error);
    showToast('Failed to load tasks from local storage.', 'error');
    return [];
  }
}

/**
 * Saves current tasks array to Local Storage
 */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to Local Storage:', error);
    showToast('Failed to save tasks to local storage.', 'error');
  }
}

/* --------------------------------------------------------------------------
   5. Helper Functions
   -------------------------------------------------------------------------- */
/**
 * Generates a unique task identifier string
 */
function generateId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Checks if a task is overdue (dueDate is strictly before today)
 * @param {string} dueDateString - Date string in YYYY-MM-DD format
 * @returns {boolean}
 */
function isOverdue(dueDateString) {
  if (!dueDateString) return false;
  
  const parts = dueDateString.split('-');
  if (parts.length !== 3) return false;
  
  const dueYear = parseInt(parts[0], 10);
  const dueMonth = parseInt(parts[1], 10) - 1;
  const dueDay = parseInt(parts[2], 10);
  const taskDueDate = new Date(dueYear, dueMonth, dueDay);

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return taskDueDate < todayDateOnly;
}

/**
 * Formats a YYYY-MM-DD date string into a clean readable date
 * @param {string} dateStr 
 * @returns {string} e.g. "Oct 15, 2026"
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Escapes unsafe characters for HTML rendering protection
 * @param {string} str 
 * @returns {string}
 */
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* --------------------------------------------------------------------------
   6. Core Task Operations (CRUD)
   -------------------------------------------------------------------------- */
/**
 * Adds a new task to the collection
 */
function addTask(e) {
  if (e) e.preventDefault();

  const title = elements.taskTitleInput.value.trim();
  const description = elements.taskDescInput.value.trim();
  const category = elements.taskCategorySelect.value;
  const priority = elements.taskPrioritySelect.value;
  const dueDate = elements.taskDueDateInput.value;

  // Validation: Title is required and cannot be whitespace
  if (!title) {
    elements.taskTitleInput.classList.add('is-invalid');
    elements.titleError.style.display = 'block';
    elements.taskTitleInput.focus();
    showToast('Task title is required!', 'error');
    return;
  }

  // Clear any existing validation error
  elements.taskTitleInput.classList.remove('is-invalid');
  elements.titleError.style.display = 'none';

  // Construct new task object
  const newTask = {
    id: generateId(),
    title: title,
    description: description,
    category: category,
    priority: priority,
    dueDate: dueDate,
    completed: false, // Default to pending
    createdAt: Date.now()
  };

  // Prepend to show on top
  tasks.unshift(newTask);
  saveTasks();

  // Reset form
  elements.addTaskForm.reset();
  elements.taskCategorySelect.value = 'Work';
  elements.taskPrioritySelect.value = 'Medium';

  showToast('Task added successfully!', 'success');
  renderApp();
}

/**
 * Toggles a task's status between completed and pending
 * @param {string} taskId 
 */
function toggleTaskStatus(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();

  const message = task.completed ? 'Task marked as completed! 🎉' : 'Task marked as pending.';
  showToast(message, 'info');
  renderApp();
}

/**
 * Opens edit modal dialog with target task data
 * @param {string} taskId 
 */
function openEditModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  elements.editTaskId.value = task.id;
  elements.editTaskTitle.value = task.title;
  elements.editTaskDesc.value = task.description || '';
  elements.editTaskCategory.value = task.category;
  elements.editTaskPriority.value = task.priority;
  elements.editTaskDueDate.value = task.dueDate || '';

  elements.editTaskTitle.classList.remove('is-invalid');
  elements.editTitleError.style.display = 'none';

  elements.editModal.classList.remove('hidden');
  elements.editTaskTitle.focus();
}

/**
 * Closes the edit modal dialog
 */
function closeEditModal() {
  elements.editModal.classList.add('hidden');
  elements.editTaskForm.reset();
}

/**
 * Saves changes submitted through the edit task form
 */
function saveEditTask(e) {
  if (e) e.preventDefault();

  const taskId = elements.editTaskId.value;
  const updatedTitle = elements.editTaskTitle.value.trim();
  const updatedDesc = elements.editTaskDesc.value.trim();
  const updatedCategory = elements.editTaskCategory.value;
  const updatedPriority = elements.editTaskPriority.value;
  const updatedDueDate = elements.editTaskDueDate.value;

  // Validation
  if (!updatedTitle) {
    elements.editTaskTitle.classList.add('is-invalid');
    elements.editTitleError.style.display = 'block';
    elements.editTaskTitle.focus();
    return;
  }

  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;

  tasks[taskIndex].title = updatedTitle;
  tasks[taskIndex].description = updatedDesc;
  tasks[taskIndex].category = updatedCategory;
  tasks[taskIndex].priority = updatedPriority;
  tasks[taskIndex].dueDate = updatedDueDate;

  saveTasks();
  closeEditModal();
  showToast('Task updated successfully!', 'success');
  renderApp();
}

/**
 * Opens delete confirmation modal
 * @param {string} taskId 
 */
function openDeleteModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  taskToDeleteId = taskId;
  elements.deleteTaskTitlePreview.textContent = `"${task.title}"`;
  elements.deleteModal.classList.remove('hidden');
  elements.confirmDeleteBtn.focus();
}

/**
 * Closes delete confirmation modal
 */
function closeDeleteModal() {
  taskToDeleteId = null;
  elements.deleteModal.classList.add('hidden');
}

/**
 * Deletes the confirmed task
 */
function confirmDeleteTask() {
  if (!taskToDeleteId) return;

  tasks = tasks.filter(t => t.id !== taskToDeleteId);
  saveTasks();

  closeDeleteModal();
  showToast('Task deleted successfully.', 'info');
  renderApp();
}

/* --------------------------------------------------------------------------
   7. Filtering, Searching, & Sorting Engine
   -------------------------------------------------------------------------- */
/**
 * Filters and sorts tasks based on current user selections
 * @returns {Array} Filtered and sorted tasks
 */
function getFilteredAndSortedTasks() {
  // 1. Filtering
  let filtered = tasks.filter(task => {
    // Search query check (title or description)
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = (task.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // Status filter
    if (state.filterStatus === 'pending' && task.completed) return false;
    if (state.filterStatus === 'completed' && !task.completed) return false;
    if (state.filterStatus === 'overdue') {
      const taskIsOverdue = !task.completed && isOverdue(task.dueDate);
      if (!taskIsOverdue) return false;
    }

    // Category filter
    if (state.filterCategory !== 'all' && task.category !== state.filterCategory) {
      return false;
    }

    // Priority filter
    if (state.filterPriority !== 'all' && task.priority !== state.filterPriority) {
      return false;
    }

    return true;
  });

  // 2. Sorting
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };

  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'newest':
        return (b.createdAt || 0) - (a.createdAt || 0);

      case 'oldest':
        return (a.createdAt || 0) - (b.createdAt || 0);

      case 'dueDate': {
        // Items with no due date pushed to bottom
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }

      case 'priority': {
        const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        if (diff !== 0) return diff;
        return (b.createdAt || 0) - (a.createdAt || 0);
      }

      default:
        return 0;
    }
  });

  return filtered;
}

/**
 * Resets all search, filter, and sort controls to default
 */
function resetAllFilters() {
  state.searchQuery = '';
  state.filterStatus = 'all';
  state.filterCategory = 'all';
  state.filterPriority = 'all';
  state.sortBy = 'newest';

  elements.searchInput.value = '';
  elements.clearSearchBtn.classList.remove('show');
  elements.filterStatus.value = 'all';
  elements.filterCategory.value = 'all';
  elements.filterPriority.value = 'all';
  elements.sortTasksSelect.value = 'newest';

  renderApp();
  showToast('Filters reset to default.', 'info');
}

/* --------------------------------------------------------------------------
   8. Rendering Engine
   -------------------------------------------------------------------------- */
/**
 * Master render function that updates summary stats, active filter tags, and task list
 */
function renderApp() {
  updateSummary();
  updateActiveFilterTags();
  renderTasks();
}

/**
 * Calculates and updates dashboard summary statistics
 */
function updateSummary() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  const overdue = tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length;

  elements.totalTasksCount.textContent = total;
  elements.completedTasksCount.textContent = completed;
  elements.pendingTasksCount.textContent = pending;
  elements.overdueTasksCount.textContent = overdue;

  // Calculate percentages
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const overduePct = total > 0 ? Math.round((overdue / total) * 100) : 0;

  // Update progress bars
  elements.completedProgressBar.style.width = `${completedPct}%`;
  elements.pendingProgressBar.style.width = `${pendingPct}%`;
  elements.overdueProgressBar.style.width = `${overduePct}%`;

  // Update subtext
  elements.completedSubtext.textContent = total > 0 ? `${completedPct}% of total` : 'Done tasks';
  elements.overdueSubtext.textContent = overdue > 0 ? `${overdue} need attention` : 'All on track';

  // Update productivity header pill
  elements.productivityText.textContent = total > 0 ? `${completedPct}% Completed` : '0% Completed';
}

/**
 * Updates the filter summary text and pill tags
 */
function updateActiveFilterTags() {
  const filtered = getFilteredAndSortedTasks();
  elements.activeCountText.textContent = `Showing ${filtered.length} of ${tasks.length} tasks`;

  // Build filter pills
  const tags = [];

  if (state.searchQuery) {
    tags.push(`Search: "${state.searchQuery}"`);
  }
  if (state.filterStatus !== 'all') {
    tags.push(`Status: ${capitalize(state.filterStatus)}`);
  }
  if (state.filterCategory !== 'all') {
    tags.push(`Category: ${state.filterCategory}`);
  }
  if (state.filterPriority !== 'all') {
    tags.push(`Priority: ${state.filterPriority}`);
  }

  elements.activeFilterTags.innerHTML = '';
  tags.forEach(tagText => {
    const tagEl = document.createElement('span');
    tagEl.className = 'filter-tag';
    tagEl.textContent = tagText;
    elements.activeFilterTags.appendChild(tagEl);
  });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Renders task cards to DOM safely
 */
function renderTasks() {
  const container = elements.taskList;
  container.innerHTML = '';

  const displayTasks = getFilteredAndSortedTasks();

  // Handle empty states
  if (tasks.length === 0) {
    elements.emptyStateNoTasks.classList.remove('hidden');
    elements.emptyStateNoResults.classList.add('hidden');
    return;
  } else {
    elements.emptyStateNoTasks.classList.add('hidden');
  }

  if (displayTasks.length === 0) {
    elements.emptyStateNoResults.classList.remove('hidden');
    return;
  } else {
    elements.emptyStateNoResults.classList.add('hidden');
  }

  // Render each task card
  displayTasks.forEach(task => {
    const card = createTaskCardElement(task);
    container.appendChild(card);
  });
}

/**
 * Constructs an accessible, interactive DOM element for a task card
 * Uses safe textContent assignments to eliminate XSS risks
 * @param {Object} task 
 * @returns {HTMLElement}
 */
function createTaskCardElement(task) {
  const card = document.createElement('article');
  card.className = 'task-card';
  card.setAttribute('data-id', task.id);

  const taskIsOverdue = !task.completed && isOverdue(task.dueDate);

  if (task.completed) {
    card.classList.add('is-completed');
  }
  if (taskIsOverdue) {
    card.classList.add('is-overdue');
  }

  // --- Header: Badges & Action Buttons ---
  const header = document.createElement('div');
  header.className = 'task-header';

  const badgesWrap = document.createElement('div');
  badgesWrap.className = 'task-badges';

  // Category Badge
  const categoryBadge = document.createElement('span');
  const catClass = `cat-${task.category.toLowerCase()}`;
  categoryBadge.className = `badge-category ${catClass}`;
  categoryBadge.textContent = task.category;
  badgesWrap.appendChild(categoryBadge);

  // Priority Badge
  const priorityBadge = document.createElement('span');
  const prioClass = `priority-${task.priority.toLowerCase()}`;
  priorityBadge.className = `badge-priority ${prioClass}`;
  priorityBadge.textContent = `${task.priority} Priority`;
  badgesWrap.appendChild(priorityBadge);

  // Overdue Badge
  if (taskIsOverdue) {
    const overdueBadge = document.createElement('span');
    overdueBadge.className = 'badge-overdue';
    overdueBadge.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      Overdue
    `;
    badgesWrap.appendChild(overdueBadge);
  }

  header.appendChild(badgesWrap);

  // Actions Wrap (Edit / Delete)
  const actionsWrap = document.createElement('div');
  actionsWrap.className = 'task-actions';

  // Edit Button
  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn btn-edit';
  editBtn.type = 'button';
  editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
  editBtn.title = 'Edit task';
  editBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  `;
  editBtn.addEventListener('click', () => openEditModal(task.id));
  actionsWrap.appendChild(editBtn);

  // Delete Button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn btn-delete';
  deleteBtn.type = 'button';
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
  deleteBtn.title = 'Delete task';
  deleteBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  `;
  deleteBtn.addEventListener('click', () => openDeleteModal(task.id));
  actionsWrap.appendChild(deleteBtn);

  header.appendChild(actionsWrap);
  card.appendChild(header);

  // --- Body: Checkbox, Title, and Description ---
  const body = document.createElement('div');
  body.className = 'task-body';

  // Checkbox Label
  const checkboxLabel = document.createElement('label');
  checkboxLabel.className = 'custom-checkbox';
  checkboxLabel.title = task.completed ? 'Mark task as pending' : 'Mark task as completed';

  const checkboxInput = document.createElement('input');
  checkboxInput.type = 'checkbox';
  checkboxInput.checked = !!task.completed;
  checkboxInput.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`);
  checkboxInput.addEventListener('change', () => toggleTaskStatus(task.id));

  const checkboxVisual = document.createElement('span');
  checkboxVisual.className = 'checkbox-visual';
  checkboxVisual.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  checkboxLabel.appendChild(checkboxInput);
  checkboxLabel.appendChild(checkboxVisual);
  body.appendChild(checkboxLabel);

  // Content Wrap (Title & Description)
  const contentWrap = document.createElement('div');
  contentWrap.className = 'task-content';

  const titleEl = document.createElement('h4');
  titleEl.className = 'task-title';
  titleEl.textContent = task.title;
  contentWrap.appendChild(titleEl);

  if (task.description && task.description.trim()) {
    const descEl = document.createElement('p');
    descEl.className = 'task-desc';
    descEl.textContent = task.description;
    contentWrap.appendChild(descEl);
  }

  body.appendChild(contentWrap);
  card.appendChild(body);

  // --- Footer: Due Date & Metadata ---
  const footer = document.createElement('div');
  footer.className = 'task-footer';

  // Due Date Item
  const dueItem = document.createElement('div');
  dueItem.className = 'task-meta-item';
  if (taskIsOverdue) {
    dueItem.classList.add('overdue-text');
  }

  if (task.dueDate) {
    dueItem.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span>Due: ${formatDate(task.dueDate)}</span>
    `;
  } else {
    dueItem.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
      </svg>
      <span>No due date</span>
    `;
  }
  footer.appendChild(dueItem);

  // Status Indicator Text
  const statusItem = document.createElement('div');
  statusItem.className = 'task-meta-item';
  statusItem.textContent = task.completed ? 'Completed' : (taskIsOverdue ? 'Overdue' : 'Pending');
  footer.appendChild(statusItem);

  card.appendChild(footer);

  return card;
}

/* --------------------------------------------------------------------------
   9. Dark Mode Management
   -------------------------------------------------------------------------- */
/**
 * Loads saved theme or defaults to system preference
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    applyTheme(true);
  } else {
    applyTheme(false);
  }
}

/**
 * Applies dark or light mode to body and toggles label
 * @param {boolean} isDark 
 */
function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    elements.themeStatusText.textContent = 'Light';
  } else {
    document.body.classList.remove('dark-mode');
    elements.themeStatusText.textContent = 'Dark';
  }
}

/**
 * Toggles theme between dark and light, persisting in Local Storage
 */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  elements.themeStatusText.textContent = isDark ? 'Light' : 'Dark';
  showToast(`${isDark ? 'Dark' : 'Light'} mode enabled.`, 'info');
}

/* --------------------------------------------------------------------------
   10. Toast Notification System
   -------------------------------------------------------------------------- */
/**
 * Displays a non-intrusive toast notification
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 * @param {number} durationMs 
 */
function showToast(message, type = 'info', durationMs = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else if (type === 'error') {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  } else {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-message">${escapeHTML(message)}</span>
    <button class="toast-close" aria-label="Close notification" type="button">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 200);
  };

  closeBtn.addEventListener('click', removeToast);
  elements.toastContainer.appendChild(toast);

  // Auto dismiss after specified duration
  setTimeout(removeToast, durationMs);
}

/* --------------------------------------------------------------------------
   11. Event Listeners Setup
   -------------------------------------------------------------------------- */
function setupEventListeners() {
  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', toggleDarkMode);

  // Add Task Form Submit
  elements.addTaskForm.addEventListener('submit', addTask);

  // Title validation reset on input
  elements.taskTitleInput.addEventListener('input', () => {
    if (elements.taskTitleInput.value.trim()) {
      elements.taskTitleInput.classList.remove('is-invalid');
      elements.titleError.style.display = 'none';
    }
  });

  // Clear Add Form Button
  elements.clearAddFormBtn.addEventListener('click', () => {
    elements.addTaskForm.reset();
    elements.taskTitleInput.classList.remove('is-invalid');
    elements.titleError.style.display = 'none';
  });

  // Search Input (Real-time as user types)
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    if (state.searchQuery) {
      elements.clearSearchBtn.classList.add('show');
    } else {
      elements.clearSearchBtn.classList.remove('show');
    }
    renderApp();
  });

  // Clear Search Button
  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.classList.remove('show');
    renderApp();
    elements.searchInput.focus();
  });

  // Filters & Sorting Selects
  elements.filterStatus.addEventListener('change', (e) => {
    state.filterStatus = e.target.value;
    renderApp();
  });

  elements.filterCategory.addEventListener('change', (e) => {
    state.filterCategory = e.target.value;
    renderApp();
  });

  elements.filterPriority.addEventListener('change', (e) => {
    state.filterPriority = e.target.value;
    renderApp();
  });

  elements.sortTasksSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderApp();
  });

  // Reset Filters Button
  elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
  elements.emptyStateResetBtn.addEventListener('click', resetAllFilters);

  // Summary Card Interactive Shortcuts
  elements.cardTotal.addEventListener('click', () => {
    state.filterStatus = 'all';
    elements.filterStatus.value = 'all';
    renderApp();
  });

  elements.cardCompleted.addEventListener('click', () => {
    state.filterStatus = 'completed';
    elements.filterStatus.value = 'completed';
    renderApp();
  });

  elements.cardPending.addEventListener('click', () => {
    state.filterStatus = 'pending';
    elements.filterStatus.value = 'pending';
    renderApp();
  });

  elements.cardOverdue.addEventListener('click', () => {
    state.filterStatus = 'overdue';
    elements.filterStatus.value = 'overdue';
    renderApp();
  });

  // Edit Modal Events
  elements.editTaskForm.addEventListener('submit', saveEditTask);
  elements.closeEditModalBtn.addEventListener('click', closeEditModal);
  elements.cancelEditModalBtn.addEventListener('click', closeEditModal);

  elements.editTaskTitle.addEventListener('input', () => {
    if (elements.editTaskTitle.value.trim()) {
      elements.editTaskTitle.classList.remove('is-invalid');
      elements.editTitleError.style.display = 'none';
    }
  });

  // Delete Modal Events
  elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener('click', confirmDeleteTask);

  // Close modals on clicking overlay backdrop
  elements.editModal.addEventListener('click', (e) => {
    if (e.target === elements.editModal) {
      closeEditModal();
    }
  });

  elements.deleteModal.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) {
      closeDeleteModal();
    }
  });

  // Keyboard Accessibility: Escape key closes active modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!elements.editModal.classList.contains('hidden')) {
        closeEditModal();
      }
      if (!elements.deleteModal.classList.contains('hidden')) {
        closeDeleteModal();
      }
    }
  });
}
