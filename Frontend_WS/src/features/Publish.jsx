import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import "./Publish.css";
import Navbar from "./Navbar";

export default function Publish() {
  const navigate = useNavigate();
  
  // Estado del formulario
  const [form, setForm] = useState({
    category_ids: [],  // ← Backend espera array de IDs
    common_name: "",
    scientific_name: "",
    quantity: "",
    price_mxn: "",
    width_cm: "",
    height_cm: "",
    weight_kg: "",
    description: "",
  });

  // Estados adicionales
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState({
    image1: null,  // ← Backend espera campos separados
    image2: null,
    image3: null,
  });
  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    image3: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [userInfo, setUserInfo] = useState(null);

  // Cargar categorías y verificar límite de productos
  useEffect(() => {
    loadCategories();
    checkProductLimit();
  }, []);

  const loadCategories = async () => {
    try {
        const res = await api.get("/categories/");
        // DRF paginado → categorías están en res.data.results
        setCategories(res.data.results || []);
    } catch (err) {
        console.error("Error al cargar categorías:", err);
        setMessage({ text: "Error al cargar categorías", type: "error" });
    }
    };


  const checkProductLimit = async () => {
    try {
      const res = await api.get("/auth/profile/");
      setUserInfo(res.data);
    } catch (err) {
      console.error("Error al verificar límite:", err);
    }
  };

  // Manejar cambios en inputs de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Manejar cambios en el select de categorías (múltiple)
  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map(option => parseInt(option.value));
    
    if (selectedIds.length > 3) {
      setMessage({ text: "Máximo 3 categorías permitidas", type: "error" });
      return;
    }
    
    setForm({ ...form, category_ids: selectedIds });
  };

  // Manejar selección de imágenes
  const handleImageChange = (e, imageField) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setMessage({ text: "Solo se permiten archivos de imagen", type: "error" });
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "La imagen no debe superar 5MB", type: "error" });
      return;
    }

    // Actualizar imagen
    setImages(prev => ({ ...prev, [imageField]: file }));

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews(prev => ({ ...prev, [imageField]: reader.result }));
    };
    reader.readAsDataURL(file);

    setMessage({ text: "", type: "" });
  };

  // Remover imagen
  const removeImage = (imageField) => {
    setImages(prev => ({ ...prev, [imageField]: null }));
    setImagePreviews(prev => ({ ...prev, [imageField]: null }));
  };

  // Validar formulario
  const validateForm = () => {
    if (form.category_ids.length === 0) {
      setMessage({ text: "Selecciona al menos una categoría", type: "error" });
      return false;
    }
    if (!form.common_name.trim()) {
      setMessage({ text: "Ingresa el nombre común", type: "error" });
      return false;
    }
    if (!form.quantity || form.quantity <= 0) {
      setMessage({ text: "Ingresa una cantidad válida", type: "error" });
      return false;
    }
    if (!form.price_mxn || form.price_mxn <= 0) {
      setMessage({ text: "Ingresa un precio válido", type: "error" });
      return false;
    }
    if (!images.image1) {
      setMessage({ text: "Agrega al menos una imagen", type: "error" });
      return false;
    }
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      
      // Agregar category_ids como JSON array
      form.category_ids.forEach(id => {
        formData.append("category_ids", id);
      });
      
      // Agregar campos del formulario
      formData.append("common_name", form.common_name);
      
      if (form.scientific_name) {
        formData.append("scientific_name", form.scientific_name);
      }
      
      formData.append("description", form.description || "");
      formData.append("quantity", form.quantity);
      formData.append("price_mxn", form.price_mxn);
      
      if (form.width_cm) formData.append("width_cm", form.width_cm);
      if (form.height_cm) formData.append("height_cm", form.height_cm);
      if (form.weight_kg) formData.append("weight_kg", form.weight_kg);

      // Agregar imágenes (image1 es requerida)
      formData.append("image1", images.image1);
      
      if (images.image2) {
        formData.append("image2", images.image2);
      }
      
      if (images.image3) {
        formData.append("image3", images.image3);
      }

      // Enviar al backend
      const res = await api.post("/products/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ 
        text: "✅ Producto publicado exitosamente", 
        type: "success" 
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error("Error al publicar producto:", err);
      
      // Manejar errores específicos del backend
      const errorData = err.response?.data;
      
      let errorMsg = "Error al publicar el producto";
      
      if (errorData) {
        if (errorData.non_field_errors) {
          errorMsg = errorData.non_field_errors[0];
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (typeof errorData === 'object') {
          // Mostrar el primer error encontrado
          const firstError = Object.values(errorData)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      
      setMessage({ text: `❌ ${errorMsg}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const handleReset = () => {
    setForm({
      category_ids: [],
      common_name: "",
      scientific_name: "",
      quantity: "",
      price_mxn: "",
      width_cm: "",
      height_cm: "",
      weight_kg: "",
      description: "",
    });
    setImages({
      image1: null,
      image2: null,
      image3: null,
    });
    setImagePreviews({
      image1: null,
      image2: null,
      image3: null,
    });
    setMessage({ text: "", type: "" });
  };

  return (
    <div className="publish-container">
      {/* Header de la página */}
      <header className="publish-header">
        <h1>Publicar nuevo producto</h1>
        {userInfo && (
          <p className="product-limit-info">
            📦 Límite: {userInfo.product_limit} productos
            {userInfo.is_premium && " (Premium)"}
          </p>
        )}
      </header>

      {/* Formulario */}
      <form className="publish-form" onSubmit={handleSubmit}>
        
        {/* Categorías (múltiple selección) */}
        <div className="form-group">
          <label htmlFor="category_ids">Categorías * (máximo 3)</label>
          <select
            id="category_ids"
            name="category_ids"
            multiple
            value={form.category_ids.map(String)}
            onChange={handleCategoryChange}
            required
            size="5"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <small className="help-text">
            Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples
          </small>
        </div>

        {/* Nombre común */}
        <div className="form-group">
          <label htmlFor="common_name">Common name *</label>
          <input
            type="text"
            id="common_name"
            name="common_name"
            placeholder="Ej: Monstera Deliciosa"
            value={form.common_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Nombre científico */}
        <div className="form-group">
          <label htmlFor="scientific_name">Scientific name</label>
          <input
            type="text"
            id="scientific_name"
            name="scientific_name"
            placeholder="Ej: Monstera deliciosa"
            value={form.scientific_name}
            onChange={handleChange}
          />
        </div>

        {/* Cantidad disponible */}
        <div className="form-group">
          <label htmlFor="quantity">Quantity available *</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            placeholder="Ej: 10"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </div>

        {/* Precio */}
        <div className="form-group">
          <label htmlFor="price_mxn">Precio (MXN) *</label>
          <input
            type="number"
            id="price_mxn"
            name="price_mxn"
            placeholder="Ej: 250.00"
            min="0"
            step="0.01"
            value={form.price_mxn}
            onChange={handleChange}
            required
          />
        </div>

        {/* Dimensiones */}
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="width_cm">Width (cm)</label>
            <input
              type="number"
              id="width_cm"
              name="width_cm"
              placeholder="Ancho"
              min="0"
              step="0.1"
              value={form.width_cm}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="height_cm">Height (cm)</label>
            <input
              type="number"
              id="height_cm"
              name="height_cm"
              placeholder="Alto"
              min="0"
              step="0.1"
              value={form.height_cm}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight_kg">Weight (kg)</label>
            <input
              type="number"
              id="weight_kg"
              name="weight_kg"
              placeholder="Peso"
              min="0"
              step="0.01"
              value={form.weight_kg}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe tu producto..."
            rows="5"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* Imágenes */}
        <div className="form-group">
          <label>Imágenes * (máximo 3)</label>
          
          {/* Imagen 1 (requerida) */}
          <div className="image-upload-item">
            <label className="image-label">Imagen 1 (principal) *</label>
            <div className="image-upload-wrapper">
              {!imagePreviews.image1 ? (
                <label htmlFor="image1" className="btn-add-files">
                  📷 Agregar Imagen 1
                </label>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreviews.image1} alt="Preview 1" className="image-preview" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => removeImage('image1')}
                  >
                    ❌ Quitar
                  </button>
                </div>
              )}
              <input
                type="file"
                id="image1"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'image1')}
                style={{ display: "none" }}
                required
              />
            </div>
          </div>

          {/* Imagen 2 (opcional) */}
          <div className="image-upload-item">
            <label className="image-label">Imagen 2 (opcional)</label>
            <div className="image-upload-wrapper">
              {!imagePreviews.image2 ? (
                <label htmlFor="image2" className="btn-add-files">
                  📷 Agregar Imagen 2
                </label>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreviews.image2} alt="Preview 2" className="image-preview" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => removeImage('image2')}
                  >
                    ❌ Quitar
                  </button>
                </div>
              )}
              <input
                type="file"
                id="image2"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'image2')}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Imagen 3 (opcional) */}
          <div className="image-upload-item">
            <label className="image-label">Imagen 3 (opcional)</label>
            <div className="image-upload-wrapper">
              {!imagePreviews.image3 ? (
                <label htmlFor="image3" className="btn-add-files">
                  📷 Agregar Imagen 3
                </label>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreviews.image3} alt="Preview 3" className="image-preview" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => removeImage('image3')}
                  >
                    ❌ Quitar
                  </button>
                </div>
              )}
              <input
                type="file"
                id="image3"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'image3')}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Mensaje de error/éxito */}
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Botones */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-publish-product"
            disabled={loading}
          >
            {loading ? "Publicando..." : "Publish Product"}
          </button>
          
          <button
            type="button"
            className="btn-reset"
            onClick={handleReset}
            disabled={loading}
          >
            Limpiar
          </button>
        </div>

        {/* Términos */}
        <p className="terms-text">
          By sending the request you can confirm that you accept our{" "}
          <a href="/terms">Terms of Service</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
}