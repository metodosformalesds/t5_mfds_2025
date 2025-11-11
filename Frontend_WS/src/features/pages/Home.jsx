import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import NurseryCard from "../components/NurseryCard";
import ExchangeSection from "../components/ExchangeSection";
import Footer from "../components/Footer";

const featuredCategories = [
  { name: "Indoor Plants", image: "/plants1.jpg" },
  { name: "Succulents", image: "/succulent.jpg" },
  { name: "Pots", image: "/pots.jpg" },
];

const featuredProducts = [
  { name: "Monstera Deliciosa", price: "25.00", image: "/monstera.jpg" },
  { name: "Cactus", price: "15.00", image: "/cactus.jpg" },
  { name: "Ceramic Pot", price: "10.00", image: "/pot.jpg" },
];

// Datos simulados de viveros
const nurseries = [
  {
    name: "Vivero Tu espacio verde",
    location: "Ciudad Juárez, Chihuahua",
    avatar: "/nursery1.jpg",
    catalog: [
      { name: "String of Hearts", price: "35.00", image: "/plant1.jpg" },
      { name: "Red Secret Alocasia", price: "35.00", image: "/plant2.jpg" },
      { name: "Jewel Alocasia", price: "35.00", image: "/plant3.jpg" },
      { name: "Hoya Retusa", price: "35.00", image: "/plant4.jpg" },
    ],
  },
  {
    name: "Green Haven",
    location: "Guadalajara, Jalisco",
    avatar: "/nursery2.jpg",
    catalog: [
      { name: "Ficus Lyrata", price: "40.00", image: "/ficus.jpg" },
      { name: "Snake Plant", price: "25.00", image: "/snake.jpg" },
      { name: "Peace Lily", price: "30.00", image: "/lily.jpg" },
      { name: "ZZ Plant", price: "28.00", image: "/zz.jpg" },
    ],
  },
  {
    name: "La Casa del Cactus",
    location: "Puebla, Puebla",
    avatar: "/nursery3.jpg",
    catalog: [
      { name: "Golden Barrel", price: "20.00", image: "/cactus1.jpg" },
      { name: "Echeveria", price: "15.00", image: "/echeveria.jpg" },
      { name: "Aloe Vera", price: "18.00", image: "/aloe.jpg" },
      { name: "Haworthia", price: "22.00", image: "/haworthia.jpg" },
    ],
  },
];

export default function Home() {
  return (
    <>
      <div className="px-10 py-8 text-center bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-green-100 to-green-200 py-24 text-center rounded-2xl shadow-inner mb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-green-800 leading-tight">
              Cultiva conexiones,<br /> intercambia vida
            </h1>
            <p className="text-gray-700 mt-6 text-lg md:text-xl max-w-2xl mx-auto">
              Explora plantas, macetas y artículos sostenibles compartidos por tu comunidad.
            </p>

            {/* Botón de registro */}
            <div className="mt-10">
              <a
                href="/register"
                className="inline-block bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-md hover:bg-green-700 hover:scale-105 transform transition"
              >
                ¡Únete ahora!
              </a>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Categorías destacadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
            {featuredCategories.map((cat, i) => (
              <CategoryCard key={i} {...cat} />
            ))}
          </div>
        </section>

        {/* Products */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Productos más populares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
            {featuredProducts.map((prod, i) => (
              <ProductCard key={i} {...prod} />
            ))}
          </div>
        </section>

        {/* Nursery Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-green-800">
              Nursery <span className="text-gray-800">featured</span>
            </h2>
            <a href="#" className="text-sm text-green-700 font-medium hover:underline">
              View All →
            </a>
          </div>

          <div className="space-y-10">
            {nurseries.map((nursery, i) => (
              <NurseryCard key={i} {...nursery} />
            ))}
          </div>
        </section>

        {/* Exchange Section */}
        <ExchangeSection />
      </div>

      {/* Footer fuera del contenedor principal */}
      <Footer />
    </>
  );
}

