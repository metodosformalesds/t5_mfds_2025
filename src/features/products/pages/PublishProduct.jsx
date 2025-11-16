// src/features/products/pages/PublishProduct.jsx
import React from "react";
import "./PublishProduct.css";

const MAX_IMAGES = 5;

const PublishProduct = ({ onCreate }) => {
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

  // Guardamos URLs (objectURL) de las imágenes
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

    // Validar campos + al menos 1 imagen
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
        `Por favor completa todos los campos y agrega al menos una imagen (máximo ${MAX_IMAGES}).`
      );
      return;
    }

    setError("");

    // La primera imagen es la portada
    const mainImage = images[0];

    onCreate({
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
      image: mainImage, // portada (cards)
      images, // galería
    });

    // Reset
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
  };

  return (
    <div className="publish-page">
      <header className="publish-header">
        <h1>Publicar nuevo producto</h1>
      </header>

      <form className="publish-form" onSubmit={handleSubmit}>
        {/* Select de categoría */}
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

        {/* Formulario principal */}
        <div className="publish-card">
          <div className="publish-fields">
            <div className="publish-field full">
              <label>Common name</label>
              <input
                name="commonName"
                value={form.commonName}
                onChange={handleChange}
                placeholder="Ej. Rosa"
              />
            </div>

            <div className="publish-field full">
              <label>Scientific name</label>
              <input
                name="scientificName"
                value={form.scientificName}
                onChange={handleChange}
                placeholder="Ej. Rosa spp."
              />
            </div>

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

            {/* PRICE con indicación de $ */}
            <div className="publish-field full">
              <label>
                Price <span className="publish-unit-inline">(MXN $)</span>
              </label>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="Ej. 200"
              />
            </div>

            {/* Width / Height / Weight con cm */}
            <div className="publish-field third">
              <label>
                Width <span className="publish-unit-inline">(cm)</span>
              </label>
              <input
                name="width"
                type="number"
                min="0"
                value={form.width}
                onChange={handleChange}
              />
            </div>
            <div className="publish-field third">
              <label>
                Height <span className="publish-unit-inline">(cm)</span>
              </label>
              <input
                name="height"
                type="number"
                min="0"
                value={form.height}
                onChange={handleChange}
              />
            </div>
            <div className="publish-field third">
              <label>
                Weight <span className="publish-unit-inline">(cm)</span>
              </label>
              <input
                name="weight"
                type="number"
                min="0"
                value={form.weight}
                onChange={handleChange}
              />
            </div>

            {/* Descripción con barra inferior + contador */}
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
                  <button type="button" className="toolbar-btn">
                    😊
                  </button>
                  <button type="button" className="toolbar-btn">
                    B
                  </button>
                  <button type="button" className="toolbar-btn">
                    I
                  </button>
                  <button type="button" className="toolbar-btn">
                    •
                  </button>
                  <button type="button" className="toolbar-btn">
                    🔗
                  </button>
                </div>
                <div className="publish-description-footer">
                  <span>Maximum 500 characters</span>
                  <span>{form.description.length} / 500</span>
                </div>
              </div>
            </div>

            {/* Imágenes: botón Add files + previews */}
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

              <p className="publish-images-hint">
                Puedes subir hasta {MAX_IMAGES} imágenes. La primera será la
                portada que se mostrará en las tarjetas.
              </p>
            </div>
          </div>

          <div className="publish-footer">
            {error && <div className="publish-error">{error}</div>}

            <hr className="publish-divider" />
            <button type="submit" className="publish-button">
              Publish Product
            </button>
            <p className="publish-terms">
              By sending the request you can confirm that you accept our{" "}
              <a href="#" className="publish-link">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="publish-link">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PublishProduct;
