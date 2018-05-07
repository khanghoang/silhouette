const express = require('express');
const path = require('path');

const { start } = require('./hot');

let cachedModules = {};

module.exports = (config) => {
  const { name: module, route, directory, method } = config;

  const finalModulePath = module.startsWith('.') ?
    path.join(process.cwd(), module)
    : module;

  const newAppFactory = method ? require(finalModulePath)[method] : require(finalModulePath);
  const newAppArgument = config.arguments.length > 0 ? config.arguments[0] : {}
  const app = newAppFactory(newAppArgument);

  if (route) {
    app.use(route, (req, res, next) => {
      const newAppFactory = method ? require(finalModulePath)[method] : require(finalModulePath);
      const newAppArgument = config.arguments.length > 0 ? config.arguments[0] : {}
      const newApp = newAppFactory(newAppArgument);
      newApp(req, res, next);
    });
  } else {
    app.use((req, res, next) => {
      const newAppFactory = method ? require(finalModulePath)[method] : require(finalModulePath);
      const newAppArgument = config.arguments.length > 0 ? config.arguments[0] : {}
      const newApp = newAppFactory(newAppArgument);
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
