           // eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
const ar = JSON.parse(fs.readFileSync('messages/ar.json'));
const en = JSON.parse(fs.readFileSync('messages/en.json'));

function getKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((res, el) => {
    if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getKeys(obj[el], prefix + el + '.')];
    }
    return [...res, prefix + el];
  }, []);
}

const arKeys = new Set(getKeys(ar));
const enKeys = new Set(getKeys(en));

const missingInEn = [...arKeys].filter(k => !enKeys.has(k));
const missingInAr = [...enKeys].filter(k => !arKeys.has(k));

if(missingInEn.length === 0 && missingInAr.length === 0) {
  console.log('Parity: PERFECT');
} else {
  console.log('Missing in EN:');
  missingInEn.forEach(k => console.log('  ' + k));
  console.log('\nMissing in AR:');
  missingInAr.forEach(k => console.log('  ' + k));
}
