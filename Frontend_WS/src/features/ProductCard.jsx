/**

 * Autor: Alex Beltran Gallegos

 * Componente: ProductCard 

 * Descripción: Muestra una tarjeta individual de producto con su imagen, nombre, precio y botón de compra.

 */

import './ProductCard.css';

const ProductCard = ({ name, price, image }) => {
  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">${price}</p>
        <button className="buy-button">
          Buy
        </button>
      </div>
    </div>
  );
};

export default ProductCard;