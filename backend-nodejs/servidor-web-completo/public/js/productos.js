fetch('/api/productos')
  .then(res => res.json())
  .then(data => {
    const ul = document.getElementById('productos-list');
    data.productos.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.nombre} - $${p.precio} - Categoría: ${p.categoria}`;
      ul.appendChild(li);
    });
  });
