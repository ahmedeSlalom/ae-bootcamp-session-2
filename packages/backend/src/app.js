const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    priority TEXT DEFAULT 'medium',
    completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('In-memory database initialized');

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes

app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare(
      'SELECT * FROM todos ORDER BY due_date ASC NULLS LAST, created_at ASC'
    ).all();
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { title, description, due_date, priority } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Todo title is required' });
    }

    const allowedPriorities = ['low', 'medium', 'high'];
    const resolvedPriority = allowedPriorities.includes(priority) ? priority : 'medium';

    const stmt = db.prepare(
      'INSERT INTO todos (title, description, due_date, priority) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(title.trim(), description || null, due_date || null, resolvedPriority);

    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// DELETE completed must be registered before /:id to avoid route shadowing
app.delete('/api/todos/completed', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM todos WHERE completed = 1').run();
    res.json({ message: 'Completed todos cleared', count: result.changes });
  } catch (error) {
    console.error('Error clearing completed todos:', error);
    res.status(500).json({ error: 'Failed to clear completed todos' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, description, due_date, priority, completed } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Todo title cannot be empty' });
    }

    const allowedPriorities = ['low', 'medium', 'high'];
    const resolvedTitle = title !== undefined ? title.trim() : existing.title;
    const resolvedDescription = description !== undefined ? description : existing.description;
    const resolvedDueDate = due_date !== undefined ? due_date : existing.due_date;
    const resolvedPriority =
      priority !== undefined && allowedPriorities.includes(priority)
        ? priority
        : existing.priority;
    const resolvedCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

    db.prepare(
      `UPDATE todos
       SET title = ?, description = ?, due_date = ?, priority = ?, completed = ?
       WHERE id = ?`
    ).run(resolvedTitle, resolvedDescription, resolvedDueDate, resolvedPriority, resolvedCompleted, id);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);

    if (result.changes > 0) {
      res.json({ message: 'Todo deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db };