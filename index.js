const app = require('./src/app/app');
const { port } = require('./src/configs/env');

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
    console.log(`Check Health on http://localhost:${port}/api/health`)
  });
}

module.exports = app;
