import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export default function Register() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await doRegister(data);
      navigate('/');
    } catch {
      setError('root', { message: 'No se pudo registrar' });
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Nombre</label>
          <input {...register('nombre')} />
          {errors.nombre && <p>{errors.nombre.message}</p>}
        </div>

        <div>
          <label>Email</label>
          <input {...register('email')} />
          {errors.email && <p>{errors.email.message}</p>}
        </div>

        <div>
          <label>Password</label>
          <input type="password" {...register('password')} />
          {errors.password && <p>{errors.password.message}</p>}
        </div>

        {errors.root && <p>{errors.root.message}</p>}

        <button disabled={isSubmitting} type="submit">
          Crear cuenta
        </button>
      </form>

      <p>
        ¿Ya tienes cuenta? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
