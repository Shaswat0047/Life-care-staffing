let token = '';
let originalContent = null;

const loginBox = document.getElementById('login-box');
const editorBox = document.getElementById('editor-box');
const statusEl = document.getElementById('status');
const fieldsContainer = document.getElementById('fields-container');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#b42318' : '';
}

function parsePath(path) {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((p) => (/^\d+$/.test(p) ? Number(p) : p));
}

function setByPath(target, path, value) {
  const keys = parsePath(path);
  let cursor = target;

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    if (cursor[key] === undefined) {
      cursor[key] = typeof nextKey === 'number' ? [] : {};
    }
    cursor = cursor[key];
  }

  cursor[keys[keys.length - 1]] = value;
}

function prettify(path) {
  return path
    .replace(/\[(\d+)\]/g, ' $1')
    .replace(/\./g, ' › ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

function createField(path, value) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-item';

  const label = document.createElement('label');
  label.textContent = prettify(path);
  label.htmlFor = `field-${path}`;
  wrapper.appendChild(label);

  let input;
  if (typeof value === 'boolean') {
    input = document.createElement('select');
    const t = document.createElement('option');
    t.value = 'true';
    t.textContent = 'true';
    const f = document.createElement('option');
    f.value = 'false';
    f.textContent = 'false';
    input.appendChild(t);
    input.appendChild(f);
    input.value = String(value);
  } else if (typeof value === 'string' && value.length > 120) {
    input = document.createElement('textarea');
    input.value = value;
  } else {
    input = document.createElement('input');
    input.type = typeof value === 'number' ? 'number' : 'text';
    input.value = value ?? '';
  }

  input.id = `field-${path}`;
  input.dataset.path = path;
  input.dataset.type = typeof value;
  wrapper.appendChild(input);

  return wrapper;
}

function buildFields(node, basePath = '') {
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => buildFields(item, `${basePath}[${i}]`));
  }

  if (node !== null && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) => {
      const nextPath = basePath ? `${basePath}.${key}` : key;
      return buildFields(value, nextPath);
    });
  }

  return [createField(basePath, node)];
}

function renderFields(content) {
  fieldsContainer.innerHTML = '';
  const fields = buildFields(content);
  fields.forEach((field) => fieldsContainer.appendChild(field));
}

function collectPayload() {
  const payload = {};
  document.querySelectorAll('[data-path]').forEach((input) => {
    let value = input.value;
    const type = input.dataset.type;

    if (type === 'boolean') value = value === 'true';
    if (type === 'number') value = Number(value);

    setByPath(payload, input.dataset.path, value);
  });
  return payload;
}

document.getElementById('login-btn').addEventListener('click', async () => {
  const password = document.getElementById('admin-password').value;
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  if (!res.ok) {
    setStatus('Login failed.', true);
    return;
  }

  const data = await res.json();
  token = data.token;

  const contentRes = await fetch('/api/content');
  originalContent = await contentRes.json();
  renderFields(originalContent);

  loginBox.classList.add('hidden');
  editorBox.classList.remove('hidden');
  setStatus('Login successful.');
});

document.getElementById('save-btn').addEventListener('click', async () => {
  const payload = collectPayload();

  const res = await fetch('/api/admin/content', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  setStatus(res.ok ? 'Saved successfully.' : 'Failed to save.', !res.ok);
});
