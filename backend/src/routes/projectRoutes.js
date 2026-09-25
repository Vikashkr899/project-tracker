const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { createTask, listTasks } = require('../controllers/taskController');
const Project = require('../models/Project');

const router = express.Router();

const projectValidators = [
  body('name').notEmpty().withMessage('name is required'),
  body('status').optional().isIn(Project.STATUSES).withMessage(`status must be one of: ${Project.STATUSES.join(', ')}`),
  body('deadline').optional({ nullable: true }).isISO8601().withMessage('deadline must be a valid date (YYYY-MM-DD)'),
];

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', projectValidators, validate, createProject);
router.patch('/:id', projectValidators.map((v) => v.optional()), validate, updateProject);
router.delete('/:id', deleteProject);

// Nested task routes
router.get('/:projectId/tasks', (req, res, next) => {
  req.query.projectId = req.params.projectId;
  listTasks(req, res, next);
});
router.post('/:projectId/tasks', createTask);

module.exports = router;
