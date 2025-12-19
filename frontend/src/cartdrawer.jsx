import { useNavigate } from "react-router-dom";
import "./cartdrawer.css";

export default function CartDrawer({ isOpen, onClose, cartItems, onRemove }) {
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    localStorage.setItem("cart", JSON.stringify(cartItems));
    navigate("/checkout");
    onClose();
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
      {/* Header */}
      <div className="cart-header">
        <h3>Your Cart</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* Body */}
      <div className="cart-body">
        {cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img
                src={`http://localhost:4000${item.imageUrl}`}
                alt={item.name}
              />
              <div className="item-info">
                <p className="item-name">{item.name}</p>
                <p className="item-quantity">
                  ₹{item.price} × {item.quantity}
                </p>
                <p className="item-price">
                  ₹{item.price * item.quantity}
                </p>
              </div>
              <button
                className="remove-btn"
                onClick={() => onRemove(item.id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="cart-footer">
          <p className="cart-total">Total: ₹{total}</p>
          <button className="checkout-btn" onClick={handleCheckout}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
