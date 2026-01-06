import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from './TodoList';

describe('TodoList Component', () => {
  test('renders input and buttons', () => {
    render(<TodoList />);
    expect(screen.getByTestId('task-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByTestId('filter-all')).toBeInTheDocument();
  });

  test('can add a task', async () => {
    render(<TodoList />);
    const input = screen.getByTestId('task-input');
    const addBtn = screen.getByTestId('add-button');

    await userEvent.type(input, 'Test Task');
    await userEvent.click(addBtn);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('can toggle task completion', async () => {
    render(<TodoList />);
    const input = screen.getByTestId('task-input');
    const addBtn = screen.getByTestId('add-button');

    await userEvent.type(input, 'Task 1');
    await userEvent.click(addBtn);

    const task = screen.getByText('Task 1');
    expect(task).toHaveStyle('text-decoration: none');

    await userEvent.click(task);
    expect(task).toHaveStyle('text-decoration: line-through');
  });

  test('can delete a task', async () => {
    render(<TodoList />);
    const input = screen.getByTestId('task-input');
    const addBtn = screen.getByTestId('add-button');

    await userEvent.type(input, 'Task to delete');
    await userEvent.click(addBtn);

    const deleteBtn = screen.getByTestId('delete-button');
    await userEvent.click(deleteBtn);

    expect(screen.queryByText('Task to delete')).not.toBeInTheDocument();
  });

  test('filters tasks by status', async () => {
    render(<TodoList />);
    const input = screen.getByTestId('task-input');
    const addBtn = screen.getByTestId('add-button');

    // Agregar tareas
    await userEvent.type(input, 'Active Task');
    await userEvent.click(addBtn);

    await userEvent.type(input, 'Completed Task');
    await userEvent.click(addBtn);

    // Marcar la segunda tarea como completada
    const tasks = screen.getAllByTestId('task-item');
    const completedTask = tasks.find(li => li.textContent.includes('Completed Task')).querySelector('span');
    await userEvent.click(completedTask);

    // Filtro completadas
    await userEvent.click(screen.getByTestId('filter-completed'));
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
    expect(screen.queryByText('Active Task')).not.toBeInTheDocument();

    // Filtro activas
    await userEvent.click(screen.getByTestId('filter-active'));
    expect(screen.getByText('Active Task')).toBeInTheDocument();
    expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();

    // Filtro todas
    await userEvent.click(screen.getByTestId('filter-all'));
    expect(screen.getByText('Active Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });
});
