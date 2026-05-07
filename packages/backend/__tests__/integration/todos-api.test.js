const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

afterEach(() => {
  db.prepare('DELETE FROM todos').run();
});

describe('Todos API — integration', () => {
  it('full workflow: create → list → edit → complete → clear completed', async () => {
    // 1. List starts empty
    const empty = await request(app).get('/api/todos');
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual([]);

    // 2. Create two todos
    const create1 = await request(app)
      .post('/api/todos')
      .send({ title: 'Buy groceries', priority: 'high', due_date: '2026-12-01' });
    expect(create1.status).toBe(201);
    expect(create1.body.title).toBe('Buy groceries');

    const create2 = await request(app)
      .post('/api/todos')
      .send({ title: 'Read a book', priority: 'low' });
    expect(create2.status).toBe(201);

    // 3. List returns both
    const list = await request(app).get('/api/todos');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(2);

    // 4. Edit the first todo
    const edit = await request(app)
      .put(`/api/todos/${create1.body.id}`)
      .send({ title: 'Buy groceries and cook dinner', description: 'Make pasta' });
    expect(edit.status).toBe(200);
    expect(edit.body.title).toBe('Buy groceries and cook dinner');
    expect(edit.body.description).toBe('Make pasta');

    // 5. Mark first todo as completed
    const complete = await request(app)
      .put(`/api/todos/${create1.body.id}`)
      .send({ completed: true });
    expect(complete.status).toBe(200);
    expect(complete.body.completed).toBe(1);

    // 6. Second todo is still active
    const listAfterComplete = await request(app).get('/api/todos');
    const active = listAfterComplete.body.filter(t => t.completed === 0);
    const done = listAfterComplete.body.filter(t => t.completed === 1);
    expect(active.length).toBe(1);
    expect(done.length).toBe(1);

    // 7. Clear completed
    const clear = await request(app).delete('/api/todos/completed');
    expect(clear.status).toBe(200);
    expect(clear.body.count).toBe(1);

    // 8. Only the active todo remains
    const final = await request(app).get('/api/todos');
    expect(final.body.length).toBe(1);
    expect(final.body[0].title).toBe('Read a book');
  });

  it('should sort todos by due_date ascending, nulls last', async () => {
    await request(app).post('/api/todos').send({ title: 'No date task' });
    await request(app).post('/api/todos').send({ title: 'Far future', due_date: '2027-01-01' });
    await request(app).post('/api/todos').send({ title: 'Near future', due_date: '2026-06-01' });

    const list = await request(app).get('/api/todos');
    expect(list.status).toBe(200);
    const titles = list.body.map(t => t.title);
    expect(titles.indexOf('Near future')).toBeLessThan(titles.indexOf('Far future'));
    expect(titles.indexOf('Far future')).toBeLessThan(titles.indexOf('No date task'));
  });

  it('should return 404 when editing a non-existent todo', async () => {
    const response = await request(app)
      .put('/api/todos/99999')
      .send({ title: 'Ghost' });
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting a non-existent todo', async () => {
    const response = await request(app).delete('/api/todos/99999');
    expect(response.status).toBe(404);
  });
});
