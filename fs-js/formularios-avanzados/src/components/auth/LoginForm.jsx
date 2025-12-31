import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';

// 1. Definimos las reglas estrictas
const loginSchema = z.object({
  email: z.string().email("Escribe un email válido"),
  password: z.string().min(6, "La clave debe tener al menos 6 caracteres"),
});

export const LoginForm = () => {
  const { login } = useAuth();
  const [errorTecnico, setErrorTecnico] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema), // Aquí Zod toma el control
  });

  const onSubmit = async (data) => {
    try {
      setErrorTecnico(null);
      // data.email y data.password vienen de los inputs registrados
      await login(data.email, data.password);
    } catch (err) {
      setErrorTecnico("Error al procesar el login");
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '300px', margin: 'auto' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email_field">Email</label>
          <input 
            id="email_field"
            type="email" 
            {...register("email")} // El nombre debe ser "email"
          />
          {errors.email && <p style={{ color: 'red', fontSize: '11px' }}>{errors.email.message}</p>}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="pass_field">Contraseña</label>
          <input 
            id="pass_field"
            type="password" 
            {...register("password")} // El nombre debe ser "password"
          />
          {errors.password && <p style={{ color: 'red', fontSize: '11px' }}>{errors.password.message}</p>}
        </div>

        {errorTecnico && <p style={{ color: 'orange' }}>{errorTecnico}</p>}

        <button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
          {isSubmitting ? "Cargando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};