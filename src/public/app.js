const API = '/api/products';

const tbody = document.querySelector('#table tbody');
const form = document.querySelector('#createForm');

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

(function guard() {
  if (!localStorage.getItem('token')) {
      location.href = 'login.html';
  }
})();

async function load() {
  const res = await fetch(API, { headers: { ...authHeaders() } });
  if (!res.ok) {
    if (res.status === 401) {
      alert('Sesión expirada o sin token.');
        location.href = 'login.html';
      return;
    }
    throw new Error('Error al cargar productos');
  }
  const data = await res.json();
  tbody.innerHTML = '';
  for (const p of data) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td contenteditable="true" data-field="name">${p.name}</td>
      <td contenteditable="true" data-field="sku">${p.sku}</td>
      <td contenteditable="true" data-field="category">${p.category}</td>
      <td contenteditable="true" data-field="price">${p.price}</td>
      <td contenteditable="true" data-field="stock">${p.stock}</td>
      <td class="actions">
        <button data-id="${p.id}" class="save">💾</button>
        <button data-id="${p.id}" class="del">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

tbody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('del')) {
    const id = e.target.dataset.id;
    await fetch(`${API}/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    load();
  } else if (e.target.classList.contains('save')) {
    const id = e.target.dataset.id;
    const tr = e.target.closest('tr');
    const payload = {};
    tr.querySelectorAll('[contenteditable][data-field]').forEach(td => {
      const field = td.dataset.field;
      payload[field] = td.textContent.trim();
    });
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    });
    load();
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  form.reset();
  load();
});

load();
