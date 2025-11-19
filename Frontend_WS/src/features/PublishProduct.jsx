/**
 * Autor: Carlo Lara 215661
 * Componente: Publish.jsx
 * Descripción: Componente para publicar productos usando la lógica original
 *              del backend y el diseño del antiguo PublishProduct.jsx.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import "./PublishProduct.css";
import Navbar from "./Navbar";

export default function Publish() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState({
    image1: null,
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

  // -------------------------
  // CARGAR CATEGORÍAS
  // -------------------------
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories/");
      setCategories(res.data.results || []);
    } catch (err) {
      setMessage({ text: "Error al cargar categorías", type: "error" });
    }
  };

  // -------------------------
  // HANDLERS
  // -------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) =>
      parseInt(o.value)
    );
    if (selected.length > 3) {
      setMessage({ text: "Máximo 3 categorías", type: "error" });
      return;
    }
    setForm({ ...form, category_ids: selected });
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Solo imágenes válidas", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "Máximo 5MB por imagen", type: "error" });
      return;
    }

    setImages((prev) => ({ ...prev, [field]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews((prev) => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (field) => {
    setImages((p) => ({ ...p, [field]: null }));
    setImagePreviews((p) => ({ ...p, [field]: null }));
  };

  // -------------------------
  // VALIDACIÓN
  // -------------------------
  const validateForm = () => {
    if (form.category_ids.length === 0)
      return setMessageAndFalse("Selecciona una categoría");
    if (!form.common_name.trim())
      return setMessageAndFalse("Ingresa el nombre común");
    if (!form.quantity || form.quantity <= 0)
      return setMessageAndFalse("Cantidad inválida");
    if (!form.price_mxn || form.price_mxn <= 0)
      return setMessageAndFalse("Precio inválido");
    if (!images.image1)
      return setMessageAndFalse("Debe subir al menos 1 imagen");
    return true;
  };

  const setMessageAndFalse = (txt) => {
    setMessage({ text: txt, type: "error" });
    return false;
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const fd = new FormData();

      form.category_ids.forEach((id) => fd.append("category_ids", id));
      fd.append("common_name", form.common_name);
      if (form.scientific_name) fd.append("scientific_name", form.scientific_name);
      fd.append("description", form.description || "");
      fd.append("quantity", form.quantity);
      fd.append("price_mxn", form.price_mxn);

      if (form.width_cm) fd.append("width_cm", form.width_cm);
      if (form.height_cm) fd.append("height_cm", form.height_cm);
      if (form.weight_kg) fd.append("weight_kg", form.weight_kg);

      fd.append("image1", images.image1);
      if (images.image2) fd.append("image2", images.image2);
      if (images.image3) fd.append("image3", images.image3);

      await api.post("/products/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage({ text: "Producto publicado 🎉", type: "success" });
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      const errData = err.response?.data;
      const msg =
        errData?.non_field_errors?.[0] ||
        errData?.detail ||
        Object.values(errData || {})[0] ||
        "Error al publicar";
      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // INTERFAZ (USANDO EL DISEÑO BONITO)
  // -------------------------
  return (
    <div className="publish-page">
      <header className="publish-header">
        <h1>Publicar nuevo producto</h1>
      </header>

      <form className="publish-form" onSubmit={handleSubmit}>
        {/* CATEGORÍAS */}
        <div className="publish-card">
          <label className="publish-select-wrapper">
            <span className="publish-select-label">Categorías (máx 3)</span>
            <select
              name="category_ids"
              multiple
              size="5"
              value={form.category_ids}
              onChange={handleCategoryChange}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="publish-card">
          <div className="publish-fields">

            <div className="publish-field full">
              <label>Common name</label>
              <input
                name="common_name"
                value={form.common_name}
                onChange={handleChange}
              />
            </div>

            <div className="publish-field full">
              <label>Scientific name</label>
              <input
                name="scientific_name"
                value={form.scientific_name}
                onChange={handleChange}
              />
            </div>

            <div className="publish-field full">
              <label>Quantity available</label>
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="publish-field full">
              <label>Price (MXN)</label>
              <input
                name="price_mxn"
                type="number"
                value={form.price_mxn}
                onChange={handleChange}
              />
            </div>

            <div className="publish-field third">
              <label>Width (cm)</label>
              <input
                name="width_cm"
                type="number"
                value={form.width_cm}
                onChange={handleChange}
              />
            </div>

            <div className="publish-field third">
              <label>Height (cm)</label>
              <input
                name="height_cm"
                type="number"
                value={form.height_cm}
                onChange={handleChange}
              />
            </div>

            <div className="publish-field third">
              <label>Weight (kg)</label>
              <input
                name="weight_kg"
                type="number"
                value={form.weight_kg}
                onChange={handleChange}
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div className="publish-field full">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                maxLength={500}
                value={form.description}
                onChange={handleChange}
              />
              <div className="publish-description-footer">
                <span>{form.description.length} / 500</span>
              </div>
            </div>

            {/* IMÁGENES */}
            <div className="publish-field full">
              <label>Images (máx 3)</label>

              {/* Botones de upload estilo PublishProduct */}
              <div className="publish-images-row">
                <label htmlFor="image1" className="publish-add-files">
                  📎 Imagen 1 (principal)
                </label>
                <input
                  id="image1"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "image1")}
                  className="publish-images-input"
                />

                <label htmlFor="image2" className="publish-add-files">
                  📎 Imagen 2
                </label>
                <input
                  id="image2"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "image2")}
                  className="publish-images-input"
                />

                <label htmlFor="image3" className="publish-add-files">
                  📎 Imagen 3
                </label>
                <input
                  id="image3"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(e, "image3")
                  }
                  className="publish-images-input"
                />
              </div>

              {/* PREVIEW */}
              <div className="publish-images-preview">
                {Object.entries(imagePreviews)
                  .filter(([_, v]) => v)
                  .map(([key, src], idx) => (
                    <div key={key} className="publish-thumb">
                      <img src={src} alt="" />
                      <span className="publish-thumb-label">
                        {idx === 0 ? "Portada" : `Imagen ${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => removeImage(key)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="publish-footer">
            {message.text && (
              <div
                className={`publish-error ${
                  message.type === "success" ? "success" : ""
                }`}
              >
                {message.text}
              </div>
            )}

            <button type="submit" className="publish-button">
              {loading ? "Publicando..." : "Publish Product"}
            </button>

            <p className="publish-terms">
              By sending the request you confirm that you accept our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
