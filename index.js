const express = require('express');
const path = require('path');
const clearModule = require('./clearModule');

const { start } = require('./hot'); 

const getFinalPath = (modulePath) => {
  return modulePath.startsWith('.') ?
    path.join(process.cwd(), modulePath)
    : modulePath;
}

const copySettingFromParent = (app, parentApp) => {
  Object.keys(parentApp).forEach(k => {
    if (parentApp[k] && !app[k]) {
      app[k] = parentApp[k];
    }
  });
}

module.exports = (config) => {
  let cachedModules = {};

  const { name: module, disableAutoHotReload, route, directory, method, beforeHotReload, afterHotReload } = config;

  const finalModulePath = getFinalPath(module);

  const app = express();

  let settings; let kraken;

  app.on('mount', parent => {
    copySettingFromParent(app, parent);
  });

  app.use((req, res, next) => {
    const newAppFactory = method ? require(finalModulePath)[method] : require(finalModulePath);
    const newAppArgument = config.arguments.length > 0 ? config.arguments[0] : {}
    const newApp = newAppFactory(newAppArgument);
    copySettingFromParent(newApp, app);
    newApp(req, res, next);
  });

  start(directory, () => {

    let beforeHotReloadFn, afterHotReloadFn;
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

    if (!disableAutoHotReload) {
      // reload the module
      require(finalModulePath);
    }

    afterHotReloadFn && afterHotReloadFn();
  }); 

  return app;
};
