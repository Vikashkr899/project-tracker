const { Project, Task } = require('../models');

async function getDashboard(req, res, next) {
  try {
    const projects = await Project.findAll({ attributes: ['id', 'status'] });
    const tasks = await Task.findAll({ attributes: ['id', 'status'] });

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;
    const blockedProjects = projects.filter((p) => p.status === 'Blocked').length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Done').length;
    const blockedTasks = tasks.filter((t) => t.status === 'Blocked').length;

    res.json({
      projects: { total: totalProjects, active: activeProjects, completed: completedProjects, blocked: blockedProjects },
      tasks: { total: totalTasks, completed: completedTasks, blocked: blockedTasks },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
