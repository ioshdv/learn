export const authService = {
  login: async (email, password) => {
    // Simulamos una respuesta exitosa inmediata
    const userData = {
      email: email,
      token: "token-ficticio-123",
    };
    
    // Guardamos en el navegador
    localStorage.setItem('user_session', JSON.stringify(userData));
    return userData;
  },
  
  logout: () => {
    localStorage.removeItem('user_session');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user_session');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (e) {
      return null;
    }
  }
};