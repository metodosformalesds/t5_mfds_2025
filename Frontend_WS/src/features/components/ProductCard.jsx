export default function ProductCard({ name, price, image }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition">
      <img src={image} alt={name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-800">{name}</h3>
        <p className="text-green-700 font-bold mt-1">${price}</p>
        <button className="mt-3 w-full bg-green-500 text-white py-1 rounded-md hover:bg-green-600">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
