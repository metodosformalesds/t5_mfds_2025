// src/features/PublishProduct.jsx
import React from "react";
import "./PublishProduct.css";
import { useNavigate } from "react-router-dom";
import { useProducts } from "./hooks/useProducts.jsx";

const MAX_IMAGES = 3;

const PublishProduct = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts();

  const [form, setForm] = React.useState({
    category: "",
    commonName: "",
    scientificName: "",
    quantity: "",
    price: "",
    width: "",
    height: "",
    weight: "",
    description: "",
  });

  const [images, setImages] = React.useState([]);
  const [error, setError] = React.useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newUrls = files.map((file) => URL.createObjectURL(file));

    setImages((prev) => {
      const combined = [...prev, ...newUrls];
      if (combined.length > MAX_IMAGES) {
        setError(`Solo puedes subir hasta ${MAX_IMAGES} imágenes.`);
        return combined.slice(0, MAX_IMAGES);
      }
      setError("");
      return combined;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      category,
      commonName,
      scientificName,
      quantity,
      price,
      width,
      height,
      weight,
      description,
    } = form;

    if (
      !category ||
      !commonName ||
      !scientificName ||
      !quantity ||
      !price ||
      !width ||
      !height ||
      !weight ||
      !description ||
      images.length === 0
    ) {
      setError(
        `Por favor completa todos los campos y agrega al menos una imagen.`
      );
      return;
    }

    const mainImage = images[0];

    createProduct({
      title: commonName,
      commonName,
      scientificName,
      quantity: Number(quantity || 0),
      price: Number(price),
      width: Number(width || 0),
      height: Number(height || 0),
      weight: Number(weight || 0),
      description,
      category,
      image: mainImage,
      images,
    });

    setForm({
      category: "",
      commonName: "",
      scientificName: "",
      quantity: "",
      price: "",
      width: "",
      height: "",
      weight: "",
      description: "",
    });
    setImages([]);

    navigate("/productos/mis-publicaciones");
  };

  return (
    <div className="publish-page">
      <header className="publish-header">
        <h1>Publicar nuevo producto</h1>
      </header>

      <form className="publish-form" onSubmit={handleSubmit}>
        {/* Select categoría */}
        <div className="publish-card">
          <label className="publish-select-wrapper">
            <span className="publish-select-label">Category</span>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Seleccionar categoría</option>
              <option value="Indoor plants">Indoor plants</option>
              <option value="Outdoor plants">Outdoor plants</option>
              <option value="Seeds">Seeds</option>
            </select>
          </label>
        </div>

        {/* FORMULARIO PRINCIPAL */}
        <div className="publish-card">
          <div className="publish-fields">

            {/* Common Name */}
            <div className="publish-field full">
              <label>Common name</label>
              <input
                name="commonName"
                value={form.commonName}
                onChange={handleChange}
                placeholder="Ej. Rosa"
              />
            </div>

            {/* Scientific Name */}
            <div className="publish-field full">
              <label>Scientific name</label>
              <input
                name="scientificName"
                value={form.scientificName}
                onChange={handleChange}
                placeholder="Ej. Rosa spp."
              />
            </div>

            {/* Quantity */}
            <div className="publish-field full">
              <label>Quantity available</label>
              <input
                name="quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Ej. 10"
              />
            </div>

            {/* Price */}
            <div className="publish-field full">
              <label>Price (MXN)</label>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="Ej. 200"
              />
            </div>

            {/* Width */}
            <div className="publish-field third">
              <label>Width (cm)</label>
              <input
                name="width"
                type="number"
                min="0"
                value={form.width}
                onChange={handleChange}
              />
            </div>

            {/* Height */}
            <div className="publish-field third">
              <label>Height (cm)</label>
              <input
                name="height"
                type="number"
                min="0"
                value={form.height}
                onChange={handleChange}
              />
            </div>

            {/* Weight */}
            <div className="publish-field third">
              <label>Weight (cm)</label>
              <input
                name="weight"
                type="number"
                min="0"
                value={form.weight}
                onChange={handleChange}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="publish-field full">
              <label>Description</label>

              <div className="publish-description-wrapper">
                <textarea
                  name="description"
                  rows="4"
                  maxLength={500}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe tu producto (máx. 500 caracteres)"
                />

                <div className="publish-description-toolbar">
                  <button type="button" className="toolbar-btn">😊</button>
                  <button type="button" className="toolbar-btn">B</button>
                  <button type="button" className="toolbar-btn">I</button>
                  <button type="button" className="toolbar-btn">•</button>
                  <button type="button" className="toolbar-btn">🔗</button>
                </div>

                <div className="publish-description-footer">
                  <span>Maximum 500 characters</span>
                  <span>{form.description.length} / 500</span>
                </div>
              </div>
            </div>

            {/* IMAGES */}
            <div className="publish-field full">
              <label>Images</label>
              <div className="publish-images-row">
                <input
                  id="imagesInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="publish-images-input"
                />
                <label htmlFor="imagesInput" className="publish-add-files">
                  <span className="publish-add-icon">📎</span>
                  <span>Add files</span>
                </label>

                {images.length > 0 && (
                  <span className="publish-files-count">
                    {images.length} / {MAX_IMAGES} imágenes
                  </span>
                )}
              </div>

              {images.length > 0 && (
                <div className="publish-images-preview">
                  {images.map((src, idx) => (
                    <div key={idx} className="publish-thumb">
                      <img src={src} alt={`Imagen ${idx + 1}`} />
                      <span className="publish-thumb-label">
                        {idx === 0 ? "Portada" : `Imagen ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* FOOTER DEL FORMULARIO */}
          <div className="publish-footer">
            {error && <div className="publish-error">{error}</div>}

            <hr className="publish-divider" />

            <button type="submit" className="publish-button">Publish Product</button>

            <p className="publish-terms">
              By sending the request you confirm that you accept our{" "}
              <a href="#" className="publish-link">Terms of Service</a> and{" "}
              <a href="#" className="publish-link">Privacy Policy</a>.
            </p>
          </div>

        </div>
      </form>
    </div>
  );
};

export default PublishProduct;
