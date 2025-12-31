import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import imageCompression from "browser-image-compression";
import { ListaProductos } from "./ListaProductos";
import "../styles/form.css";

const schema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  precio: z
    .number({ invalid_type_error: "El precio debe ser un número" })
    .positive("El precio debe ser positivo"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  imagen: z
    .any()
    .refine(file => file?.length === 1, "Debes subir una imagen")
});

export const CrearProductoForm = () => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [productos, setProductos] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur"
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      
      setValue("imagen", [compressedFile], { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error("Error comprimiendo imagen:", err);
    }
  };

  const onSubmit = async (data) => {
    setUploading(true);
    setServerError(null);
    const tempId = Date.now();
    
    // --- OPTIMISTIC UI ---
    const nuevoProducto = {
      id: tempId,
      nombre: data.nombre,
      precio: data.precio,
      descripcion: data.descripcion,
      preview: preview, // Usamos la previsualización actual
      isPending: true 
    };
    
    setProductos((prev) => [nuevoProducto, ...prev]);
    
    reset();
    setPreview(null);

    try {
      // Simulación de delay de red
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      const fakeId = "prod_" + Date.now();

      // Confirmar éxito en la lista
      setProductos((prev) =>
        prev.map((p) => (p.id === tempId ? { ...p, id: fakeId, isPending: false } : p))
      );

    } catch (err) {
      setProductos((prev) => prev.filter((p) => p.id !== tempId));
      setServerError("Error al procesar la solicitud.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-container">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className={`form-container ${uploading ? "form-loading" : ""}`}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Nuevo Producto</h2>

        <div className="form-group">
          <label>Nombre</label>
          <input type="text" {...register("nombre")} placeholder="Ej. Monitor 4K" />
          {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
        </div>

        <div className="form-group">
          <label>Precio (USD)</label>
          <input type="number" step="0.01" {...register("precio", { valueAsNumber: true })} />
          {errors.precio && <span className="error-msg">{errors.precio.message}</span>}
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea {...register("descripcion")} rows="3" placeholder="Detalles del producto..." />
          {errors.descripcion && <span className="error-msg">{errors.descripcion.message}</span>}
        </div>

        <div className="form-group">
          <label>Imagen</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <div style={{ marginTop: '10px' }}>
              <img src={preview} alt="Preview" style={{ width: '100px', borderRadius: '8px' }} />
            </div>
          )}
          {errors.imagen && <span className="error-msg">{errors.imagen.message}</span>}
        </div>

        {serverError && <div style={{ color: 'red', marginBottom: '10px' }}>{serverError}</div>}

        <button 
          type="submit" 
          disabled={uploading} 
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: uploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? "Creando..." : "Guardar Producto"}
        </button>
      </form>

      <div style={{ marginTop: '40px' }}>
        <ListaProductos 
          productos={productos} 
          removeProducto={(id) => setProductos(p => p.filter(x => x.id !== id))} 
        />
      </div>
    </div>
  );
};