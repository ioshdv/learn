document.addEventListener('DOMContentLoaded', () => {
  const id = window.location.pathname.split('/').pop();

  fetch(`/api/productos/${id}`)
    .then(res => res.json())
    .then(p => {
      document.getElementById('nombre-producto').textContent = p.nombre;
      document.getElementById('descripcion-producto').textContent = p.descripcion || '';
      document.getElementById('precio-producto').textContent = p.precio;
      document.getElementById('categoria-producto').textContent = p.categoria;
    });

  fetch(`/api/productos/${id}/comentarios`)
    .then(res => res.json())
    .then(comentarios => {
      const ul = document.getElementById('comentarios-list');
      comentarios.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.texto} (${new Date(c.fecha).toLocaleDateString('es-ES')})`;
        ul.appendChild(li);
      });
    });
});
