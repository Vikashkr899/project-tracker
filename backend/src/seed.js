// Seeds a handful of users, two projects, and a few tasks (including one
// Blocked task) so the app has something to show right after setup.
require('dotenv').config();
const { sequelize, User, Project, Task, ActivityLog } = require('./models');

async function seed() {
  await sequelize.sync({ force: true });

  const [alice, bob, carol] = await User.bulkCreate([
    { name: 'Alice Chen', email: 'alice@example.com' },
    { name: 'Bob Martinez', email: 'bob@example.com' },
    { name: 'Carol Singh', email: 'carol@example.com' },
  ]);

  const website = await Project.create({
    name: 'Marketing Website Revamp',
    description: 'Redesign and rebuild the public marketing site.',
    deadline: '2026-11-15',
    status: 'In Progress',
  });

  const mobile = await Project.create({
    name: 'Mobile App v2',
    description: 'Second major release of the companion mobile app.',
    deadline: '2026-12-20',
    status: 'Planning',
  });

  const tasks = await Task.bulkCreate([
    {
      projectId: website.id,
      title: 'Design new homepage',
      description: 'Create hi-fi mockups for the homepage redesign.',
      assigneeId: alice.id,
      deadline: '2026-10-01',
      priority: 'High',
      status: 'Done',
    },
    {
      projectId: website.id,
      title: 'Build pricing page',
      description: 'Implement the new pricing page from Figma.',
      assigneeId: bob.id,
      deadline: '2026-10-10',
      priority: 'Medium',
      status: 'In Progress',
    },
    {
      projectId: website.id,
      title: 'Integrate CMS',
      description: 'Hook up the headless CMS for blog content.',
      assigneeId: carol.id,
      deadline: '2026-10-20',
      priority: 'High',
      status: 'Blocked',
      blockerReason: 'Waiting on CMS vendor API credentials.',
      blockerReportedBy: 'Carol Singh',
      blockerReportedAt: new Date(),
    },
    {
      projectId: mobile.id,
      title: 'Define v2 feature scope',
      description: 'Finalize the feature list for the v2 release.',
      assigneeId: alice.id,
      deadline: '2026-11-01',
      priority: 'Medium',
      status: 'To Do',
    },
  ]);

  for (const task of tasks) {
    await ActivityLog.create({
      projectId: task.projectId,
      taskId: task.id,
      actor: 'seed-script',
      action: 'task_created',
      newStatus: task.status,
      details: `Task "${task.title}" created`,
    });
  }

  console.log('Seed complete.');
  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
