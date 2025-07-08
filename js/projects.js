document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('dashboard.html')) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    // Load projects for the current user
    const userProjects = projects.filter(p => p.userId === currentUser.id);
    renderProjectsList(userProjects);
    
    // Project modal
    const projectModal = document.getElementById('projectModal');
    const projectForm = document.getElementById('projectForm');
    const createProjectBtn = document.getElementById('createProjectBtn');
    const closeProjectModal = projectModal.querySelector('.close');
    
    createProjectBtn.addEventListener('click', () => {
        projectModal.style.display = 'block';
        projectForm.reset();
    });
    
    closeProjectModal.addEventListener('click', () => {
        projectModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            projectModal.style.display = 'none';
        }
    });
    
    // Project form submission
    projectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projectName = document.getElementById('projectName').value;
        const projectDescription = document.getElementById('projectDescription').value;
        
        const newProject = {
            id: Date.now().toString(),
            userId: currentUser.id,
            name: projectName,
            description: projectDescription,
            createdAt: new Date().toISOString()
        };
        
        projects.push(newProject);
        localStorage.setItem('projects', JSON.stringify(projects));
        
        renderProjectsList(projects.filter(p => p.userId === currentUser.id));
        projectModal.style.display = 'none';
        projectForm.reset();
    });
    
    // Delete project
    document.getElementById('deleteProjectBtn').addEventListener('click', function() {
        const selectedProjectId = localStorage.getItem('selectedProjectId');
        if (!selectedProjectId) return;
        
        if (confirm('Are you sure you want to delete this project and all its tasks?')) {
            // Remove project
            projects = projects.filter(p => p.id !== selectedProjectId);
            localStorage.setItem('projects', JSON.stringify(projects));
            
            // Remove tasks associated with this project
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            tasks = tasks.filter(t => t.projectId !== selectedProjectId);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            localStorage.removeItem('selectedProjectId');
            renderProjectsList(projects.filter(p => p.userId === currentUser.id));
            document.getElementById('projectActions').style.display = 'none';
            document.getElementById('selectedProjectName').textContent = 'Select a project to view details';
            document.getElementById('tasksList').innerHTML = '';
        }
    });
});

function renderProjectsList(projects) {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<li>No projects found</li>';
        return;
    }
    
    projects.forEach(project => {
        const li = document.createElement('li');
        li.textContent = project.name;
        li.dataset.projectId = project.id;
        
        li.addEventListener('click', function() {
            // Store selected project ID
            localStorage.setItem('selectedProjectId', project.id);
            
            // Update UI
            document.getElementById('selectedProjectName').textContent = project.name;
            document.getElementById('projectActions').style.display = 'block';
            
            // Load tasks for this project
            loadTasksForProject(project.id);
        });
        
        projectsList.appendChild(li);
    });
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