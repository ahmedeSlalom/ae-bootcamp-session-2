import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TodoItem from './TodoItem';

const FILTERS = ['all', 'active', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];
const API_BASE = '/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add-task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  // Edit dialog state
  const [editTodo, setEditTodo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          due_date: newDueDate || undefined,
          priority: newPriority,
        }),
      });
      if (!response.ok) throw new Error('Failed to add todo');
      const created = await response.json();
      setTodos(prev => [...prev, created]);
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setNewPriority('medium');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (todo) => {
    try {
      const response = await fetch(`${API_BASE}/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      const updated = await response.json();
      setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete todo');
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditDialog = (todo) => {
    setEditTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditDueDate(todo.due_date || '');
    setEditPriority(todo.priority || 'medium');
  };

  const handleEditSave = async () => {
    if (!editTitle.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/${editTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          due_date: editDueDate || null,
          priority: editPriority,
        }),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      const updated = await response.json();
      setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      setEditTodo(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const response = await fetch(`${API_BASE}/completed`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to clear completed todos');
      setTodos(prev => prev.filter(t => !t.completed));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return Boolean(todo.completed);
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;

  return (
    <Box
      component="main"
      sx={{
        maxWidth: 600,
        mx: 'auto',
        px: 2,
        py: 4,
      }}
    >
      <header>
        <Typography variant="h4" component="h1" gutterBottom>
          To Do App
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Keep track of your tasks
        </Typography>
      </header>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Add task form */}
      <Box component="section" aria-label="Add new task" sx={{ mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Add New Task
        </Typography>
        <form onSubmit={handleAddTodo}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Description (optional)"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Due date"
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={newPriority}
                  label="Priority"
                  onChange={e => setNewPriority(e.target.value)}
                >
                  {PRIORITIES.map(p => (
                    <MenuItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              aria-label="Add task"
            >
              Add Task
            </Button>
          </Stack>
        </form>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Filter and status bar */}
      <Box component="section" aria-label="Task filters" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1}>
            {FILTERS.map(f => (
              <Button
                key={f}
                variant={filter === f ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                aria-label={`Show ${f} tasks`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {activeCount} task{activeCount !== 1 ? 's' : ''} left
          </Typography>
        </Stack>
      </Box>

      {/* Task list */}
      <Box component="section" aria-label="Task list">
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress aria-label="Loading tasks" />
          </Stack>
        ) : filteredTodos.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No {filter !== 'all' ? filter : ''} tasks.
          </Typography>
        ) : (
          <List aria-label="Todos" disablePadding>
            {filteredTodos.map((todo, index) => (
              <React.Fragment key={todo.id}>
                <TodoItem
                  todo={todo}
                  onToggle={handleToggle}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                />
                {index < filteredTodos.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Clear completed */}
      {todos.some(t => t.completed) && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleClearCompleted}
            aria-label="Clear all completed tasks"
          >
            Clear completed
          </Button>
        </Box>
      )}

      {/* Edit dialog */}
      <Dialog
        open={Boolean(editTodo)}
        onClose={() => setEditTodo(null)}
        aria-labelledby="edit-dialog-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="edit-dialog-title">Edit Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              fullWidth
            />
            <TextField
              label="Due date"
              type="date"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="edit-priority-label">Priority</InputLabel>
              <Select
                labelId="edit-priority-label"
                value={editPriority}
                label="Priority"
                onChange={e => setEditPriority(e.target.value)}
              >
                {PRIORITIES.map(p => (
                  <MenuItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTodo(null)} aria-label="Cancel edit">
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={!editTitle.trim()}
            aria-label="Save changes"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
