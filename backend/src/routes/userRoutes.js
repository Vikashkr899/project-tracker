const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { listUsers, createUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', listUsers);
router.post(
  '/',
  [body('name').notEmpty().withMessage('name is required'), body('email').isEmail().withMessage('valid email is required')],
  validate,
  createUser
);

module.exports = router;
