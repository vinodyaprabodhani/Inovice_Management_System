const binding = require('./node_modules/@rolldown/binding-wasm32-wasi/rolldown-binding.wasi.cjs');
console.log('Successfully loaded WASI binding!');
console.log('Available binding methods:', Object.keys(binding).filter(k => typeof binding[k] === 'function'));
