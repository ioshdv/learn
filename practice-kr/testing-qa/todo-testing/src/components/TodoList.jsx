import React, { useState } from 'react';

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  return (
    <div>
      <h1>Todo List</h1>
      <input
        placeholder="Add task"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        data-testid="task-input"
      />
      <button onClick={addTask} data-testid="add-button">Add</button>

      <div>
        <button onClick={() => setFilter('all')} data-testid="filter-all">All</button>
        <button onClick={() => setFilter('active')} data-testid="filter-active">Active</button>
        <button onClick={() => setFilter('completed')} data-testid="filter-completed">Completed</button>
      </div>

      <ul>
        {filteredTasks.map(task => (
          <li key={task.id} data-testid="task-item">
            <span
              onClick={() => toggleTask(task.id)}
              style={{ textDecoration: task.completed ? 'line-through' : 'none', cursor: 'pointer' }}
            >
              {task.text}
            </span>
            <button onClick={() => deleteTask(task.id)} data-testid="delete-button">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
