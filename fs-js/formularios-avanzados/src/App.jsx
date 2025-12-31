import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { CrearProductoForm } from "./components/CrearProductoForm";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { useAuth } from "./context/AuthContext";
import "./styles/form.css";

// Navbar que reacciona al estado de la sesión
const Navbar = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      background: '#2c3e50', 
      color: 'white',
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem' 
    }}>
      <strong>🛍️ Product Admin Professional</strong>
      <div>
        <span style={{ marginRight: '1rem' }}>{user.email}</span>
        <button 
          onClick={logout}
          style={{ 
            background: '#e74c3c', 
            border: 'none', 
            color: 'white', 
            padding: '5px 10px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

function AppContent() {
  return (
    <div className="App">
      <Navbar />
      <div className="container">
        <ProtectedRoute>
          <h1 style={{ textAlign: 'center' }}>Gestión de Productos con Métricas</h1>
          <CrearProductoForm />
        </ProtectedRoute>
      </div>
      {/* Requerimiento: Server performance metrics */}
      <PerformanceMonitor />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;