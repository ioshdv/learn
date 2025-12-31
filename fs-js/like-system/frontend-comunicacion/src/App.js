import React, { useEffect, useState } from "react";
import "./App.css"; 
import { fetchPosts, likePost } from "./services/postService";
import { useHttp } from "./hooks/useHttp";
import Post from "./components/Post";
import ContactForm from "./components/ContactForm";

function App() {
  const [posts, setPosts] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const { loading, error, request } = useHttp();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await request(fetchPosts);
        setPosts(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadInitialData();
  }, [request]);

  const handleLike = async (id) => {
    setUpdatingId(id);
    try {
      const updatedPost = await request(likePost, id);
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? updatedPost : p))
      );
    } catch (err) {
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Full Stack Like System</h1>
      </header>

      <main>
        <section>
          <h2>Publicaciones</h2>
          {loading && posts.length === 0 && <p className="status-msg">Cargando...</p>}
          {error && posts.length === 0 && <p className="error-msg">{error}</p>}

          <div className="posts-list">
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onLike={handleLike}
                loading={updatingId === post.id}
              />
            ))}
          </div>
        </section>

        <hr className="divider" />

        <section>
          <ContactForm />
        </section>
      </main>

      <footer>
        <p>JCH - Developer Full Stack JavaScript - 2025</p>
      </footer>
    </div>
  );
}

export default App;