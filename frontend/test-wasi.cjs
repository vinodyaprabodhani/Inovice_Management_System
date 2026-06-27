const binding = require('./node_modules/@rolldown/binding-wasm32-wasi/rolldown-binding.wasi.cjs');
const path = require('node:path');
const fs = require('node:fs');

console.log('Successfully loaded WASI binding!');

// Let's test parseSync on an absolute path
try {
  const result = binding.parseSync('C:\\xampp\\htdocs\\Invoice Management System\\frontend\\vite.config.js', 'console.log("hi");');
  console.log('Success absolute path!');
} catch (e) {
  console.error('Failed absolute path:', e);
}

// Let's test parseSync on a relative path
try {
  const result = binding.parseSync('vite.config.js', 'console.log("hi");');
  console.log('Success relative path!');
} catch (e) {
  console.error('Failed relative path:', e);
}
