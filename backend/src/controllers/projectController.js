const { Op } = require('sequelize');
const { Project, Task, User, ActivityLog } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

// Completion percentage = completed tasks / total tasks * 100, rounded to the
// nearest whole number. A project with zero tasks is reported as 0%, not NaN.
function withTaskStats(project) {
  const plain = project.toJSON();
  const tasks = plain.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Done').length;
  const blocked = tasks.filter((t) => t.status === 'Blocked').length;
  const pending = total - completed - blocked;
  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    ...plain,
    taskStats: { total, completed, pending, blocked, completionPercentage },
  };
}

async function listProjects(req, res, next) {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const projects = await Project.findAll({
      where,
      include: [{ model: Task, as: 'tasks', attributes: ['id', 'status'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(projects.map(withTaskStats));
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Task,
          as: 'tasks',
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });
    if (!project) throw new ApiError(404, 'Project not found');
    res.json(withTaskStats(project));
  } catch (err) {
    next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const { name, description, deadline, status } = req.body;
    const project = await Project.create({ name, description, deadline, status });

    await ActivityLog.create({
      projectId: project.id,
      actor: req.body.actor || 'system',
      action: 'project_created',
      details: `Project "${project.name}" created`,
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) throw new ApiError(404, 'Project not found');

    // Optimistic concurrency check, same pattern as tasks: caller must send
    // back the version it last read.
    if (req.body.version !== undefined && Number(req.body.version) !== project.version) {
      throw new ApiError(409, 'This project was modified by someone else. Reload and try again.', {
        currentProject: project,
      });
    }

    const previousStatus = project.status;
    const { name, description, deadline, status, actor } = req.body;

    await project.update({
      name: name ?? project.name,
      description: description ?? project.description,
      deadline: deadline ?? project.deadline,
      status: status ?? project.status,
      version: project.version + 1,
    });

    if (status && status !== previousStatus) {
      await ActivityLog.create({
        projectId: project.id,
        actor: actor || 'system',
        action: 'project_status_change',
        previousStatus,
        newStatus: status,
      });
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) throw new ApiError(404, 'Project not found');
    await project.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject };
