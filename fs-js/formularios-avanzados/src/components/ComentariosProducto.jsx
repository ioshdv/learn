import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const ComentariosProducto = ({ productoId }) => {
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    const comentario = {
      id: Date.now(),
      texto: nuevoComentario,
      autor: user.email,
      fecha: new Date().toLocaleDateString()
    };

    setComentarios([...comentarios, comentario]);
    setNuevoComentario("");
  };

  return (
    <div className="comentarios-section" style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
      <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Comentarios</h4>
      
      {comentarios.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: '#666' }}>No hay comentarios aún.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {comentarios.map((c) => (
            <li key={c.id} style={{ fontSize: '0.85rem', marginBottom: '8px', borderBottom: '1px solid #eee' }}>
              <strong>{c.autor}:</strong> {c.texto} <br />
              <small style={{ color: '#999' }}>{c.fecha}</small>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
        <input 
          type="text" 
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder="Escribe un comentario..."
          style={{ flex: 1, padding: '5px', fontSize: '0.8rem' }}
        />
        <button type="submit" style={{ padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>
          Enviar
        </button>
      </form>
    </div>
  );
};