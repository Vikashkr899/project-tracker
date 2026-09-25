const { User } = require('../models');

async function listUsers(req, res, next) {
  try {
    const users = await User.findAll({ order: [['name', 'ASC']] });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, createUser };
