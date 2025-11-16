import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductDetail.css";
import { formatCurrency } from "../ProductsModule.jsx";

const MAX_IMAGES = 5;

const ProductDetail = ({ products, onUpdate, onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  const [editing, setEditing] = React.useState(false);
  const [error, setError] = React.useState("");

  const [form, setForm] = React.useState(() =>
    product
      ? {
          price: product.price,
          category: product.category,
          description: product.description,
        }
      : { price: 0, category: "", description: "" }
  );

  // Galería de imágenes
  const [images, setImages] = React.useState(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [];
  });

  // Índice de la imagen mostrada en grande
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  if (!product) {
    return (
      <div className="detail-page">
        <button className="detail-back" onClick={() => navigate(-1)}>
          &lt; Regresar
        </button>
        <p>Producto no encontrado.</p>
      </div>
    );
  }

  const mainImage =
    images[selectedImageIndex] || images[0] || product.image || "";

  // Datos del vendedor listos para venir del backend
  const sellerName = product.sellerName || "Erika";
  const sellerId = product.sellerId || "me";
  const phone =
    product.phone || product.sellerPhone || "+52 656 123 4567";
  const views = product.views || 17;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => {
      const combined = [...prev, ...newUrls];
      if (combined.length > MAX_IMAGES) {
        setError(`Solo puedes tener hasta ${MAX_IMAGES} imágenes.`);
        return combined.slice(0, MAX_IMAGES);
      }
      setError("");
      return combined;
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (selectedImageIndex >= updated.length) {
        setSelectedImageIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleSave = () => {
    if (images.length === 0) {
      setError("Debe existir al menos una imagen para la publicación.");
      return;
    }
    setError("");

    onUpdate(product.id, {
      price: Number(form.price),
      category: form.category,
      description: form.description,
      images,
      image: images[0],
    });
    setEditing(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm("¿Seguro que quieres borrar este producto?")) {
      onDelete(product.id);
    }
  };

  const goToSellerProfile = () => {
    navigate(`/vendedores/${sellerId}`);
  };

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}>
        &lt; Regresar
      </button>

      <div className="detail-layout">
        {/* Columna izquierda: imagen grande + miniaturas */}
        <div className="detail-image-column">
          <div className="detail-image">
            {mainImage && <img src={mainImage} alt={product.title} />}
          </div>

          {images.length > 1 && (
            <div className="detail-thumbnails">
              {images.map((src, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`detail-thumb ${
                    idx === selectedImageIndex ? "active" : ""
                  }`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={src} alt={`Miniatura ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha: info, precio, etc. */}
        <div className="detail-info">
          <h1>{product.title}</h1>

          <section className="detail-seller-card">
            <div className="detail-seller-left">
              <h4>{sellerName}</h4>
              <p>
                {product.city || "Ciudad Juárez"},{" "}
                {product.country || "Chihuahua"}
              </p>
              <p className="detail-phone">{phone}</p>

              <button className="detail-profile" onClick={goToSellerProfile}>
                Ver Perfil completo
              </button>

              <p className="detail-views">{views} vistas</p>
            </div>
          </section>

          <section className="detail-section">
            <h4>Precio unitario</h4>
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
              <div className="detail-description-box">
                {product.description || "Sin descripción"}
              </div>
            )}
          </section>

          {/* Edición de imágenes */}
          {editing && (
            <section className="detail-section">
              <h4>Imágenes</h4>
              <div className="detail-edit-images">
                {images.map((src, idx) => (
                  <div key={idx} className="detail-edit-thumb">
                    <img src={src} alt={`Imagen ${idx + 1}`} />
                    <button
                      type="button"
                      className="detail-edit-remove"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      ✕
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
                portada que se muestra en las tarjetas.
              </p>
            </section>
          )}

          {error && <div className="detail-error">{error}</div>}

          <div className="detail-bottom-buttons">
            {editing ? (
              <button className="detail-edit" onClick={handleSave}>
                Guardar cambios
              </button>
            ) : (
              <button className="detail-edit" onClick={() => setEditing(true)}>
                ✏️ Editar
              </button>
            )}

            <button className="detail-delete" onClick={handleDeleteClick}>
              🗑️ Borrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
