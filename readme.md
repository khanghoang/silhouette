# silhouette

Hot Reloading Middleware

## Dependencies

- Express
- Chokidar

## Usage

```
const silhouette = require('silhouette');
const hotReloadServer = silhouette({
  name: // path to module,
  disableAutoHotReload: // disable auto hot reload
  route: // UNUSED
  directory: // Directory above hot reloaded module,
  method: // null if entire module needs to be re-invoked or the name of specific
  // function that needs to be reloaded.
  beforeHotReload: // module that will be loaded and run before hot reload
  afterHotReload: // module that will be loaded and run after hot reload
});
```

## License

MIT
