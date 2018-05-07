const express = require('express');
const path = require('path');

const { start } = require('./hot');

let cachedModules = {};

module.exports = (config) => {
  const { name: module, route, directory, method } = config;

  const finalModulePath = module.startsWith('.') ?
    path.join(process.cwd(), module)
    : module;

  const app = express();

  let settings;
  let kraken;

  app.on('mount', parent => {
    // $FlowFixMe
    app.settings = Object.create(parent.settings);
    // $FlowFixMe
    app.kraken = parent.kraken;

    settings = Object.assign({}, parent.settings);
    kraken = parent.kraken;
  });

  // TODO: idk if there is a "route" prop in meddleware config
  if (route) {
    app.use(route, (req, res, next) => {
      const newAppFactory = method ? require(finalModulePath)[method] : require(finalModulePath);
      const newAppArgument = config.arguments.length > 0 ? config.arguments[0] : {}
      const newApp = newAppFactory(newAppArgument);
      newApp.settings = settings;
      newApp.kraken = kraken
      newApp(req, res, next);
    });
  } else {
    app.use((req, res, next) => {
      const newAppFactory = method ? require(finalModulePath)[method] : require(finalModulePath);
      const newAppArgument = config.arguments.length > 0 ? config.arguments[0] : {}
      const newApp = newAppFactory(newAppArgument);
      newApp.settings = settings;
      newApp.kraken = kraken;
      newApp(req, res, next);
    });
  }

  start(directory, () => {
    const cachedModule = require.cache[require.resolve(finalModulePath)];
    cachedModules[require.resolve(finalModulePath)] = cachedModule;
    clearCachedChildrenModulesOfModule(cachedModule);
    Object.keys(cachedModules).map(moduleName => {
      delete require.cache[require.resolve(moduleName)];
    });
    cachedModules = {};
  }); 

  return app;
};

const clearCachedChildrenModulesOfModule = (module) => {
  if (module && module.children) {
    module.children.forEach((mol) => {
      if (cachedModules[mol.id]) return;
      cachedModules[require.resolve(mol.id)] = mol;
      clearCachedChildrenModulesOfModule(mol);
    });
  }
};
