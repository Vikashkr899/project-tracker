const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

let projectId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const res = await request(app).post('/api/projects').send({ name: 'Task Test Project' });
  projectId = res.body.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Tasks API - status changes', () => {
  test('changes a task status from To Do to In Progress', async () => {
    const createRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Implement login', status: 'To Do' });

    const taskId = createRes.body.id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: 'In Progress', actor: 'Bob' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('In Progress');
    expect(res.body.version).toBe(2);
  });

  test('rejects an invalid status value', async () => {
    const createRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Some task' });
    const taskId = createRes.body.id;

    const res = await request(app).patch(`/api/tasks/${taskId}/status`).send({ status: 'On Hold' });

    expect(res.status).toBe(400);
  });

  test('a concurrent edit with a stale version is rejected with 409', async () => {
    const createRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Concurrent edit target' });
    const taskId = createRes.body.id;
    const staleVersion = createRes.body.version; // 1

    // First editor succeeds and bumps the version to 2.
    const first = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: 'In Progress', version: staleVersion });
    expect(first.status).toBe(200);

    // Second editor still has the old version (1) and should be rejected.
    const second = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: 'Done', version: staleVersion });

    expect(second.status).toBe(409);
  });
});
