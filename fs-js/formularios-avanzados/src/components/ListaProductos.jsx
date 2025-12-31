import React from 'react';
import { ComentariosProducto } from './ComentariosProducto';

export const ListaProductos = ({ productos, removeProducto }) => {
  return (
    <div className="lista-productos" style={{ marginTop: '30px' }}>
      <h2>Productos Registrados</h2>
      {productos.length === 0 ? (
        <p>No hay productos registrados todavía.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {productos.map((producto) => (
            <div 
              key={producto.id} 
              className={`producto-card ${producto.isPending ? 'pending' : ''}`}
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px',
                position: 'relative',
                opacity: producto.isPending ? 0.6 : 1
              }}
            >
              {producto.preview && (
                <img 
                  src={producto.preview} 
                  alt={producto.nombre} 
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} 
                />
              )}
              <h3 style={{ margin: '10px 0 5px' }}>{producto.nombre}</h3>
              <p style={{ color: '#27ae60', fontWeight: 'bold' }}>${producto.precio}</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{producto.descripcion}</p>
              
              <button 
                onClick={() => removeProducto(producto.id)}
                style={{ 
                  position: 'absolute', 
                  top: '5px', 
                  right: '5px', 
                  background: 'none', 
                  border: 'none', 
                  color: 'red', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                X
              </button>

              {/* Integración del sistema de comentarios */}
              <ComentariosProducto productoId={producto.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};