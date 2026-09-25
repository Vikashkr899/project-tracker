const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Projects API', () => {
  test('creates a project with valid data', async () => {
    const res = await request(app).post('/api/projects').send({
      name: 'Test Project',
      description: 'A project created in a test',
      deadline: '2026-12-31',
      status: 'Planning',
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Project');
    expect(res.body.status).toBe('Planning');
    expect(res.body.id).toBeDefined();
  });

  test('rejects a project with no name', async () => {
    const res = await request(app).post('/api/projects').send({
      description: 'Missing the required name field',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  test('rejects a project with an invalid status', async () => {
    const res = await request(app).post('/api/projects').send({
      name: 'Bad Status Project',
      status: 'Not A Real Status',
    });

    expect(res.status).toBe(400);
  });

  test('computes task completion stats on a fetched project', async () => {
    const createRes = await request(app).post('/api/projects').send({ name: 'Stats Project' });
    const projectId = createRes.body.id;

    await request(app).post(`/api/projects/${projectId}/tasks`).send({ title: 'Task A', status: 'Done' });
    await request(app).post(`/api/projects/${projectId}/tasks`).send({ title: 'Task B', status: 'To Do' });

    const res = await request(app).get(`/api/projects/${projectId}`);

    expect(res.status).toBe(200);
    expect(res.body.taskStats.total).toBe(2);
    expect(res.body.taskStats.completed).toBe(1);
    expect(res.body.taskStats.completionPercentage).toBe(50);
  });
});
