(function () {
    const tbody = document.querySelector('#usersTable tbody');
    const logout = document.getElementById('logout');
    const statusEl = document.getElementById('users-status');
  
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[m]));
    }
  
    function authHeaders() {
      const t = localStorage.getItem('token');
      return t ? { Authorization: 'Bearer ' + t } : {};
    }
  
    async function loadUsers() {
      const token = localStorage.getItem('token');
      if (!token) {
        location.href = '/login.html';
        return;
      }
      try {
        const res = await fetch('/api/auth/users', { headers: authHeaders() });
        if (res.status === 401 || res.status === 403) {
          location.href = '/login.html';
          return;
        }
        if (!res.ok) throw new Error('HTTP ' + res.status);
  
        const users = await res.json(); 
        render(users);
        statusEl.textContent = '';
      } catch (err) {
        console.error(err);
        statusEl.textContent = 'Error cargando usuarios.';
      }
    }
  
    function render(users) {
      tbody.innerHTML = '';
      if (!users || users.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="2">No hay usuarios.</td>`;
        tbody.appendChild(tr);
        return;
      }
      users.forEach((u, i) => {
        const id = u.id ?? (i + 1);
        const username = u.username ?? u.user ?? '(sin usuario)';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${id}</td><td>${escapeHtml(username)}</td>`;
        tbody.appendChild(tr);
      });

    }
  
    document.addEventListener('DOMContentLoaded', loadUsers);
    logout?.addEventListener('click', () => {
      localStorage.removeItem('token');
      location.href = '/login.html';
    });
  })();
  