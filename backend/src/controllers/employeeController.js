const { Employee, ProjectDeveloper, Project } = require('../models');
const { validationResult } = require('express-validator');

// List all employees
exports.listEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      order: [['name', 'ASC']],
    });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single employee
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ association: 'projects', through: { attributes: [] } }],
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, position, department, phone, joinDate, status } = req.body;
    const employee = await Employee.create({
      name,
      email,
      position,
      department,
      phone,
      joinDate,
      status: status || 'Active',
    });
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const { name, email, position, department, phone, joinDate, status } = req.body;
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (position) employee.position = position;
    if (department) employee.department = department;
    if (phone) employee.phone = phone;
    if (joinDate) employee.joinDate = joinDate;
    if (status) employee.status = status;

    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await employee.destroy();
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign employee to project
exports.assignToProject = async (req, res) => {
  try {
    const { projectId, employeeId, role } = req.body;

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const employee = await Employee.findByPk(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const existing = await ProjectDeveloper.findOne({
      where: { projectId, employeeId },
    });
    if (existing) return res.status(400).json({ message: 'Employee already assigned to this project' });

    const assignment = await ProjectDeveloper.create({
      projectId,
      employeeId,
      role: role || 'Developer',
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove employee from project
exports.removeFromProject = async (req, res) => {
  try {
    const { projectId, employeeId } = req.body;

    const assignment = await ProjectDeveloper.findOne({
      where: { projectId, employeeId },
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    await assignment.destroy();
    res.json({ message: 'Employee removed from project' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get project developers
exports.getProjectDevelopers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const developers = await ProjectDeveloper.findAll({
      where: { projectId },
      include: [{ model: Employee, attributes: ['id', 'name', 'email', 'position'] }],
    });
    res.json(developers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
