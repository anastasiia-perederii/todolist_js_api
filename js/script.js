const API_URL = 'https://jsonplaceholder.typicode.com/todos';

const input = document.querySelector('#todoInput');
const addBtn = document.querySelector('#addBtn');
const list = document.querySelector('#todoList');
const filters = document.querySelectorAll('.filter');
const counter = document.querySelector('#taskCounter');
const dateInput = document.querySelector('#todoDate');

let tasks = [];
let currentFilter = 'all';

/**
 * Загрузка задач при запуске
 */
window.addEventListener('DOMContentLoaded', loadTasks);

// Добавление задачи
addBtn.addEventListener('click', handleAddTask);
input.addEventListener('keydown', e => {
  e.key === 'Enter' && handleAddTask();
});

/**
 * Фильтрация задач
 */
filters.forEach(btn =>
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  }),
);

/**
 * Загружает первые 10 задач с API при загрузке страницы.
 */
function loadTasks() {
  fetch(`${API_URL}?_limit=10`)
    .then(res => res.json())
    .then(data => {
      tasks = data.map(t => ({ id: t.id, text: t.title, completed: t.completed }));
      renderTasks();
    });
}

/**
 * Отображает задачи в DOM, учитывая выбранный фильтр (all/active/completed).
 */
function renderTasks() {
  list.innerHTML = '';

  const filtered = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('done');

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'task-content';

    const textSpan = document.createElement('span');
    textSpan.textContent = task.text;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'dueDate';
    if (task.dueDate) dateSpan.textContent = `Due: ${task.dueDate}`;

    contentWrapper.appendChild(textSpan);
    contentWrapper.appendChild(dateSpan);

    // Кнопка удаления
    const delBtn = document.createElement('button');
    delBtn.textContent = '✖';
    delBtn.className = 'deleteBtn';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    // Обработчики кликов
    li.addEventListener('click', () => toggleComplete(task.id));
    li.addEventListener('dblclick', () => editTask(task.id));

    li.appendChild(contentWrapper);
    li.appendChild(delBtn);
    list.appendChild(li);
  });

  updateCounter();
}

/**
 * Обновляет счётчик оставшихся незавершённых задач.
 */
function updateCounter() {
  const count = tasks.filter(t => !t.completed).length;
  counter.textContent = `Remaining tasks: ${count}`;
}

/**
 * Переключает статус выполнения задачи (completed <-> not completed).
 * @param {number} id - ID задачи
 */
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;

  fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed: task.completed }),
    headers: { 'Content-type': 'application/json; charset=utf-8' },
  }).then(() => renderTasks());
}

/**
 * Удаляет задачу по ID.
 * @param {number} id - ID задачи
 */
function deleteTask(id) {
  fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(() => {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
  });
}

/**
 * Открывает prompt для редактирования текста задачи.
 * @param {number} id - ID задачи
 */
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newText = prompt('Edit task:', task.text);
  if (newText === null || !newText.trim()) return;

  fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: newText }),
    headers: { 'Content-type': 'application/json; charset=utf-8' },
  }).then(() => {
    task.text = newText.trim();
    renderTasks();
  });
}

/**
 * Обрабатывает добавление новой задачи из input поля.
 */
function handleAddTask() {
  const text = input.value.trim();
  const date = dateInput.value;
  if (!text) return;

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ title: text, completed: false }),
    headers: { 'Content-type': 'application/json; charset=utf-8' },
  })
    .then(res => res.json())
    .then(newTask => {
      tasks.unshift({
        id: newTask.id,
        text: newTask.title,
        completed: false, // <--- Явно указываем
        dueDate: date,
      });
      input.value = '';
      dateInput.value = '';
      renderTasks();
    });
}


