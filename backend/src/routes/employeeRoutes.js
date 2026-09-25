const express = require('express');
const { body } = require('express-validator');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

// Employee endpoints
router.get('/', employeeController.listEmployees);
router.get('/:id', employeeController.getEmployee);

router.post(
  '/',
  body('name').notEmpty().trim(),
  body('email').isEmail(),
  body('position').notEmpty().trim(),
  employeeController.createEmployee
);

router.patch('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

// Project-developer assignments
router.post('/assign', employeeController.assignToProject);
router.post('/remove', employeeController.removeFromProject);
router.get('/project/:projectId/developers', employeeController.getProjectDevelopers);

module.exports = router;
