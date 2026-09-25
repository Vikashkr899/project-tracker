const { Op } = require('sequelize');
const { Task, Project, User, ActivityLog } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

async function listTasks(req, res, next) {
  try {
    const { projectId, status, assigneeId, search } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

async function getTask(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
    });
    if (!task) throw new ApiError(404, 'Task not found');
    res.json(task);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);
    if (!project) throw new ApiError(404, 'Project not found');

    const { title, description, assigneeId, deadline, priority, status, actor } = req.body;

    if (status === 'Blocked' && (!req.body.blockerReason || !req.body.blockerReportedBy)) {
      throw new ApiError(400, 'blockerReason and blockerReportedBy are required when creating a Blocked task');
    }

    const task = await Task.create({
      projectId,
      title,
      description,
      assigneeId: assigneeId || null,
      deadline,
      priority: priority || 'Medium',
      status: status || 'To Do',
      blockerReason: status === 'Blocked' ? req.body.blockerReason : null,
      blockerReportedBy: status === 'Blocked' ? req.body.blockerReportedBy : null,
      blockerReportedAt: status === 'Blocked' ? new Date() : null,
    });

    await ActivityLog.create({
      projectId,
      taskId: task.id,
      actor: actor || 'system',
      action: 'task_created',
      newStatus: task.status,
      details: `Task "${task.title}" created`,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

// General field update (title, description, assignee, deadline, priority).
// Also optimistic-locked via `version` so two editors can't silently clobber
// each other's changes.
async function updateTask(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new ApiError(404, 'Task not found');

    if (req.body.version !== undefined && Number(req.body.version) !== task.version) {
      throw new ApiError(409, 'This task was modified by someone else. Reload and try again.', {
        currentTask: task,
      });
    }

    const { title, description, assigneeId, deadline, priority, actor } = req.body;

    await task.update({
      title: title ?? task.title,
      description: description ?? task.description,
      assigneeId: assigneeId === undefined ? task.assigneeId : assigneeId,
      deadline: deadline ?? task.deadline,
      priority: priority ?? task.priority,
      version: task.version + 1,
    });

    await ActivityLog.create({
      projectId: task.projectId,
      taskId: task.id,
      actor: actor || 'system',
      action: 'task_updated',
      details: 'Task fields updated',
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
}

// Dedicated status-change endpoint. Blocking a task requires a reason,
// reporter, and is timestamped server-side. Concurrency is checked the same
// way as updateTask.
async function updateTaskStatus(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new ApiError(404, 'Task not found');

    if (req.body.version !== undefined && Number(req.body.version) !== task.version) {
      throw new ApiError(409, 'This task was modified by someone else. Reload and try again.', {
        currentTask: task,
      });
    }

    const { status, actor, blockerReason, blockerReportedBy } = req.body;
    if (!Task.STATUSES.includes(status)) {
      throw new ApiError(400, `status must be one of: ${Task.STATUSES.join(', ')}`);
    }

    const previousStatus = task.status;
    const updates = { status, version: task.version + 1 };

    if (status === 'Blocked') {
      if (!blockerReason || !blockerReportedBy) {
        throw new ApiError(400, 'blockerReason and blockerReportedBy are required to mark a task Blocked');
      }
      updates.blockerReason = blockerReason;
      updates.blockerReportedBy = blockerReportedBy;
      updates.blockerReportedAt = new Date();
    } else if (previousStatus === 'Blocked' && status !== 'Blocked') {
      // Clear blocker info once the task moves off Blocked.
      updates.blockerReason = null;
      updates.blockerReportedBy = null;
      updates.blockerReportedAt = null;
    }

    await task.update(updates);

    await ActivityLog.create({
      projectId: task.projectId,
      taskId: task.id,
      actor: actor || 'system',
      action: 'status_change',
      previousStatus,
      newStatus: status,
      details: status === 'Blocked' ? `Blocked: ${blockerReason}` : null,
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new ApiError(404, 'Task not found');
    await task.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask };
