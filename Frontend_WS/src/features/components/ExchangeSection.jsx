export default function ExchangeSection() {
  return (
    <section className="bg-green-50 rounded-xl p-6 shadow mb-12">
      <h2 className="text-2xl font-semibold text-green-800 mb-4">
        Exchange Highlight 
      </h2>

      <div className="bg-white rounded-lg p-5 shadow flex flex-col sm:flex-row items-center gap-6">
        <img
          src="/exchange.jpg"
          alt="Exchange plant"
          className="w-40 h-40 object-cover rounded-xl"
        />
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-gray-800">
            Monstera Adansonii
          </h3>
          <p className="text-gray-600 mb-3 text-sm">
            Ideal para intercambio entre viveros y coleccionistas.
          </p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Offer Exchange
          </button>
        </div>
      </div>
    </section>
  );
}
