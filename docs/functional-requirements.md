# Functional Requirements: TODO App

## Task Management

- The user can create a new task with a title
- The user can add an optional description to a task
- The user can edit an existing task's title and description
- The user can delete a task
- The user can mark a task as complete or incomplete

## Due Dates

- The user can add a due date to a task
- The user can edit or remove a due date from a task
- Tasks that are past their due date are visually flagged as overdue

## Organization

- Tasks are sorted by due date in ascending order (earliest first), with tasks without a due date appearing last
- The user can filter tasks by status: all, active, or completed
- The user can assign a priority level to a task (low, medium, high)
- The user can filter tasks by priority level

## Persistence

- Tasks are persisted so they are not lost on page refresh

## User Interface

- The user can see the total number of active (incomplete) tasks
- Completed tasks are visually distinguished from active tasks (e.g., strikethrough text)
- The user can clear all completed tasks at once
