let token = '';

const loginBox = document.getElementById('login-box');
const editorBox = document.getElementById('editor-box');
const statusEl = document.getElementById('status');
const editor = document.getElementById('json-editor');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#b42318' : '';
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
  const content = await contentRes.json();
  editor.value = JSON.stringify(content, null, 2);

  loginBox.classList.add('hidden');
  editorBox.classList.remove('hidden');
  setStatus('Login successful.');
});

document.getElementById('format-btn').addEventListener('click', () => {
  try {
    const parsed = JSON.parse(editor.value);
    editor.value = JSON.stringify(parsed, null, 2);
    setStatus('JSON formatted.');
  } catch {
    setStatus('Invalid JSON. Please fix before formatting.', true);
  }
});

document.getElementById('save-btn').addEventListener('click', async () => {
  let payload;
  try {
    payload = JSON.parse(editor.value);
  } catch {
    setStatus('Invalid JSON. Fix syntax before saving.', true);
    return;
  }

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
