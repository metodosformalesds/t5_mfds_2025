import ProductCard from "./ProductCard";
import "./NurseryCard.css";

const NurseryCard = ({ name, location, description, products }) => {
  return (
    <div className="nursery-card">
      <div className="nursery-info">
        <h2 className="nursery-name">{name}</h2>
        <p className="nursery-location">{location}</p>
        <p className="nursery-description">{description}</p>
      </div>

      <div className="nursery-product-grid">
        {products.map((p, index) => (
          <ProductCard key={index} {...p} />
        ))}
      </div>
      <div className="nursery-footer">
        <button className="view-more-btn">
          Ver más productos
        </button>
      </div>
    </div>
  );
};

export default NurseryCard;
