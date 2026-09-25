const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const Task = require('../models/Task');
const {
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', listTasks);
router.get('/:id', getTask);

router.patch(
  '/:id',
  [
    body('priority').optional().isIn(Task.PRIORITIES).withMessage(`priority must be one of: ${Task.PRIORITIES.join(', ')}`),
    body('deadline').optional({ nullable: true }).isISO8601().withMessage('deadline must be a valid date (YYYY-MM-DD)'),
  ],
  validate,
  updateTask
);

router.patch(
  '/:id/status',
  [body('status').isIn(Task.STATUSES).withMessage(`status must be one of: ${Task.STATUSES.join(', ')}`)],
  validate,
  updateTaskStatus
);

router.delete('/:id', deleteTask);

module.exports = router;
