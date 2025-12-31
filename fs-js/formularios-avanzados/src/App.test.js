import { render, screen } from '@testing-library/react';
import App from './App';

test('debe mostrar el formulario de login al iniciar', () => {
  render(<App />);
  
  // Buscamos el texto "Iniciar Sesión" que aparece en tu HTML
  const tituloLogin = screen.getByText(/Iniciar Sesión/i);
  
  expect(tituloLogin).toBeInTheDocument();
});