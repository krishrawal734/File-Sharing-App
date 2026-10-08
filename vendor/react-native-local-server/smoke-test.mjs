// Run after installing the local fork and rebuilding on a device:
// node vendor/react-native-local-server/smoke-test.mjs 'http://192.168.1.2:8080/s/<token>/' 'example file.txt'
import assert from 'node:assert/strict';

const [capabilityUrl, fileName] = process.argv.slice(2);
if (!capabilityUrl || !fileName || !/^http:\/\/[^/]+\/s\/[0-9a-f]{48}\/$/.test(capabilityUrl)) {
  throw new Error('Expected a protected QR URL (with trailing slash) and a shared file name');
}
const base = new URL(capabilityUrl);
const host = base.origin;
const badToken = capabilityUrl.replace(/([0-9a-f])(?=\/$)/, c => c === 'a' ? 'b' : 'a');
const encodedName = encodeURIComponent(fileName);
const paths = [
  '/', '/index.html', '/files.json', `/${encodedName}`, '/api/files', '/api/dir',
  `/download/${encodedName}`, '/airdropx/', '/airdropx/connect-request',
  '/s/', '/s/garbage/files.json', '/s/%2e%2e/files.json',
  `${base.pathname}%2e%2e%2ffiles.json`, `${base.pathname}%252e%252e%252ffiles.json`,
];
for (const path of paths) {
  const response = await fetch(host + path, { redirect: 'manual' });
  assert.equal(response.status, 404, `Unexpected public response for ${path}: ${response.status}`);
}
for (const url of [`${badToken}files.json`, `${badToken}${encodedName}`]) {
  const response = await fetch(url, { redirect: 'manual' });
  assert.equal(response.status, 404, `Wrong token authorized: ${url}`);
}
const info = await fetch(host + '/airdropx/info');
assert.equal(info.status, 200, 'Discovery must remain available');
const index = await fetch(capabilityUrl);
assert.equal(index.status, 200, 'Dashboard not available at capability root');
const files = await fetch(capabilityUrl + 'files.json');
assert.equal(files.status, 200, 'Protected files.json unavailable');
const listing = await files.json();
assert.ok(listing.some(item => item.name === fileName));
const file = await fetch(capabilityUrl + encodedName);
assert.equal(file.status, 200, 'Protected file unavailable');
console.log('Protected server access checks passed. Restart server and verify the old URL also returns 404.');
