import ProductCard from "./ProductCard.jsx";

const NurseryCard = ({ name, location, description, products }) => {
  return (
    <div className="nursery-card">
      <div className="nursery-header">
        <h2 className="nursery-name">{name}</h2>
        <p className="nursery-location">{location}</p>
        <p className="nursery-description">{description}</p>
      </div>

      <div className="nursery-product-grid">
        {products.map((prod, i) => (
          <ProductCard key={i} {...prod} />
        ))}
      </div>
    </div>
  );
};

export default NurseryCard;