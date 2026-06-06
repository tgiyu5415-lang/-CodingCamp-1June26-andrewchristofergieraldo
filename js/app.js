let tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [];
let quickLinks = JSON.parse(localStorage.getItem('dashboard_links')) || [
    { id: 1, name: 'google', url: 'https://google.com' },
    { id: 2, name: 'gmail', url: 'https://gmail.com' }
];
let currentTheme = localStorage.getItem('dashboard_theme') || 'light';
let customName = localStorage.getItem('dashboard_name') || 'captain';

const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const greetingTextEl = document.getElementById('greetingText');
const customNameInput = document.getElementById('customNameInput');
const themeToggleBtn = document.getElementById('themeToggleBtn');

const timerDisplay = document.getElementById('timerDisplay');
const startTimerBtn = document.getElementById('startTimerBtn');
const stopTimerBtn = document.getElementById('stopTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const sortTasksSelect = document.getElementById('sortTasksSelect');

const linkForm = document.getElementById('linkForm');
const linkNameInput = document.getElementById('linkNameInput');
const linkUrlInput = document.getElementById('linkUrlInput');
const linksContainer = document.getElementById('linksContainer');

function updateClockAndGreeting() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
    
    const currentHour = now.getHours();
    let greeting = 'good night';
    if (currentHour >= 5 && currentHour < 12) {
        greeting = 'good morning';
    } else if (currentHour >= 12 && currentHour < 17) {
        greeting = 'good afternoon';
    } else if (currentHour >= 17 && currentHour < 21) {
        greeting = 'good evening';
    }
    greetingTextEl.textContent = greeting;
}
setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();

customNameInput.value = customName;
customNameInput.addEventListener('input', (e) => {
    localStorage.setItem('dashboard_name', e.target.value);
});

document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeButtonUI();

themeToggleBtn.addEventListener('click', () => {
    currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('dashboard_theme', currentTheme);
    updateThemeButtonUI();
});

function updateThemeButtonUI() {
    themeToggleBtn.textContent = currentTheme === 'light' ? '🌙 dark mode' : '☀️ light mode';
}

let timerInterval = null;
let timeLeft = 25 * 60;

function updateTimerDisplay() {
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
}

startTimerBtn.addEventListener('click', () => {
    if (timerInterval !== null) return;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            alert('focus time is up! take a short break, dear.');
            timeLeft = 25 * 60;
            updateTimerDisplay();
        }
    }, 1000);
});

stopTimerBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
});

resetTimerBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimerDisplay();
});
updateTimerDisplay();

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const isDuplicate = tasks.some(t => t.text.toLowerCase() === taskText.toLowerCase());
    if (isDuplicate) {
        alert('this task already exists, ayang!');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);
    saveAndRenderTasks();
    taskInput.value = '';
});

function saveAndRenderTasks() {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
    
    let processedTasks = [...tasks];
    const sortBy = sortTasksSelect.value;

    if (sortBy === 'alpha') {
        processedTasks.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortBy === 'completed') {
        processedTasks.sort((a, b) => b.completed - a.completed);
    }

    taskList.innerHTML = '';
    processedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <span class="task-text ${task.completed ? 'completed' : ''}" id="text-${task.id}">${task.text}</span>
            </div>
            <div class="task-actions">
                <button class="btn-secondary btn-sm edit-btn" data-id="${task.id}">edit</button>
                <button class="btn-danger btn-sm delete-btn" data-id="${task.id}">delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

taskList.addEventListener('click', (e) => {
    const id = parseInt(e.target.getAttribute('data-id'));
    if (!id) return;

    if (e.target.type === 'checkbox') {
        tasks = tasks.map(t => t.id === id ? { ...t, completed: e.target.checked } : t);
        saveAndRenderTasks();
    } else if (e.target.classList.contains('delete-btn')) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRenderTasks();
    } else if (e.target.classList.contains('edit-btn')) {
        const targetTask = tasks.find(t => t.id === id);
        const newText = prompt('edit your task title:', targetTask.text);
        if (newText && newText.trim() !== '') {
            tasks = tasks.map(t => t.id === id ? { ...t, text: newText.trim() } : t);
            saveAndRenderTasks();
        }
    }
});

sortTasksSelect.addEventListener('change', saveAndRenderTasks);
saveAndRenderTasks();

linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim().toLowerCase();
    let url = linkUrlInput.value.trim();

    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    const newLink = { id: Date.now(), name, url };
    quickLinks.push(newLink);
    saveAndRenderLinks();
    
    linkNameInput.value = '';
    linkUrlInput.value = '';
});

function saveAndRenderLinks() {
    localStorage.setItem('dashboard_links', JSON.stringify(quickLinks));
    linksContainer.innerHTML = '';
    
    quickLinks.forEach(link => {
        const wrapper = document.createElement('div');
        wrapper.className = 'link-btn-wrapper';
        
        wrapper.innerHTML = `
            <a href="${link.url}" target="_blank" class="quick-link-btn">${link.name}</a>
            <button class="delete-link-btn" data-id="${link.id}">×</button>
        `;
        linksContainer.appendChild(wrapper);
    });
}

linksContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-link-btn')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        quickLinks = quickLinks.filter(l => l.id !== id);
        saveAndRenderLinks();
    }
});
saveAndRenderLinks();