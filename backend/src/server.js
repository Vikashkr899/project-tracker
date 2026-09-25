const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    // sync() creates tables if they don't exist yet. For a real production
    // app you'd use migrations (sequelize-cli) instead; sync() is used here
    // to keep setup to a single command for the assessment.
    await sequelize.sync();
    console.log('Database connected and synced.');

    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
