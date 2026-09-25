const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

let projectId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const res = await request(app).post('/api/projects').send({ name: 'Blocker Test Project' });
  projectId = res.body.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Blocker validation', () => {
  test('rejects marking a task Blocked without a reason and reporter', async () => {
    const createRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Needs blocking info' });
    const taskId = createRes.body.id;

    const res = await request(app).patch(`/api/tasks/${taskId}/status`).send({ status: 'Blocked' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/blockerReason/);
  });

  test('accepts a Blocked status with reason, reporter, and stamps a timestamp', async () => {
    const createRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Blockable task' });
    const taskId = createRes.body.id;

    const res = await request(app).patch(`/api/tasks/${taskId}/status`).send({
      status: 'Blocked',
      blockerReason: 'Waiting on third-party API access',
      blockerReportedBy: 'Carol',
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Blocked');
    expect(res.body.blockerReason).toBe('Waiting on third-party API access');
    expect(res.body.blockerReportedBy).toBe('Carol');
    expect(res.body.blockerReportedAt).not.toBeNull();
  });

  test('clears blocker fields once a task moves off Blocked', async () => {
    const createRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({
        title: 'Currently blocked',
        status: 'Blocked',
        blockerReason: 'Initial reason',
        blockerReportedBy: 'Alice',
      });
    const taskId = createRes.body.id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: 'In Progress', version: createRes.body.version });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('In Progress');
    expect(res.body.blockerReason).toBeNull();
  });
});
