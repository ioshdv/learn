const UI = {
    async init() {
        await this.cargarProductos();
        await this.cargarProveedores();
    },

    async cargarProductos() {
        const res = await fetch('/api/productos');
        const productos = await res.json();
        
        const lista = document.getElementById('lista-productos');
        lista.innerHTML = productos.map(p => `
            <tr class="${p.stock_actual <= p.stock_minimo ? 'alert-row' : ''}">
                <td><code>${p.barcode_data}</code></td>
                <td>${p.nombre}</td>
                <td>${p.stock_actual}</td>
                <td>
                    <span class="badge ${p.stock_actual <= p.stock_minimo ? 'bg-danger' : 'bg-success'}">
                        ${p.stock_actual <= p.stock_minimo ? 'BAJO STOCK' : 'OK'}
                    </span>
                </td>
            </tr>
        `).join('');

        const select = document.getElementById('productoSelect');
        select.innerHTML = productos.map(p => `
            <option value="${p.id}" data-precio="${p.precio_compra}">${p.nombre}</option>
        `).join('');
    },

    async cargarProveedores() {
        const res = await fetch('/api/proveedores');
        const proveedores = await res.json();
        const select = document.getElementById('proveedorSelect');
        select.innerHTML = proveedores.map(p => `
            <option value="${p.id}">${p.nombre}</option>
        `).join('');
    },

    async buscarPorBarcode() {
        const code = document.getElementById('barcodeInput').value;
        const res = await fetch(`/api/productos/barcode/${code}`);
        const p = await res.json();
        if(res.ok) {
            alert(`Producto: ${p.nombre}\nStock: ${p.stock_actual}\nEstado: ${p.stock_actual <= p.stock_minimo ? 'REORDEN' : 'NORMAL'}`);
        } else {
            alert("No encontrado");
        }
    },

    async crearOrden(e) {
        e.preventDefault();
        const prod = document.getElementById('productoSelect');
        const payload = {
            proveedor_id: document.getElementById('proveedorSelect').value,
            items: [{
                producto_id: prod.value,
                cantidad: document.getElementById('orderQty').value,
                precio: prod.options[prod.selectedIndex].dataset.precio
            }]
        };

        const res = await fetch('/api/ordenes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.success) alert(`Orden Exitosa: ${data.orden}`);
    },

    async sincronizarERP() {
        const res = await fetch('/api/v1/external/inventory-sync');
        const data = await res.json();
        document.getElementById('erpOutput').innerText = JSON.stringify(data, null, 2);
    }
};

document.addEventListener('DOMContentLoaded', () => UI.init());