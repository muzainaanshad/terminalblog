const fs = require('fs');
const p = 'credentials/gsc-service-account.json';
console.log('cred exists:', fs.existsSync(p));
try {
  const k = JSON.parse(fs.readFileSync(p, 'utf8'));
  console.log('client_email:', k.client_email);
  console.log('keys present:', !!(k.private_key && k.private_key.length > 100));
} catch (e) {
  console.log('cred parse error:', e.message);
}
try {
  require('googleapis');
  console.log('googleapis loads OK');
} catch (e) {
  console.log('googleapis load error:', e.message);
}
console.log('DONE');