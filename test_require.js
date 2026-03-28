
try {
  require('something');
} catch (e) {
  console.log('Caught error:', e.message);
}
console.log('Finished');
