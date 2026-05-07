// @ts-check
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.use({ browserName: 'chromium' });

test.beforeEach(async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.goto();
});

test('1. Add a task and see it in the list', async ({ page }) => {
  const todoPage = new TodoPage(page);

  await todoPage.addTask('Buy groceries');
  await todoPage.waitForTask('Buy groceries');

  await expect(page.getByText('Buy groceries')).toBeVisible();
});

test('2. Mark a task as complete', async ({ page }) => {
  const todoPage = new TodoPage(page);

  await todoPage.addTask('Read a book');
  await todoPage.waitForTask('Read a book');

  await todoPage.toggleTask('Read a book');

  // Completed task has strikethrough
  const taskText = page.getByText('Read a book');
  await expect(taskText).toHaveCSS('text-decoration-line', 'line-through');
});

test('3. Filter tasks by active and completed', async ({ page }) => {
  const todoPage = new TodoPage(page);

  await todoPage.addTask('Active task');
  await todoPage.waitForTask('Active task');

  await todoPage.addTask('Done task');
  await todoPage.waitForTask('Done task');

  await todoPage.toggleTask('Done task');

  // Filter to active — only active task visible
  await todoPage.setFilter('active');
  await expect(page.getByText('Active task')).toBeVisible();
  await expect(page.getByText('Done task')).not.toBeVisible();

  // Filter to completed — only done task visible
  await todoPage.setFilter('completed');
  await expect(page.getByText('Done task')).toBeVisible();
  await expect(page.getByText('Active task')).not.toBeVisible();

  // Back to all
  await todoPage.setFilter('all');
  await expect(page.getByText('Active task')).toBeVisible();
  await expect(page.getByText('Done task')).toBeVisible();
});

test('4. Edit a task title', async ({ page }) => {
  const todoPage = new TodoPage(page);

  await todoPage.addTask('Original title');
  await todoPage.waitForTask('Original title');

  await todoPage.openEditDialog('Original title');
  await todoPage.saveEdit('Updated title');

  await expect(page.getByText('Updated title')).toBeVisible();
  await expect(page.getByText('Original title')).not.toBeVisible();
});

test('5. Delete a task', async ({ page }) => {
  const todoPage = new TodoPage(page);

  await todoPage.addTask('Task to delete');
  await todoPage.waitForTask('Task to delete');

  await todoPage.deleteTask('Task to delete');
  await todoPage.waitForTaskGone('Task to delete');

  await expect(page.getByText('Task to delete')).not.toBeVisible();
});

test('6. Clear all completed tasks', async ({ page }) => {
  const todoPage = new TodoPage(page);

  await todoPage.addTask('Keep me');
  await todoPage.addTask('Delete me');
  await todoPage.waitForTask('Keep me');
  await todoPage.waitForTask('Delete me');

  await todoPage.toggleTask('Delete me');

  const clearButton = page.getByRole('button', { name: /clear all completed tasks/i });
  await expect(clearButton).toBeVisible();
  await clearButton.click();

  await expect(page.getByText('Delete me')).not.toBeVisible();
  await expect(page.getByText('Keep me')).toBeVisible();
  await expect(clearButton).not.toBeVisible();
});
