const clear = (module, cachedModules) => {
  if (module && module.children) {
    module.children.forEach((mol) => {
      if (cachedModules[mol.id]) return;
      cachedModules[require.resolve(mol.id)] = mol;
      try {
        clear(mol, cachedModules);
      } catch (err) {
        /* handle error */
        console.log('Hot reload cannot work because of ', err);
      }
    });
  }
};      

const clearCachedChildrenModulesOfModule = (module, cachedModules = {}) => {
  try {
    require.resolve(module);
  } catch (error) {
    /* handle error */
    return;
  }
  const cachedModule = require.cache[require.resolve(module)];
  if (!cachedModule) {
    return;
  }
  cachedModules[require.resolve(module)] = cachedModule;
  clear(cachedModule, cachedModules);

  Object.keys(cachedModules).forEach(moduleName => {
    // this will be buggy
    if (moduleName.indexOf(`${ module }`) >= 0) {
      delete require.cache[require.resolve(moduleName)];
    }

    // don't reload stuff in node_modules folder
    if (moduleName.indexOf('node_modules') >= 0) {
      return;
    }

    delete require.cache[require.resolve(moduleName)];
  });
} 

module.exports = clearCachedChildrenModulesOfModule;
