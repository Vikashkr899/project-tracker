const { ActivityLog, Task, Project } = require('../models');

async function listActivity(req, res, next) {
  try {
    const { projectId, taskId } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;

    const logs = await ActivityLog.findAll({
      where,
      include: [
        { model: Task, as: 'task', attributes: ['id', 'title'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 200,
    });

    res.json(logs);
  } catch (err) {
    next(err);
  }
}

module.exports = { listActivity };
