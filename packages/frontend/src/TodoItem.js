import React from 'react';
import PropTypes from 'prop-types';
import {
  Checkbox,
  Chip,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const PRIORITY_COLORS = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(todo.due_date, todo.completed);

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Stack direction="row" spacing={0}>
          <IconButton
            aria-label={`Edit "${todo.title}"`}
            onClick={() => onEdit(todo)}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Delete "${todo.title}"`}
            onClick={() => onDelete(todo.id)}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      }
      sx={{ pr: 12 }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Checkbox
          edge="start"
          checked={Boolean(todo.completed)}
          onChange={() => onToggle(todo)}
          slotProps={{ input: { 'aria-label': `Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}` } }}
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="body1"
            component="span"
            sx={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              opacity: todo.completed ? 0.5 : 1,
            }}
          >
            {todo.title}
          </Typography>
        }
        secondary={
          <Stack direction="row" spacing={1} alignItems="center" component="span" sx={{ mt: 0.5 }}>
            {todo.description && (
              <Typography variant="body2" component="span" color="text.secondary">
                {todo.description}
              </Typography>
            )}
            {todo.due_date && (
              <Typography
                variant="caption"
                component="span"
                color={overdue ? 'error.main' : 'text.secondary'}
                aria-label={`Due date: ${todo.due_date}${overdue ? ' (overdue)' : ''}`}
              >
                Due: {todo.due_date}
              </Typography>
            )}
            <Chip
              label={todo.priority}
              size="small"
              color={PRIORITY_COLORS[todo.priority] || 'default'}
              aria-label={`Priority: ${todo.priority}`}
            />
          </Stack>
        }
        disableTypography
      />
    </ListItem>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    due_date: PropTypes.string,
    priority: PropTypes.oneOf(['low', 'medium', 'high']),
    completed: PropTypes.number,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TodoItem;
