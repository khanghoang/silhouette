const express = require('express');
const path = require('path');
const clearModule = require('./clearModule');

const { start } = require('./hot'); 

const getFinalPath = (modulePath) => {
  return modulePath.startsWith('.') ?
    path.join(process.cwd(), modulePath)
    : modulePath;
}

module.exports = (config) => {
  let cachedModules = {};

  const { name: module, disableAutoHotReload, route, directory, method, beforeHotReload, afterHotReload } = config;

  const finalModulePath = getFinalPath(module);

  const app = express();

  let settings; let kraken;

  app.on('mount', parent => {
    // $FlowFixMe
    app.settings = Object.create(parent.settings);
    // $FlowFixMe
    app.kraken = parent.kraken;

    settings = Object.assign({}, parent.settings);
    kraken = parent.kraken;
  });

  app.use((req, res, next) => {
    const newAppFactory = method ? require(finalModulePath)[method] : require(finalModulePath);
    const newAppArgument = config.arguments.length > 0 ? config.arguments[0] : {}
    const newApp = newAppFactory(newAppArgument);
    newApp.settings = settings;
    newApp.kraken = kraken;
    newApp(req, res, next);
  });

  start(directory, () => {

    let beforeHotReloadFn, afterHotReloadFn, onStart;
    if (beforeHotReload) {
      beforeHotReloadFn = require(getFinalPath(beforeHotReload));
    }
    if (afterHotReload) {
      afterHotReloadFn = require(getFinalPath(afterHotReload));
    }

    beforeHotReloadFn && beforeHotReloadFn();

    if (!disableAutoHotReload) {
      clearModule(finalModulePath, cachedModules);
    }

    // reload the module
    if (!disableAutoHotReload) {
      require(finalModulePath);
    }

    afterHotReloadFn && afterHotReloadFn();
  }); 

  return app;
};
