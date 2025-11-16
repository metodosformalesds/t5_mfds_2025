import React from "react";
import "./payment.css";

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
  const [paymentMethod, setPaymentMethod] = React.useState("card");

  const [cardData, setCardData] = React.useState({
    cardNumber: "",
    country: "Mexico",
    exp: "",
    cvv: "",
    saveCard: false,
  });

  const [paypalData, setPaypalData] = React.useState({
    email: "",
    fullName: "",
  });

  const selectedPlan =
    MEMBERSHIP_PLANS.find((plan) => plan.id === selectedPlanId) ||
    MEMBERSHIP_PLANS[0];

  const shipping = 0;
  const subtotal = selectedPlan.price * selectedPlan.qty;
  const total = subtotal + shipping;

  const handleCardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePaypalChange = (e) => {
    const { name, value } = e.target;
    setPaypalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePay = (e) => {
    e.preventDefault();

    if (paymentMethod === "card" && cardData.saveCard) {
      // Guarda detalles de tarjeta en localStorage (prototipo front)
      localStorage.setItem(
        "savedCardDetails",
        JSON.stringify({
          cardNumber: cardData.cardNumber,
          country: cardData.country,
          exp: cardData.exp,
          cvv: cardData.cvv,
        })
      );
    }

    // Aquí luego puedes llamar a tu backend / Stripe, etc.
    console.log("Pay with:", paymentMethod);
  };

  return (
    <div className="checkout-page">
      {/* HEADER */}
      <header className="checkout-header">
        <h1>Pago</h1>
        <div className="checkout-header-divider" />
        <p>Completa tu perfil</p>
      </header>

      <div className="checkout-content">
        {/* IZQUIERDA: PAYMENT */}
        <section className="checkout-left">
          <section className="payment-section">
            <h2 className="section-title">Payment</h2>

            {/* PAY WITH */}
            <div className="payment-methods">
              <p className="payment-method-title">Pay With:</p>
              <div className="payment-method-options">
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  Card
                </label>
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                  />
                  Paypal
                </label>
              </div>
            </div>

            <form onSubmit={handlePay}>
              {/* FORMULARIO SEGÚN MÉTODO */}
              {paymentMethod === "card" ? (
                <div className="form-grid">
                  <div className="form-group full">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      placeholder="1234 5678 9101 1121"
                      value={cardData.cardNumber}
                      onChange={handleCardChange}
                    />
                  </div>

                  <div className="form-group full">
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      placeholder="Mexico"
                      value={cardData.country}
                      onChange={handleCardChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="exp">Expiration Date</label>
                    {/* Selector de mes/año */}
                    <input
                      id="exp"
                      name="exp"
                      type="month"
                      value={cardData.exp}
                      onChange={handleCardChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      id="cvv"
                      name="cvv"
                      type="text"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                    />
                  </div>

                  <label className="save-card full">
                    <input
                      type="checkbox"
                      name="saveCard"
                      checked={cardData.saveCard}
                      onChange={handleCardChange}
                    />
                    Save card details
                  </label>
                </div>
              ) : (
                <div className="paypal-form">
                  <div className="form-group full">
                    <label htmlFor="paypalEmail">Paypal Email</label>
                    <input
                      id="paypalEmail"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={paypalData.email}
                      onChange={handlePaypalChange}
                    />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="paypalName">Full Name</label>
                    <input
                      id="paypalName"
                      name="fullName"
                      type="text"
                      placeholder="Nombre completo"
                      value={paypalData.fullName}
                      onChange={handlePaypalChange}
                    />
                  </div>
                  <p className="paypal-note">
                    Serás redirigido a Paypal para completar tu pago de forma
                    segura.
                  </p>
                </div>
              )}

              <button type="submit" className="pay-button">
                Pagar {formatCurrency(total, selectedPlan.currency)}
              </button>

              <p className="payment-note">
                Your personal data will be used to process your order, support
                your experience throughout this website, and for other purposes
                described in our privacy policy.
              </p>
            </form>
          </section>
        </section>

        {/* DERECHA: MEMBRESÍA + ORDER SUMMARY */}
        <section className="checkout-right">
          <div className="order-summary-card">
            <section className="membership-section membership-in-summary">
              <h2 className="section-title">Membresía</h2>
              <p className="section-subtitle">
                Elige el plan que mejor se adapte a tu negocio. El resumen se
                actualizará automáticamente.
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
                          {formatCurrency(plan.price, plan.currency)}
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
                  {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                </div>
                <div className="order-product-qty">
                  Qty: {selectedPlan.qty}
                </div>
              </div>
            </div>

            <hr className="order-divider" />

            <div className="order-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, selectedPlan.currency)}</span>
            </div>
            <div className="order-row">
              <span>Shipping</span>
              <span>
                {shipping === 0
                  ? "Free"
                  : formatCurrency(shipping, selectedPlan.currency)}
              </span>
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
                {formatCurrency(total, selectedPlan.currency)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentPage;
