// src/features/ProductDetail-edit.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductDetail-edit.css";
import { formatCurrency } from "./utils/formatCurrency.js";
import { useProducts } from "./hooks/useProducts.jsx";

const MAX_IMAGES = 5;

const ProductDetailEdit = () => {
  const { productId } = useParams(); // 🔥 CORREGIDO
  const navigate = useNavigate();
  const { products, updateProduct, deleteProduct } = useProducts();

  const product = products.find((p) => p.id === productId); // 🔥 CORREGIDO

  const [editing, setEditing] = React.useState(false);
  const [error, setError] = React.useState("");

  const [form, setForm] = React.useState(
    product
      ? {
          price: product.price,
          category: product.category,
          description: product.description,
        }
      : { price: 0, category: "", description: "" }
  );

  const [images, setImages] = React.useState(() => {
    if (!product) return [];
    if (product.images?.length) return product.images;
    if (product.image) return [product.image];
    return [];
  });

  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  if (!product) {
    return (
      <div className="detail-page">
        <p>Producto no encontrado</p>
        <button onClick={() => navigate(-1)}>Regresar</button>
      </div>
    );
  }

  const mainImage =
    images[selectedImageIndex] || images[0] || product.image || "";

  const sellerName = product.sellerName || "Erika";
  const phone = product.phone || "+52 656 123 4567";
  const views = product.views || 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newUrls = files.map((f) => URL.createObjectURL(f));
    setImages((prev) => {
      const combined = [...prev, ...newUrls];
      if (combined.length > MAX_IMAGES) {
        setError(`Máximo ${MAX_IMAGES} imágenes`);
        return combined.slice(0, MAX_IMAGES);
      }
      setError("");
      return combined;
    });
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!images.length) {
      setError("Debe haber al menos una imagen");
      return;
    }

    updateProduct(product.id, {
      price: Number(form.price),
      category: form.category,
      description: form.description,
      images,
      image: images[0],
    });

    setEditing(false);
  };

  const handleDeleteClick = () => {
    if (!window.confirm("¿Eliminar producto?")) return;

    deleteProduct(product.id);
    navigate("/productos/mis-publicaciones");
  };

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}>
        Regresar
      </button>

      <div className="detail-layout">
        {/* COLUMNA IMAGENES */}
        <div className="detail-image-column">
          <div className="detail-image">
            <img src={mainImage} alt={product.title} />
          </div>

          {images.length > 1 && (
            <div className="detail-thumbnails">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  className={
                    idx === selectedImageIndex
                      ? "detail-thumb active"
                      : "detail-thumb"
                  }
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFORMACIÓN */}
        <div className="detail-info">
          <h1>{product.title}</h1>

          {/* Precio */}
          <section className="detail-section">
            <h4>Precio</h4>
            {editing ? (
              <input
                className="detail-input"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
              />
            ) : (
              <div className="detail-price-box">
                {formatCurrency(product.price)}
              </div>
            )}
          </section>

          {/* Categoría */}
          <section className="detail-section">
            <h4>Categoría</h4>
            {editing ? (
              <input
                className="detail-input"
                name="category"
                value={form.category}
                onChange={handleChange}
              />
            ) : (
              <p className="detail-link">{product.category}</p>
            )}
          </section>

          {/* Descripción */}
          <section className="detail-section">
            <h4>Descripción</h4>
            {editing ? (
              <textarea
                className="detail-textarea"
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />
            ) : (
              <div className="detail-description-box">{product.description}</div>
            )}
          </section>

          {/* EDICIÓN DE IMÁGENES */}
          {editing && (
            <section className="detail-section">
              <h4>Imágenes</h4>

              <div className="detail-edit-images">
                {images.map((src, idx) => (
                  <div key={idx} className="detail-edit-thumb">
                    <img src={src} alt="" />
                    <button
                      type="button"
                      className="detail-edit-remove"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      X
                    </button>
                    <span className="detail-edit-label">
                      {idx === 0 ? "Portada" : `Imagen ${idx + 1}`}
                    </span>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <>
                    <input
                      id="detailImagesInput"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAddImages}
                      className="detail-images-input"
                    />
                    <label
                      htmlFor="detailImagesInput"
                      className="detail-add-images-btn"
                    >
                      + Agregar imágenes
                    </label>
                  </>
                )}
              </div>

              <p className="detail-images-hint">
                Puedes subir hasta {MAX_IMAGES} imágenes. La primera será la
                portada.
              </p>
            </section>
          )}

          {error && <p className="detail-error">{error}</p>}

          {/* BOTONES */}
          <div className="detail-bottom-buttons">
            {editing ? (
              <button className="detail-edit" onClick={handleSave}>
                Guardar cambios
              </button>
            ) : (
              <button className="detail-edit" onClick={() => setEditing(true)}>
                Editar
              </button>
            )}

            <button className="detail-delete" onClick={handleDeleteClick}>
              Borrar producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailEdit;
