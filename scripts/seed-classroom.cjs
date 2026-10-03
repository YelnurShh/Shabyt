// Seeds fictional roster entries and real assignments; never creates Auth users.
// Requires FIRESTORE_ACCESS_TOKEN and SHABYT_TEACHER_UID in the environment.
const fs = require('node:fs');
const path = require('node:path');

const project = process.env.SHABYT_FIREBASE_PROJECT || 'shabyt-a12b0';
const token = process.env.FIRESTORE_ACCESS_TOKEN;
const teacherId = process.env.SHABYT_TEACHER_UID;
const teacherName = process.env.SHABYT_TEACHER_NAME || 'Шолпан';
if (!token || !teacherId) throw new Error('FIRESTORE_ACCESS_TOKEN and SHABYT_TEACHER_UID are required.');
const base = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
const documentRoot = `projects/${project}/databases/(default)/documents`;
const roster = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/demo-students.json'), 'utf8'));
const assignments = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/seed-assignments.json'), 'utf8'));
if (roster.length !== 102 || assignments.length !== 34) throw new Error('Expected 102 roster entries and 34 assignments.');
if (new Set(roster.map(item => item.id)).size !== 102 || new Set(assignments.map(item => item.id)).size !== 34) throw new Error('Duplicate seed IDs.');

const field = value => {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  throw new Error(`Unsupported Firestore value: ${typeof value}`);
};
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`Firestore HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json();
}
async function existingIds(collection) {
  const ids = new Set();
  let pageToken;
  do {
    const params = new URLSearchParams({ pageSize: '500' });
    if (pageToken) params.set('pageToken', pageToken);
    const data = await request(`${base}/${collection}?${params}`);
    for (const document of data.documents || []) ids.add(document.name.split('/').pop());
    pageToken = data.nextPageToken;
  } while (pageToken);
  return ids;
}
async function main() {
  const [existingRoster, existingAssignments] = await Promise.all([existingIds('classRoster'), existingIds('assignments')]);
  const now = new Date().toISOString();
  const writes = [];
  for (const item of roster.filter(item => !existingRoster.has(item.id))) {
    writes.push({ update: { name: `${documentRoot}/classRoster/${item.id}`, fields: {
      name: field(item.name), className: field(item.className), demo: field(true), createdAt: { timestampValue: now },
    } }, currentDocument: { exists: false } });
  }
  for (const item of assignments.filter(item => !existingAssignments.has(item.id))) {
    const { id, ...data } = item;
    writes.push({ update: { name: `${documentRoot}/assignments/${id}`, fields: {
      ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, field(value)])),
      createdBy: field(teacherId), teacherName: field(teacherName), createdAt: { timestampValue: now },
    } }, currentDocument: { exists: false } });
  }
  if (writes.length) await request(`${base}:commit`, { method: 'POST', body: JSON.stringify({ writes }) });
  const [afterRoster, afterAssignments] = await Promise.all([existingIds('classRoster'), existingIds('assignments')]);
  const rosterPresent = roster.filter(item => afterRoster.has(item.id)).length;
  const assignmentsPresent = assignments.filter(item => afterAssignments.has(item.id)).length;
  console.log(JSON.stringify({ created: writes.length, rosterPresent, assignmentsPresent }));
  if (rosterPresent !== 102 || assignmentsPresent !== 34) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
