// API Configuration - using DummyJSON for realistic API calls
const API_BASE = 'https://dummyjson.com';

let tasksData = [];
let selectedTasks = new Set();
let currentEditingRow = null;
let currentEditingTaskId = null;

// Supplier data to enrich API responses
const suppliers = ['Mueller GmbH', 'TechSupply AG', 'Global Parts Ltd', 'Industrie Partner', 'LogistiXX GmbH', 'SafeParts Inc', 'Premium Supplies', 'Alpine Components', 'Nordic Materials'];
const groups = ['procurement', 'performance', 'risk', 'relations'];
const responsibles = ['M. Schmidt', 'K. Fischer', 'J. Bauer', 'L. Hoffmann', 'P. Wagner', 'R. Schulz', 'E. Braun', 'A. Weber', 'T. Meyer', 'S. Klein'];

// Fetch tasks from API
async function fetchTasks() {
    console.log('[API] Fetching tasks from', API_BASE + '/todos?limit=10');
    try {
        const response = await fetch(`${API_BASE}/todos?limit=10`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log('[API] Received', data.todos.length, 'tasks');

        // Transform API data to our format
        tasksData = data.todos.map((todo, i) => ({
            id: todo.id,
            name: todo.todo,
            group: groups[i % groups.length],
            supplier: suppliers[i % suppliers.length],
            rating: (6 + Math.random() * 4).toFixed(1),
            responsible: responsibles[i % responsibles.length],
            creator: responsibles[(i + 3) % responsibles.length],
            status: todo.completed ? 'Completed' : 'Open',
            dueDate: generateDueDate(i)
        }));

        renderTasks();
    } catch (error) {
        console.error('[API] Failed to fetch tasks:', error);
        document.getElementById('tasksTableBody').innerHTML = `
            <tr><td colspan="9" style="text-align: center; padding: 40px; color: #dc2626;">
                Failed to load tasks. <button onclick="fetchTasks()" style="margin-left: 8px; padding: 4px 12px; cursor: pointer;">Retry</button>
            </td></tr>`;
    }
}

function generateDueDate(offset) {
    const date = new Date();
    date.setDate(date.getDate() + offset * 7 + Math.floor(Math.random() * 30));
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function renderTasks() {
    const tbody = document.getElementById('tasksTableBody');
    tbody.innerHTML = tasksData.map((task, index) => `
        <tr data-id="${task.id}" data-index="${index}">
            <td><input type="checkbox" class="checkbox" onchange="handleCheckbox(${index}, this.checked)"></td>
            <td>
                <div class="task-name-cell">
                    <span>${task.name}</span>
                    <button class="edit-btn" onclick="openEditModal(${index})">✏️</button>
                </div>
            </td>
            <td><span class="tag ${task.group}">${task.group.charAt(0).toUpperCase() + task.group.slice(1)}</span></td>
            <td>${task.supplier}</td>
            <td>${parseFloat(task.rating) > 8 ? `<span class="rating-highlight">${task.rating}</span>` : task.rating}</td>
            <td>${task.responsible}</td>
            <td>${task.creator}</td>
            <td><span class="status"><span class="status-dot ${task.status === 'Open' ? 'green' : 'yellow'}"></span> ${task.status}</span></td>
            <td class="${isUrgent(task.dueDate) ? 'due-date urgent' : ''}">${task.dueDate}</td>
        </tr>
    `).join('');

    selectedTasks.clear();
    updateBulkActions();
}

function isUrgent(dateStr) {
    const [day, month, year] = dateStr.split('.').map(Number);
    const dueDate = new Date(year, month - 1, day);
    const daysUntil = (dueDate - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntil < 14;
}

function handleCheckbox(index, checked) {
    if (checked) {
        selectedTasks.add(index);
    } else {
        selectedTasks.delete(index);
    }
    updateBulkActions();
}

function updateBulkActions() {
    const bulkBar = document.getElementById('bulkActions');
    const count = selectedTasks.size;
    const editButtons = document.querySelectorAll('.edit-btn');
    const tableContainer = document.querySelector('.table-container');

    if (count > 0) {
        bulkBar.classList.add('show');
        document.getElementById('selectedCount').textContent = `${count} item${count > 1 ? 's' : ''} selected`;
        editButtons.forEach(btn => btn.classList.add('hidden'));
        // INTENTIONAL BUG: Add class that shifts columns
        tableContainer.classList.add('has-selection');
    } else {
        bulkBar.classList.remove('show');
        editButtons.forEach(btn => btn.classList.remove('hidden'));
        tableContainer.classList.remove('has-selection');
    }
}

function openEditModal(index) {
    const task = tasksData[index];
    currentEditingTaskId = task.id;
    currentEditingRow = index;

    document.getElementById('editName').value = task.name;
    document.getElementById('editGroup').value = task.group;
    document.getElementById('editSupplier').value = task.supplier;
    document.getElementById('editRating').value = task.rating;
    document.getElementById('editResponsible').value = task.responsible;

    // Convert date format (DD.MM.YYYY to YYYY-MM-DD)
    if (task.dueDate && task.dueDate.includes('.')) {
        const parts = task.dueDate.split('.');
        document.getElementById('editDueDate').value = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    document.getElementById('editModal').classList.add('show');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditingRow = null;
    currentEditingTaskId = null;
}

async function saveTask() {
    if (currentEditingRow === null) return;

    const updatedTask = {
        todo: document.getElementById('editName').value,
        completed: false
    };

    console.log('[API] Updating task', currentEditingTaskId, 'with:', updatedTask);

    try {
        // Make real API call to update
        const response = await fetch(`${API_BASE}/todos/${currentEditingTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        console.log('[API] Update response:', result);

        // Update local data
        const dateValue = document.getElementById('editDueDate').value;
        let formattedDate = tasksData[currentEditingRow].dueDate;
        if (dateValue) {
            const parts = dateValue.split('-');
            formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
        }

        tasksData[currentEditingRow] = {
            ...tasksData[currentEditingRow],
            name: document.getElementById('editName').value,
            group: document.getElementById('editGroup').value,
            supplier: document.getElementById('editSupplier').value,
            rating: document.getElementById('editRating').value,
            responsible: document.getElementById('editResponsible').value,
            dueDate: formattedDate
        };

        renderTasks();
        closeModal();
    } catch (error) {
        console.error('[API] Failed to update task:', error);
        alert('Failed to save changes. Please try again.');
    }
}

async function bulkDelete() {
    if (selectedTasks.size === 0) return;

    if (confirm(`Delete ${selectedTasks.size} task(s)?`)) {
        const indices = Array.from(selectedTasks);

        // Make API calls for each deletion
        for (const index of indices) {
            const taskId = tasksData[index].id;
            console.log('[API] Deleting task', taskId);

            try {
                const response = await fetch(`${API_BASE}/todos/${taskId}`, {
                    method: 'DELETE'
                });
                console.log('[API] Delete response for task', taskId, ':', response.status);
            } catch (error) {
                console.error('[API] Failed to delete task', taskId, ':', error);
            }
        }

        // Remove from local data (reverse order to maintain indices)
        indices.sort((a, b) => b - a).forEach(index => {
            tasksData.splice(index, 1);
        });

        selectedTasks.clear();
        renderTasks();
    }
}

async function bulkExport() {
    if (selectedTasks.size === 0) return;

    const exportData = Array.from(selectedTasks).map(index => tasksData[index]);

    console.log('[API] Exporting tasks:', exportData);

    // Simulate API call for export
    try {
        const response = await fetch(`${API_BASE}/products/1`, {
            method: 'GET'
        });
        console.log('[API] Export validation response:', response.status);
    } catch (error) {
        console.error('[API] Export failed:', error);
    }

    alert(`Exported ${exportData.length} task(s) - check console for data`);
}

function filterTable(searchTerm) {
    const rows = document.querySelectorAll('#tasksTableBody tr');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// Login credentials (simple auth - not secure)
const VALID_CREDENTIALS = {
    'demo': 'demo123',
    'admin': 'admin123'
};

function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('bridgelink_auth');
    const loginOverlay = document.getElementById('login-overlay');
    if (isLoggedIn === 'true') {
        loginOverlay.classList.add('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    if (VALID_CREDENTIALS[username] && VALID_CREDENTIALS[username] === password) {
        sessionStorage.setItem('bridgelink_auth', 'true');
        sessionStorage.setItem('bridgelink_user', username);
        document.getElementById('login-overlay').classList.add('hidden');
        errorEl.textContent = '';
    } else {
        errorEl.textContent = 'Invalid username or password';
        document.getElementById('login-password').value = '';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Hide onboarding overlay
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) overlay.style.display = 'none';

    // Check if already logged in
    checkAuth();

    // Login form handler
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    fetchTasks();

    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTask();
    });

    document.querySelector('.search-input').addEventListener('input', function(e) {
        filterTable(e.target.value);
    });
});

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Expose functions to window for inline event handlers
window.fetchTasks = fetchTasks;
window.handleCheckbox = handleCheckbox;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.bulkDelete = bulkDelete;
window.bulkExport = bulkExport;
