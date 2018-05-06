const path = require('path');
const chokidar = require('chokidar');

const start = (dir, fn) => {
  const watcher = chokidar.watch(dir);
  watcher.on('ready', () => {
    watcher.on('all', () => {
      console.log(`Hot-Reload ${ dir }`);
      fn();
    });
  });
}

module.exports = {
  start,
};
