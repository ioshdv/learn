import React, { useState, useEffect } from "react";
import { useHttp } from "../hooks/useHttp";
import { submitContact } from "../services/postService";

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
  // REQUERIMIENTO: Gestión de estados con hook personalizado
  const { loading, error, request, clearError } = useHttp();

  /**
   * REQUERIMIENTO: Implementar validación en tiempo real.
   * Se ejecuta cada vez que el usuario escribe en el formulario.
   */
  useEffect(() => {
    const newErrors = {};
    if (formData.name && formData.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres.";
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingrese un correo electrónico válido.";
    }
    setErrors(newErrors);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (success) setSuccess(false);
  };

  /**
   * REQUERIMIENTO: Enviar datos al backend con manejo de errores y confirmación.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await request(submitContact, formData);
      // REQUERIMIENTO: Mostrar confirmación de envío exitoso
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      // El error ya es capturado y expuesto por useHttp
      console.error("Fallo en el envío del formulario");
    }
  };

  return (
    <section className="contact-section">
      <h3>Formulario de Contacto</h3>
      
      {success && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✅ ¡Confirmación de envío exitoso!
        </p>
      )}
      
      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ❌ Error: {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre"
            disabled={loading}
          />
          {errors.name && <small style={{ color: "orange" }}>{errors.name}</small>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            disabled={loading}
          />
          {errors.email && <small style={{ color: "orange" }}>{errors.email}</small>}
        </div>

        <div className="form-group">
          <label>Mensaje:</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Escribe tu mensaje..."
            disabled={loading}
          />
        </div>

        {/* REQUERIMIENTO: Mostrar indicadores visuales durante peticiones */}
        <button 
          className="submit-button"
          type="submit" 
          disabled={loading || Object.keys(errors).length > 0 || !formData.email || !formData.name}
        >
          {loading ? "Enviando Datos..." : "Enviar Datos"}
        </button>
      </form>
    </section>
  );
};

export default ContactForm;