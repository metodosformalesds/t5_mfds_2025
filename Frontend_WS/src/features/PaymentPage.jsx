import React from "react";
import "./payment.css";
import axios from "axios";

const MEMBERSHIP_PLANS = [
  {
    id: "basic",
    name: "Membresía Básica",
    label: "3 Meses",
    description:
      "Ideal para comenzar: hasta 50 productos, soporte por correo y estadísticas básicas.",
    price: 400.0,
    currency: "MXN",
    qty: 1,
  },
  {
    id: "pro",
    name: "Membresía Pro",
    label: "6 Meses",
    description:
      "Para negocios en crecimiento: productos ilimitados, catálogo compartible y soporte prioritario.",
    price: 750.0,
    currency: "MXN",
    qty: 1,
  },
  {
    id: "premium",
    name: "Membresía Premium",
    label: "12 Meses",
    description:
      "Máxima visibilidad: productos ilimitados, anuncios destacados y reportes avanzados mensuales.",
    price: 1350.0,
    currency: "MXN",
    qty: 1,
  },
];

const formatCurrency = (value, currency = "MXN") => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};

const PaymentPage = ({ initialPlanId = "basic" }) => {
  const [selectedPlanId, setSelectedPlanId] = React.useState(initialPlanId);

  const selectedPlan =
    MEMBERSHIP_PLANS.find((plan) => plan.id === selectedPlanId) ||
    MEMBERSHIP_PLANS[0];

  const subtotal = selectedPlan.price * selectedPlan.qty;
  const total = subtotal;

  // ========================
  // 🔥 STRIPE CHECKOUT
  // ========================
  const handleStripeCheckout = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await axios.post(
        "http://localhost:8000/api/payments/membership/checkout/session/",
        { plan: selectedPlanId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Stripe redirige al usuario
      window.location.href = res.data.checkout_url;
    } catch (error) {
      console.error(error);
      alert("Error al iniciar pago con Stripe");
    }
  };

  return (
    <div className="checkout-page">
      {/* HEADER */}
      <header className="checkout-header">
        <h1>Pago</h1>
        <div className="checkout-header-divider" />
        <p>Completa tu pago con Stripe Checkout</p>
      </header>

      <div className="checkout-content">
        {/* IZQUIERDA */}
        <section className="checkout-left">
          <section className="payment-section">
            <h2 className="section-title">Método de Pago</h2>

            <p>
              Utilizaremos <strong>Stripe Checkout</strong>, donde podrás pagar
              con tarjeta de forma totalmente segura.
            </p>

            <button
              type="button"
              className="pay-button"
              onClick={handleStripeCheckout}
            >
              Comprar con Stripe — {formatCurrency(total)}
            </button>

            <p className="payment-note">
              Tu información no se almacena en nuestros servidores. Stripe
              procesa el pago de forma segura.
            </p>
          </section>
        </section>

        {/* DERECHA: ORDER SUMMARY */}
        <section className="checkout-right">
          <div className="order-summary-card">
            <section className="membership-section membership-in-summary">
              <h2 className="section-title">Membresía</h2>
              <p className="section-subtitle">
                Elige el plan que mejor se adapte a tu negocio.
              </p>

              <div className="membership-options">
                {MEMBERSHIP_PLANS.map((plan) => (
                  <label
                    key={plan.id}
                    className={`membership-option ${
                      plan.id === selectedPlanId ? "is-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="membership"
                      value={plan.id}
                      checked={plan.id === selectedPlanId}
                      onChange={() => setSelectedPlanId(plan.id)}
                    />
                    <div className="membership-option-body">
                      <div className="membership-option-top">
                        <span className="membership-label">{plan.label}</span>
                        <span className="membership-price">
                          {formatCurrency(plan.price)}
                        </span>
                      </div>
                      <div className="membership-name">{plan.name}</div>
                      <div className="membership-description">
                        {plan.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <h2 className="order-title">Order Summary</h2>
            <hr className="order-divider" />

            <div className="order-product-row">
              <div className="order-product-left">
                <div className="order-image-placeholder"></div>
                <div className="order-product-info">
                  <div className="order-product-name">{selectedPlan.name}</div>
                  <div className="order-product-desc">
                    {selectedPlan.label}
                  </div>
                </div>
              </div>

              <div className="order-product-right">
                <div className="order-product-price">
                  {formatCurrency(selectedPlan.price)}
                </div>
                <div className="order-product-qty">
                  Qty: {selectedPlan.qty}
                </div>
              </div>
            </div>

            <hr className="order-divider" />

            <div className="order-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <hr className="order-divider" />

            <div className="order-total-row">
              <div className="order-total-label">
                <span>Total</span>
                <span className="order-total-subtext">
                  Including estimated taxes
                </span>
              </div>
              <div className="order-total-amount">
                {formatCurrency(total)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentPage;
