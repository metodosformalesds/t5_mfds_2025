export default function CategoryCard({ name, image }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
      <img src={image} alt={name} className="w-full h-32 object-cover" />
      <div className="p-3 text-center">
        <p className="text-gray-800 font-medium">{name}</p>
      </div>
    </div>
  );
}
