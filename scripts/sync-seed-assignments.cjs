// Updates only text and resource links of the 34 seeded assignments.
// Requires FIRESTORE_ACCESS_TOKEN and SHABYT_TEACHER_UID.
const fs = require('node:fs');
const path = require('node:path');

const project = process.env.SHABYT_FIREBASE_PROJECT || 'shabyt-a12b0';
const token = process.env.FIRESTORE_ACCESS_TOKEN;
const teacherId = process.env.SHABYT_TEACHER_UID;
if (!token || !teacherId) throw new Error('FIRESTORE_ACCESS_TOKEN and SHABYT_TEACHER_UID are required.');
const root = `projects/${project}/databases/(default)/documents`;
const base = `https://firestore.googleapis.com/v1/${root}`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const assignments = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/seed-assignments.json'), 'utf8'));
if (assignments.length !== 34 || new Set(assignments.map(item => item.id)).size !== 34) throw new Error('Expected 34 distinct seeded assignments.');
const changedFields = ['title', 'instructions', 'resourceType', 'resourceId'];

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`Firestore HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json();
}
async function documents() {
  const all = [];
  let pageToken;
  do {
    const params = new URLSearchParams({ pageSize: '500' });
    if (pageToken) params.set('pageToken', pageToken);
    const data = await request(`${base}/assignments?${params}`);
    all.push(...(data.documents || []));
    pageToken = data.nextPageToken;
  } while (pageToken);
  return new Map(all.map(item => [item.name.split('/').pop(), item]));
}
async function main() {
  const before = await documents();
  const writes = [];
  for (const item of assignments) {
    const existing = before.get(item.id);
    if (!existing || existing.fields?.createdBy?.stringValue !== teacherId) throw new Error(`Seed assignment missing or owned by another teacher: ${item.id}`);
    if (changedFields.every(key => existing.fields?.[key]?.stringValue === item[key])) continue;
    writes.push({
      update: { name: `${root}/assignments/${item.id}`, fields: Object.fromEntries(changedFields.map(key => [key, { stringValue: item[key] }])) },
      updateMask: { fieldPaths: changedFields },
      currentDocument: { updateTime: existing.updateTime },
    });
  }
  if (writes.length) await request(`${base}:commit`, { method: 'POST', body: JSON.stringify({ writes }) });
  const after = await documents();
  const verified = assignments.every(item => changedFields.every(key => after.get(item.id)?.fields?.[key]?.stringValue === item[key]));
  console.log(JSON.stringify({ updated: writes.length, verified }));
  if (!verified) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
