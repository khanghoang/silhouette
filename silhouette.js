const express = require('express');
const path = require('path');

const { start } = require('./hot');

module.exports = (config) => {
  const { module, route, directory } = config[Object.keys(config)[0]];

  const finalModulePath = module.startsWith('.') ?
    path.join(process.cwd(), module)
    : module;

  const app = express();
  if (route) {
    app.use(route, (req, res, next) => {
      const newApp = require(finalModulePath)();
      newApp(req, res, next);
    });
  } else {
    app.use((req, res, next) => {
      const newApp = require(finalModulePath)();
      newApp(req, res, next);
    });
  }

  start(directory, () => {
    delete require.cache[require.resolve(finalModulePath)];
  });

  return app;
};

