document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('dashboard.html')) return;
    
    // Task modal
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const closeTaskModal = taskModal.querySelector('.close');
    
    addTaskBtn.addEventListener('click', () => {
        const selectedProjectId = localStorage.getItem('selectedProjectId');
        if (!selectedProjectId) {
            alert('Please select a project first');
            return;
        }
        
        document.getElementById('taskModalTitle').textContent = 'Add New Task';
        taskModal.style.display = 'block';
        taskForm.reset();
        document.getElementById('taskId').value = '';
        document.getElementById('taskAssignedOn').valueAsDate = new Date();
    });
    
    closeTaskModal.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            taskModal.style.display = 'none';
        }
    });
    
    // Task form submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedProjectId = localStorage.getItem('selectedProjectId');
        if (!selectedProjectId) {
            alert('No project selected');
            return;
        }
        
        const taskId = document.getElementById('taskId').value;
        const taskName = document.getElementById('taskName').value;
        const taskTeam = document.getElementById('taskTeam').value;
        const taskManager = document.getElementById('taskManager').value;
        const taskAssignedTo = document.getElementById('taskAssignedTo').value;
        const taskAssignedOn = document.getElementById('taskAssignedOn').value;
        const taskDeadline = document.getElementById('taskDeadline').value;
        const taskPriority = document.getElementById('taskPriority').value;
        const taskStatus = document.getElementById('taskStatus').value;
        
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        if (taskId) {
            // Update existing task
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    name: taskName,
                    team: taskTeam,
                    manager: taskManager,
                    assignedTo: taskAssignedTo,
                    assignedOn: taskAssignedOn,
                    deadline: taskDeadline,
                    priority: taskPriority,
                    status: taskStatus
                };
            }
        } else {
            // Create new task
            const newTask = {
                id: Date.now().toString(),
                projectId: selectedProjectId,
                name: taskName,
                team: taskTeam,
                manager: taskManager,
                assignedTo: taskAssignedTo,
                assignedOn: taskAssignedOn,
                deadline: taskDeadline,
                priority: taskPriority,
                status: taskStatus,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
        }
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasksForProject(selectedProjectId);
        taskModal.style.display = 'none';
        taskForm.reset();
    });
});

function editTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    document.getElementById('taskModalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskTeam').value = task.team;
    document.getElementById('taskManager').value = task.manager;
    document.getElementById('taskAssignedTo').value = task.assignedTo;
    document.getElementById('taskAssignedOn').value = task.assignedOn;
    document.getElementById('taskDeadline').value = task.deadline;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskStatus').value = task.status;
    
    document.getElementById('taskModal').style.display = 'block';
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    const selectedProjectId = localStorage.getItem('selectedProjectId');
    if (selectedProjectId) {
        loadTasksForProject(selectedProjectId);
    }
}

function loadTasksForProject(projectId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    
    renderTasksList(projectTasks);
}

function renderTasksList(tasks) {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<tr><td colspan="9">No tasks found for this project</td></tr>';
        return;
    }
    
    tasks.forEach(task => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${task.name}</td>
            <td>${task.assignedTo}</td>
            <td>${task.team}</td>
            <td>${task.manager}</td>
            <td>${formatDate(task.assignedOn)}</td>
            <td>${formatDate(task.deadline)}</td>
            <td class="priority-${task.priority}">${capitalizeFirstLetter(task.priority)}</td>
            <td><span class="status-badge status-${task.status.replace(' ', '-')}">${capitalizeFirstLetter(task.status)}</span></td>
            <td>
                <button class="btn btn-small edit-task" data-task-id="${task.id}">Edit</button>
                <button class="btn btn-small btn-danger delete-task" data-task-id="${task.id}">Delete</button>
            </td>
        `;
        
        tasksList.appendChild(tr);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-task').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            editTask(taskId);
        });
    });
    
    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            deleteTask(taskId);
        });
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}