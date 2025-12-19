import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Ckeckout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("COD");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const placeOrder = async () => {
    if (!customerName || !phone || !address) {
      alert("Please fill all details");
      return;
    }

    setLoading(true);

    const order = {
      orderNumber: Math.floor(100000 + Math.random() * 900000),
      customerName,
      phone,
      address,
      items: cart,
      total,
      paymentMode
    };

    const res = await fetch("http://localhost:4000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    const data = await res.json();
    localStorage.removeItem("cart");

    navigate(`/track/${data.id}`);
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      {/* CUSTOMER DETAILS */}
      <input
        placeholder="Customer Name"
        value={customerName}
        onChange={e => setCustomerName(e.target.value)}
      />

      <input
        placeholder="Phone Number"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <textarea
        placeholder="Delivery Address"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />

<div className="payment-section">
  <h4>Choose Payment Mode</h4>

  <label className="payment-option">
    <input
      type="radio"
      value="COD"
      checked={paymentMode === "COD"}
      onChange={() => setPaymentMode("COD")}
    />
    <span>Cash on Delivery</span>
  </label>

  <label className="payment-option">
    <input
      type="radio"
      value="ONLINE"
      checked={paymentMode === "ONLINE"}
      onChange={() => setPaymentMode("ONLINE")}
    />
    <span>Online Payment (Dummy)</span>
  </label>
</div>

      <h3>Total: ₹{total}</h3>

      <button onClick={placeOrder} disabled={loading}>
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}
