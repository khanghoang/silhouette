const http = require('http');
const express = require('express')

const foo = {
  bar: () => {
    const app = express();
    app.get('/', (req, res) => {
      res.json({ hello: '100' })
    })
    return app;
  } 
}

module.exports = foo;
