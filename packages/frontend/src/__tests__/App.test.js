import React, { act } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const TODOS = [
  { id: 1, title: 'Buy milk', description: '', due_date: null, priority: 'medium', completed: 0, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 2, title: 'Write tests', description: 'Cover edge cases', due_date: '2026-01-01', priority: 'high', completed: 1, created_at: '2026-01-02T00:00:00.000Z' },
];

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(TODOS));
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    const { title } = req.body;
    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Todo title is required' }));
    }
    return res(ctx.status(201), ctx.json({
      id: 3,
      title,
      description: '',
      due_date: null,
      priority: 'medium',
      completed: 0,
      created_at: new Date().toISOString(),
    }));
  }),

  rest.put('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    const existing = TODOS.find(t => t.id === parseInt(id));
    if (!existing) return res(ctx.status(404), ctx.json({ error: 'Not found' }));
    const updates = { ...req.body };
    // Mirror real server: coerce completed boolean → integer
    if (updates.completed !== undefined) {
      updates.completed = updates.completed ? 1 : 0;
    }
    return res(ctx.status(200), ctx.json({ ...existing, ...updates }));
  }),

  // NOTE: /completed must be registered BEFORE /:id to prevent the wildcard catching it
  rest.delete('/api/todos/completed', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Completed todos cleared', count: 1 }));
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    const exists = TODOS.find(t => t.id === parseInt(id));
    if (!exists) return res(ctx.status(404), ctx.json({ error: 'Todo not found' }));
    return res(ctx.status(200), ctx.json({ message: 'Todo deleted successfully', id: parseInt(id) }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByRole('heading', { name: /to do app/i })).toBeInTheDocument();
  });

  test('loads and displays todos', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  test('shows active task count', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      // 1 active todo (Buy milk)
      expect(screen.getByText(/1 task left/i)).toBeInTheDocument();
    });
  });

  test('adds a new todo', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    const titleInput = screen.getByRole('textbox', { name: /^title/i });
    await user.type(titleInput, 'New Task');

    const addButton = screen.getByRole('button', { name: /add task/i });
    await act(async () => {
      await user.click(addButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('toggles a todo as completed', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.getByText('Buy milk')).toBeInTheDocument());

    // Target the specific todo's list item to avoid position-based fragility
    const buyMilkItem = screen.getByText('Buy milk').closest('li');
    const checkbox = within(buyMilkItem).getByRole('checkbox');
    await act(async () => {
      await user.click(checkbox);
    });

    await waitFor(() => {
      expect(screen.getByText(/0 tasks left/i)).toBeInTheDocument();
    });
  });

  test('filters to active todos', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.getByText('Buy milk')).toBeInTheDocument());

    const activeButton = screen.getByRole('button', { name: /show active tasks/i });
    await act(async () => {
      await userEvent.click(activeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
      expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
    });
  });

  test('filters to completed todos', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.getByText('Buy milk')).toBeInTheDocument());

    const completedButton = screen.getByRole('button', { name: /show completed tasks/i });
    await act(async () => {
      await userEvent.click(completedButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument();
      expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    });
  });

  test('deletes a todo', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.getByText('Buy milk')).toBeInTheDocument());

    const deleteButton = screen.getByLabelText(/Delete "Buy milk"/i);
    await act(async () => {
      await user.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    });
  });

  test('shows clear completed button when completed todos exist', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear all completed tasks/i })).toBeInTheDocument();
    });
  });

  test('clears all completed todos', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.getByText('Write tests')).toBeInTheDocument());

    const clearButton = screen.getByRole('button', { name: /clear all completed tasks/i });
    await act(async () => {
      await user.click(clearButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
    });
  });

  test('handles fetch error gracefully', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  test('shows empty state when no todos match filter', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/No tasks/i)).toBeInTheDocument();
    });
  });

  test('opens edit dialog, changes title, and saves', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.getByText('Buy milk')).toBeInTheDocument());

    const editButton = screen.getByLabelText(/Edit "Buy milk"/i);
    await act(async () => {
      await user.click(editButton);
    });

    // Dialog should be open with the existing title pre-filled
    const titleField = document.getElementById('edit-title-field');
    await waitFor(() => expect(titleField).toBeInTheDocument());
    expect(titleField).toHaveValue('Buy milk');

    await user.clear(titleField);
    await user.type(titleField, 'Buy oat milk');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Buy oat milk')).toBeInTheDocument();
      expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    });
  });

  test('shows overdue styling for a past due date on an active todo', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([
          { id: 1, title: 'Overdue task', description: '', due_date: '2020-01-01', priority: 'medium', completed: 0, created_at: '2020-01-01T00:00:00.000Z' },
        ]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.getByText('Overdue task')).toBeInTheDocument());

    const dueLabel = screen.getByLabelText(/due date:.*overdue/i);
    expect(dueLabel).toBeInTheDocument();
  });

  test('shows an error alert when adding a todo fails', async () => {
    const user = userEvent.setup();

    server.use(
      rest.post('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    const titleInput = screen.getByRole('textbox', { name: /^title/i });
    await user.type(titleInput, 'Will fail');

    const addButton = screen.getByRole('button', { name: /add task/i });
    await act(async () => {
      await user.click(addButton);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
