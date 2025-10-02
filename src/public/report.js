function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function main() {
  if (!localStorage.getItem('token')) location.href = 'login.html';

  const res = await fetch('/api/reports/stock/summary', { headers: { ...authHeaders() } });
  if (!res.ok) {
    if (res.status === 401) {
      alert('Sesión expirada o sin token.');
      location.href = 'login.html';
      return;
    }
    throw new Error('Error al cargar reporte');
  }
  const data = await res.json();
  const labels = Object.keys(data.byCategory);
  const values = Object.values(data.byCategory);

  const ctx = document.getElementById('chart');
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Stock por categoría', data: values }]},
    options: { responsive: false }
  });

  const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
  document.getElementById('total').textContent =
    `Valor total estimado del inventario: ${fmt.format(data.totalValue)}`;
}
main();
