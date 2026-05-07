const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

// Helper: create a todo and return the response body
const createTodo = async (fields = {}) => {
  const payload = { title: 'Test Todo', ...fields };
  const response = await request(app)
    .post('/api/todos')
    .send(payload)
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

// Clean up all todos between tests that create data
afterEach(() => {
  db.prepare('DELETE FROM todos').run();
});

describe('GET /', () => {
  it('should return health check', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

describe('GET /api/todos', () => {
  it('should return an empty array when no todos exist', async () => {
    const response = await request(app).get('/api/todos');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it('should return todos with the expected fields', async () => {
    await createTodo({ title: 'Field check todo' });
    const response = await request(app).get('/api/todos');
    expect(response.status).toBe(200);
    const todo = response.body[0];
    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('title');
    expect(todo).toHaveProperty('description');
    expect(todo).toHaveProperty('due_date');
    expect(todo).toHaveProperty('priority');
    expect(todo).toHaveProperty('completed');
    expect(todo).toHaveProperty('created_at');
  });
});

describe('POST /api/todos', () => {
  it('should create a new todo with only a title', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: 'Buy milk' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Buy milk');
    expect(response.body.completed).toBe(0);
    expect(response.body.priority).toBe('medium');
  });

  it('should create a todo with all optional fields', async () => {
    const payload = {
      title: 'Write tests',
      description: 'Cover all edge cases',
      due_date: '2026-12-31',
      priority: 'high',
    };
    const response = await request(app)
      .post('/api/todos')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Write tests');
    expect(response.body.description).toBe('Cover all edge cases');
    expect(response.body.due_date).toBe('2026-12-31');
    expect(response.body.priority).toBe('high');
  });

  it('should default priority to medium for an invalid priority value', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: 'Priority test', priority: 'urgent' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body.priority).toBe('medium');
  });

  it('should return 400 if title is missing', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({})
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 if title is blank', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: '   ' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
  });
});

describe('PUT /api/todos/:id', () => {
  it('should update a todo title', async () => {
    const todo = await createTodo({ title: 'Original title' });
    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ title: 'Updated title' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated title');
  });

  it('should mark a todo as completed', async () => {
    const todo = await createTodo({ title: 'Mark complete' });
    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ completed: true })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(1);
  });

  it('should update priority and due date', async () => {
    const todo = await createTodo({ title: 'Update fields' });
    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ priority: 'low', due_date: '2026-06-01' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.priority).toBe('low');
    expect(response.body.due_date).toBe('2026-06-01');
  });

  it('should return 404 for a non-existent todo', async () => {
    const response = await request(app)
      .put('/api/todos/99999')
      .send({ title: 'Ghost' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(404);
  });

  it('should return 400 if title is set to blank', async () => {
    const todo = await createTodo({ title: 'Original' });
    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ title: '' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
  });
});

describe('DELETE /api/todos/completed', () => {
  it('should delete all completed todos', async () => {
    const todo1 = await createTodo({ title: 'Done task' });
    await createTodo({ title: 'Active task' });

    // Mark todo1 as completed
    await request(app)
      .put(`/api/todos/${todo1.id}`)
      .send({ completed: true });

    const response = await request(app).delete('/api/todos/completed');
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);

    const remaining = await request(app).get('/api/todos');
    expect(remaining.body.length).toBe(1);
    expect(remaining.body[0].title).toBe('Active task');
  });

  it('should return count 0 when there are no completed todos', async () => {
    await createTodo({ title: 'Active task' });
    const response = await request(app).delete('/api/todos/completed');
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(0);
  });
});

describe('DELETE /api/todos/:id', () => {
  it('should delete an existing todo', async () => {
    const todo = await createTodo({ title: 'To be deleted' });
    const response = await request(app).delete(`/api/todos/${todo.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(todo.id);

    const check = await request(app).get('/api/todos');
    expect(check.body.find(t => t.id === todo.id)).toBeUndefined();
  });

  it('should return 404 for a non-existent todo', async () => {
    const response = await request(app).delete('/api/todos/99999');
    expect(response.status).toBe(404);
  });

  it('should return 400 for an invalid id', async () => {
    const response = await request(app).delete('/api/todos/abc');
    expect(response.status).toBe(400);
  });
});
