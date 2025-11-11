import ProductCard from "./ProductCard";

export default function NurseryCard({ name, location, avatar, catalog }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow transition hover:shadow-lg">
      {/* Header del vivero */}
      <div className="flex items-center mb-5">
        <img
          src={avatar || "/default-avatar.png"}
          alt={name}
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div>
          <p className="font-semibold text-gray-800">{name}</p>
          <p className="text-xs text-gray-500">{location}</p>
        </div>
      </div>

      {/* Catálogo de plantas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {catalog.map((plant, i) => (
          <ProductCard key={i} {...plant} />
        ))}
      </div>
    </div>
  );
}
