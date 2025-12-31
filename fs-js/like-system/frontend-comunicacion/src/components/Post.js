import React from "react";

/**
 * REQUERIMIENTO: Componente funcional para representar cada publicación.
 * Recibe 'post' con los datos, 'onLike' como acción y 'loading' para el estado visual.
 */
const Post = ({ post, onLike, loading }) => {
  return (
    <div className="post-card" style={{ 
      border: "1px solid #ddd", 
      padding: "15px", 
      margin: "10px 0", 
      borderRadius: "8px",
      backgroundColor: loading ? "#f9f9f9" : "#fff"
    }}>
      <h3 style={{ margin: "0 0 10px 0" }}>{post.title}</h3>
      <p style={{ fontSize: "1.1rem" }}>
        Likes: <strong id={`likes-count-${post.id}`}>{post.likes}</strong>
      </p>
      
      {/* REQUERIMIENTO: Mostrar indicador visual durante la petición */}
      <button
        className="like-button"
        onClick={() => onLike(post.id)}
        disabled={loading}
        style={{
          padding: "8px 16px",
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          transition: "background-color 0.2s"
        }}
      >
        {loading ? "⌛ Procesando..." : "👍 Like"}
      </button>
    </div>
  );
};

export default Post;