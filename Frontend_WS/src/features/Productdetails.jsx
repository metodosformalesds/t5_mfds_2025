import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import Navbars from "./Navbar";



export default function ProductDetail() {
   
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // --- Obtener el producto actual ---
  useEffect(() => {
    api.get(`/products/${id}/`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => console.log(err));
  }, [id]);

  // --- Obtener productos recomendados ---
  useEffect(() => {
    api.get(`/products/featured/`)
      .then(res => setRecommended(res.data))
      .catch(err => console.log(err));
  }, []);

  // --- Añadir producto al carrito ---
  const handleAddToCart = () => {
    api.post("/cart/add/", {
      product_id: product.id,
      quantity: quantity
    })
    .then(() => alert("Producto añadido al carrito"))
    .catch(err => console.log(err));
  };

  if (loading) return <p>Cargando producto...</p>;
  
     <Navbar />
  return (
  
      
      <div className="product-detail-container">
     

        {/* -------- Breadcrumb -------- */}
        <p className="breadcrumb">
          Plant | {product.common_name}
        </p>

        <div className="product-detail">
          
          {/* -------- Galería -------- */}
          <div className="product-images">
            <img
              src={product.main_image}
              alt={product.common_name}
              className="main-image"
            />

            <div className="image-grid">
              {product.other_images?.map((img, index) => (
                <img key={index} src={img} alt={`image-${index}`} />
              ))}
            </div>
          </div>

          {/* -------- Info del producto -------- */}
          <div className="product-info">

            <h1>{product.common_name}</h1>
            <p className="price">${product.price_mxn}</p>

            <h4>Descripción:</h4>
            <p>{product.description}</p>

            <p className="shipping">Free standard shipping</p>

            {/* Dimensiones */}
            <div className="dimensions">
              <div>
                <p>Width</p>
                <input value={product.width_cm} readOnly />
              </div>
              <div>
                <p>Height</p>
                <input value={product.height_cm} readOnly />
              </div>
              <div>
                <p>Weight</p>
                <input value={product.weight_kg} readOnly />
              </div>
            </div>

            {/* Cantidad */}
            <div className="quantity-container">
              <p>Quantity</p>
              <div className="quantity-box">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
                  -
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            {/* Botón ADD TO CART */}
            <button className="add-cart-btn" onClick={handleAddToCart}>
              ADD TO CART
            </button>

          </div>
        </div>

        {/* -------- Recomendados -------- */}
        <div className="recommended-section">
          <h2>
            <span style={{ color: "#5A7F6E" }}>You'll love</span> these too...
          </h2>

          <div className="recommended-grid">
            {recommended.slice(0, 4).map(item => (
              <div key={item.id} className="recommended-card">
                <img src={item.main_image} alt={item.common_name} />

                <h3>{item.common_name}</h3>
                <p>${item.price_mxn}</p>

                <button
                  onClick={() =>
                    api.post("/cart/add/", { product_id: item.id, quantity: 1 })
                  }
                  className="buy-btn"
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

  
   
  );
}
