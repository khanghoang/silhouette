require('babel-register');

const foo = require('./fooImpl');

console.log('foo: ', foo);

module.exports = foo;
