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
  app.set('view', parentApp.get('view'));
  app.set('view engine', parentApp.get('view engine'));
  app.set('views', parentApp.get('views'));
  app.set('kraken', parentApp.get('kraken'));

  if(Object.keys(parentApp.engines).length) {
    app.engines = parentApp.engines;
  }
}

const fetchNewAppFactory = (parent, modulePath, method, config) => {
  const newAppFactory = method ? require(modulePath)[method] : require(modulePath);
  const newAppArguments = config.arguments.length > 0 ? config.arguments[0] : {}
  const newApp = newAppFactory(newAppArguments);

  copySettingFromParent(newApp, parent);

  return newApp;
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

  app.use(fetchNewAppFactory(app, finalModulePath, method, config));

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
      app._router.stack.pop();
      app.use(fetchNewAppFactory(app, finalModulePath, method, config));
    }

    afterHotReloadFn && afterHotReloadFn();
  }); 

  return app;
};
