class TodoPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTask(title, { description = '', dueDate = '', priority = '' } = {}) {
    await this.page.getByLabel('Task title').fill(title);
    if (description) {
      await this.page.getByLabel('Task description').fill(description);
    }
    if (dueDate) {
      await this.page.getByLabel('Due date').fill(dueDate);
    }
    if (priority) {
      await this.page.getByLabel('Priority').click();
      await this.page.getByRole('option', { name: new RegExp(priority, 'i') }).click();
    }
    await this.page.getByRole('button', { name: /add task/i }).click();
  }

  async toggleTask(title) {
    // Find the list item containing the title and click its checkbox
    const item = this.page.getByRole('listitem').filter({ hasText: title });
    await item.getByRole('checkbox').click();
  }

  async deleteTask(title) {
    await this.page.getByLabel(new RegExp(`Delete "${title}"`, 'i')).click();
  }

  async openEditDialog(title) {
    await this.page.getByLabel(new RegExp(`Edit "${title}"`, 'i')).click();
  }

  async saveEdit(newTitle) {
    await this.page.getByLabel('Edit task title').fill(newTitle);
    await this.page.getByRole('button', { name: /save/i }).click();
  }

  async setFilter(filter) {
    await this.page.getByRole('button', { name: new RegExp(`show ${filter} tasks`, 'i') }).click();
  }

  async clearCompleted() {
    await this.page.getByRole('button', { name: /clear all completed tasks/i }).click();
  }

  async getTaskTitles() {
    return this.page.getByRole('list', { name: /todos/i })
      .getByRole('listitem')
      .allInnerTexts();
  }

  async waitForTask(title) {
    await this.page.getByText(title).waitFor();
  }

  async waitForTaskGone(title) {
    await this.page.getByText(title).waitFor({ state: 'hidden' });
  }
}

module.exports = { TodoPage };
