
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import "./ShoppingCar.css";
import { Trash2, Plus, Minus, Import } from "lucide-react";
import Navbar from "./Navbar";


export default function ShoppingCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
   
   
  // Cargar carrito al inicio
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
  try {
    const response = await api.get("/cart/");
    setCart({
      ...response.data,
      items: Array.isArray(response.data.items) ? response.data.items : []
    });
  } catch (error) {
    console.error("Error cargando carrito:", error);
  } finally {
    setLoading(false);
  }
};


  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;

    try {
      const response = await api.put(`/cart/update/${productId}/`, {
        quantity: newQty,
      });
     setCart({
  ...response.data,
  items: Array.isArray(response.data.items) ? response.data.items : []
});

    } catch (error) {
      console.error("Error actualizando cantidad:", error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}/`);
      setCart({
  ...response.data,
  items: Array.isArray(response.data.items) ? response.data.items : []
});

    } catch (error) {
      console.error("Error eliminando item:", error);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart/clear/");
      loadCart();
    } catch (error) {
      console.error("Error limpiando carrito:", error);
    }
  };
  if (loading) return <p>Cargando carrito...</p>;

if (!cart || !Array.isArray(cart.items) || cart.items.length === 0)
  return (
    <>
      
      <header className="shop-header">
        <h1>Shopping Car</h1>
        <p>Buy the perfect plant for your space</p>
      </header>

      <div className="cart-empty">
        <h2>Tu carrito está vacío 🛒</h2>
        <button onClick={() => navigate("/shop")}>Ver productos</button>
      </div>
    </>
  );



    return (
        <><Navbar />
        
              {/* 
              HEADER DE LA PÁGINA
            */}
              <header className="shop-header">
                <h1>Shoppin Car</h1>
                <p>Buy the perfect plant for your space</p>
              </header>
        <div className="cart-empty">
            <h2>Tu carrito está vacío 🛒</h2>
            <button onClick={() => navigate("/shop")}>
                Ver productos
            </button>
        </div></>
    );

  return (
    
    
    <div className="cart-container">
      <h1>🛒 Tu Carrito</h1>

      <div className="cart-items">
        {cart.items.map((item) => (
          <CartItem
            key={item.product_id}
            item={item}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
          />
        ))}
      </div>

      <div className="cart-summary">
        <h3>Total de artículos: {cart.total_items || cart.items.reduce((sum, i) => sum + i.quantity, 0)}</h3>

        <button className="clear-cart-btn" onClick={clearCart}>
          Vaciar carrito
        </button>

        <button className="checkout-btn" onClick={() => navigate("/checkout")}>
          Proceder al Pago
        </button>
      </div>
    </div>
  );
}


// Componente item del carrito

function CartItem({ item, updateQuantity, removeItem }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const response = await api.get(`/products/${item.product_id}/`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error cargando producto:", error);
    }
  };

  if (!product) return <p>Cargando producto...</p>;

  return (
    
    <div className="cart-item">
      <img
        src={product.main_image}
        alt={product.common_name}
        className="cart-item-img"
      />

      <div className="cart-item-info">
        <h3>{product.common_name}</h3>
        <p>${product.price_mxn} MXN</p>

        <div className="cart-qty-controls">
          <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
            <Minus />
          </button>

          <span>{item.quantity}</span>

          <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
            <Plus />
          </button>
        </div>

        <button className="remove-btn" onClick={() => removeItem(item.product_id)}>
          <Trash2 size={18} /> Eliminar
        </button>
      </div>
    </div>
  );
}
